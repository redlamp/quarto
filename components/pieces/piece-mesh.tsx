'use client';

import { useMemo } from 'react';
import { ExtrudeGeometry, Path, Shape, Vector2 } from 'three';
import { Outlines, RoundedBox } from '@react-three/drei';
import { visualParamsOf, type VariantDef } from '@/lib/game/variants';
import type { Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

interface PieceMeshProps {
  variant: VariantDef;
  piece: Piece;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerOver?: (e: React.PointerEvent) => void;
  onPointerOut?: (e: React.PointerEvent) => void;
  onClick?: (e: React.PointerEvent) => void;
  ghost?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  // When false, the mesh geometry is excluded from raycasting so it can't
  // intercept pointer events meant for objects behind it (e.g. the ghost
  // preview floating over a board cell).
  interactive?: boolean;
}

const NO_RAYCAST = () => null;

const OUTLINE_THICKNESS = 0.05;
const EDGE_RADIUS = 0.06;
const SMALL_FILLET = 0.02;
const CLAY_ENV_INTENSITY = 0.35;
const RADIAL_SEGMENTS = 48;
const FILLET_SEGMENTS = 6;

// Girth trait: slim/wide radius extents (multiplies the theme radius).
const GIRTH_MIN = 0.72;
const GIRTH_MAX = 1.22;
// Band trait: one contrasting ring at the waist. Stripes trait: two thinner
// rings at 1/3 and 2/3 height — same construction, different rhythm.
const BAND_HEIGHT = 0.1;
const STRIPE_HEIGHT = 0.05;
const RING_OVERHANG = 1.1;
// Base trait: contrasting plate under the piece.
const BASE_HEIGHT = 0.05;
const BASE_OVERHANG = 1.35;

// Hue trait: warm/cool tint mixed into the tone color, so tone stays legible
// as light-orange / dark-orange / light-blue / dark-blue.
const HUE_COLORS = ['#c9772e', '#3e6fae'] as const;
const HUE_MIX = 0.55;

// Hollow trait: a real bore carved into the top (like the wooden originals) —
// round pieces get it lathed into the profile, square pieces get a solid
// lower body plus an extruded wall ring with a circular bore.
const BORE_RADIUS_ROUND = 0.55; // × outer radius
const BORE_RADIUS_SQUARE = 0.6;
const BORE_DEPTH = 0.42; // × piece height

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Mix two 6-digit hex colors in sRGB (display) space. three's Color.lerp
// interpolates in the linear working space, which crushes mid tones light.
function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((pa >> shift) & 0xff) * (1 - t) + ((pb >> shift) & 0xff) * t);
  return `#${(((ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0).toString(16).padStart(6, '0')}`;
}

// Quarter-arc helper: appends FILLET_SEGMENTS+1 points of a fillet arc
// centered at (cx, cy), sweeping from angle `from` to `to` (radians).
function arc(pts: Vector2[], cx: number, cy: number, r: number, from: number, to: number): void {
  for (let i = 0; i <= FILLET_SEGMENTS; i++) {
    const a = from + (i / FILLET_SEGMENTS) * (to - from);
    pts.push(new Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
}

// Lathe profile for a cylinder with quarter-arc fillets on both rims. When
// `bore` is set, the profile turns in at the top rim and descends into a real
// cavity instead of closing across the top.
function cylinderProfile(
  radius: number,
  height: number,
  fillet: number,
  bore: { radius: number; depth: number } | null,
): Vector2[] {
  const pts: Vector2[] = [];
  pts.push(new Vector2(0, 0));
  pts.push(new Vector2(radius - fillet, 0));
  // Bottom rim: quarter arc out to the full radius.
  arc(pts, radius - fillet, fillet, fillet, -Math.PI / 2, 0);
  // Top rim: quarter arc curving in across the top.
  arc(pts, radius - fillet, height - fillet, fillet, 0, Math.PI / 2);
  if (!bore) {
    pts.push(new Vector2(0, height));
    return pts;
  }
  // Across the rim to the bore mouth, small fillet turning down into it.
  arc(pts, bore.radius + SMALL_FILLET, height - SMALL_FILLET, SMALL_FILLET, Math.PI / 2, Math.PI);
  const floorY = height - bore.depth;
  // Down the bore wall, small fillet onto the cavity floor.
  arc(pts, bore.radius + SMALL_FILLET, floorY + SMALL_FILLET, SMALL_FILLET, Math.PI, Math.PI * 1.5);
  pts.push(new Vector2(0, floorY));
  return pts;
}

// Rounded-corner square outline with a circular hole — the wall ring of a
// hollow square piece.
function squareRingShape(half: number, corner: number, boreRadius: number): Shape {
  const shape = new Shape();
  shape.moveTo(-half + corner, -half);
  shape.lineTo(half - corner, -half);
  shape.quadraticCurveTo(half, -half, half, -half + corner);
  shape.lineTo(half, half - corner);
  shape.quadraticCurveTo(half, half, half - corner, half);
  shape.lineTo(-half + corner, half);
  shape.quadraticCurveTo(-half, half, -half, half - corner);
  shape.lineTo(-half, -half + corner);
  shape.quadraticCurveTo(-half, -half, -half + corner, -half);
  const hole = new Path();
  hole.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

export function PieceMesh({
  variant,
  piece,
  ghost = false,
  selected = false,
  dimmed = false,
  interactive = true,
  ...handlers
}: PieceMeshProps) {
  const { theme } = useTheme();
  const raycastProp = interactive ? {} : { raycast: NO_RAYCAST };
  const v = useMemo(() => visualParamsOf(variant, piece), [variant, piece]);
  const p = theme.piece;
  const c = theme.colors;
  const s = variant.worldScale;

  const height = lerp(p.heightShort, p.heightTall, v.heightT) * s;
  const girthMul = v.girthT === null ? 1 : lerp(GIRTH_MIN, GIRTH_MAX, v.girthT);
  const radius = p.radius * girthMul * s;
  const edgeRadius = Math.min(EDGE_RADIUS, radius * 0.45);
  const square = v.shape === 'square';
  const boreDepth = height * BORE_DEPTH;

  const opacity = ghost ? 0.8 : dimmed ? 0.35 : 1;
  const transparent = ghost || dimmed;

  // Tone gives the light/dark base; hue (when selected) tints it warm/cool.
  const color = useMemo(() => {
    const tone = mixHex(c.pieceLight, c.pieceDark, v.toneT);
    if (v.hueT === null) return tone;
    return mixHex(tone, HUE_COLORS[v.hueT === 0 ? 0 : 1], HUE_MIX);
  }, [c.pieceLight, c.pieceDark, v.toneT, v.hueT]);
  // Ring/base contrast: light pieces get dark accents and vice versa.
  const accentColor = v.toneT <= 0.5 ? c.pieceDark : c.pieceLight;

  const latheProfile = useMemo(
    () =>
      cylinderProfile(
        radius,
        height,
        edgeRadius,
        v.hollow ? { radius: radius * BORE_RADIUS_ROUND, depth: boreDepth } : null,
      ),
    [radius, height, edgeRadius, v.hollow, boreDepth],
  );

  // Hollow square = solid lower body + extruded wall ring. The ring overlaps
  // the body by edgeRadius so the body's top-edge fillet stays hidden behind
  // the ring's straight outer wall.
  const ringOverlap = edgeRadius;
  const bodyHeight = Math.max(height - boreDepth, edgeRadius * 2);
  const ringGeometry = useMemo(() => {
    if (!(v.hollow && square)) return null;
    const shape = squareRingShape(radius, edgeRadius, radius * BORE_RADIUS_SQUARE);
    return new ExtrudeGeometry(shape, {
      depth: height - bodyHeight + ringOverlap,
      bevelEnabled: false,
      curveSegments: 24,
    });
  }, [v.hollow, square, radius, edgeRadius, height, bodyHeight, ringOverlap]);

  const renderClayMaterial = (meshColor: string) => (
    <meshStandardMaterial
      color={meshColor}
      roughness={p.roughness}
      metalness={p.metalness}
      envMapIntensity={CLAY_ENV_INTENSITY}
      transparent={transparent}
      opacity={opacity}
    />
  );

  // A contrasting ring around the piece wall at `centerY` — band and stripes
  // share this construction.
  const renderRing = (centerY: number, ringHeight: number, key: string) =>
    square ? (
      <RoundedBox
        key={key}
        position={[0, centerY, 0]}
        args={[radius * 2 * RING_OVERHANG, ringHeight, radius * 2 * RING_OVERHANG]}
        radius={SMALL_FILLET}
        smoothness={2}
        castShadow
        receiveShadow
        {...raycastProp}
      >
        {renderClayMaterial(accentColor)}
      </RoundedBox>
    ) : (
      <mesh key={key} position={[0, centerY, 0]} castShadow receiveShadow {...raycastProp}>
        <cylinderGeometry
          args={[radius * RING_OVERHANG, radius * RING_OVERHANG, ringHeight, RADIAL_SEGMENTS]}
        />
        {renderClayMaterial(accentColor)}
      </mesh>
    );

  const outline = selected && (
    <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />
  );

  return (
    <group {...handlers}>
      {square ? (
        v.hollow && ringGeometry ? (
          <>
            <RoundedBox
              position={[0, bodyHeight / 2, 0]}
              args={[radius * 2, bodyHeight, radius * 2]}
              radius={edgeRadius}
              smoothness={4}
              castShadow
              receiveShadow
              {...raycastProp}
            >
              {renderClayMaterial(color)}
              {outline}
            </RoundedBox>
            {/* Extrusion runs along +z; rotated so it climbs +y from the top
                of the body (minus overlap) to the piece's full height. */}
            <mesh
              position={[0, bodyHeight - ringOverlap, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
              {...raycastProp}
            >
              <primitive object={ringGeometry} attach="geometry" />
              {renderClayMaterial(color)}
              {outline}
            </mesh>
          </>
        ) : (
          <RoundedBox
            position={[0, height / 2, 0]}
            args={[radius * 2, height, radius * 2]}
            radius={edgeRadius}
            smoothness={4}
            castShadow
            receiveShadow
            {...raycastProp}
          >
            {renderClayMaterial(color)}
            {outline}
          </RoundedBox>
        )
      ) : (
        // LatheGeometry revolves a 2D profile around the Y axis. Profile gives
        // a quarter-arc fillet at the top + bottom rim while keeping the side
        // at full radius; hollow pieces carve a real bore into the top.
        <mesh castShadow receiveShadow {...raycastProp}>
          <latheGeometry args={[latheProfile, RADIAL_SEGMENTS]} />
          {renderClayMaterial(color)}
          {outline}
        </mesh>
      )}

      {v.band && renderRing(height / 2, BAND_HEIGHT * s, 'band')}
      {v.stripes && (
        <>
          {renderRing(height * (1 / 3), STRIPE_HEIGHT * s, 'stripe-lo')}
          {renderRing(height * (2 / 3), STRIPE_HEIGHT * s, 'stripe-hi')}
        </>
      )}

      {v.base &&
        (square ? (
          <RoundedBox
            position={[0, (BASE_HEIGHT * s) / 2, 0]}
            args={[radius * 2 * BASE_OVERHANG, BASE_HEIGHT * s, radius * 2 * BASE_OVERHANG]}
            radius={SMALL_FILLET}
            smoothness={2}
            receiveShadow
            {...raycastProp}
          >
            {renderClayMaterial(accentColor)}
          </RoundedBox>
        ) : (
          <mesh position={[0, (BASE_HEIGHT * s) / 2, 0]} receiveShadow {...raycastProp}>
            <cylinderGeometry
              args={[
                radius * BASE_OVERHANG,
                radius * BASE_OVERHANG,
                BASE_HEIGHT * s,
                RADIAL_SEGMENTS,
              ]}
            />
            {renderClayMaterial(accentColor)}
          </mesh>
        ))}
    </group>
  );
}
