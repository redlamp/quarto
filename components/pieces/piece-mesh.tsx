'use client';

import { useMemo } from 'react';
import { Vector2 } from 'three';
import { Outlines, RoundedBox } from '@react-three/drei';
import { visualParamsOf, type VariantDef } from '@/lib/game/variants';
import type { Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';
import { getSoftNoiseTexture } from '@/lib/three/soft-noise-texture';

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

// Hollow plug ("gem"): rounded rim to match the pieces, plus a soft-touch
// plastic finish — clearcoat for a glossy-but-not-mirror reflection over a
// matte base, and a faint noise roughnessMap so it reads like device plastic.
const PLUG_FILLET = 0.02;
const PLUG_ROUGHNESS = 0.55;
const PLUG_CLEARCOAT = 1;
const PLUG_CLEARCOAT_ROUGHNESS = 0.25;
const PLUG_ENV_INTENSITY = 1.1;
const PLUG_SINK = 0.005;

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

// Lathe profile for a cylinder with quarter-arc fillets on both rims.
// Side stays at full `radius`; only the top + bottom edges curve in.
function roundedCylinderProfile(radius: number, height: number, fillet: number): Vector2[] {
  const pts: Vector2[] = [];
  pts.push(new Vector2(0, 0));
  pts.push(new Vector2(radius - fillet, 0));
  for (let i = 1; i <= FILLET_SEGMENTS; i++) {
    const a = (i / FILLET_SEGMENTS) * (Math.PI / 2) - Math.PI / 2;
    pts.push(new Vector2(radius - fillet + Math.cos(a) * fillet, fillet + Math.sin(a) * fillet));
  }
  for (let i = 0; i <= FILLET_SEGMENTS; i++) {
    const a = (i / FILLET_SEGMENTS) * (Math.PI / 2);
    pts.push(
      new Vector2(radius - fillet + Math.cos(a) * fillet, height - fillet + Math.sin(a) * fillet),
    );
  }
  pts.push(new Vector2(0, height));
  return pts;
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

  const cylinderProfile = useMemo(
    () => roundedCylinderProfile(radius, height, edgeRadius),
    [radius, height, edgeRadius],
  );

  const hollowSizeXZ = square ? radius * 1.15 : radius * 0.6;
  const plugDepth = p.hollowDepth * s;
  const plugProfile = useMemo(
    () => roundedCylinderProfile(hollowSizeXZ, plugDepth, PLUG_FILLET),
    [hollowSizeXZ, plugDepth],
  );
  const noiseMap = useMemo(() => getSoftNoiseTexture(), []);

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

  const renderPlugMaterial = () => (
    <meshPhysicalMaterial
      color={c.pieceHollowInset}
      roughness={PLUG_ROUGHNESS}
      roughnessMap={noiseMap ?? undefined}
      metalness={0}
      clearcoat={PLUG_CLEARCOAT}
      clearcoatRoughness={PLUG_CLEARCOAT_ROUGHNESS}
      envMapIntensity={PLUG_ENV_INTENSITY}
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
        radius={PLUG_FILLET}
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
      ) : (
        // LatheGeometry revolves a 2D profile around the Y axis. Profile gives
        // a quarter-arc fillet at the top + bottom rim while keeping the side
        // at full radius — matches the rounded-edge feel of RoundedBox without
        // tapering the silhouette into a spool shape.
        <mesh castShadow receiveShadow {...raycastProp}>
          <latheGeometry args={[cylinderProfile, RADIAL_SEGMENTS]} />
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
            radius={PLUG_FILLET}
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

      {v.hollow &&
        (square ? (
          <RoundedBox
            position={[0, height + plugDepth / 2 - PLUG_SINK, 0]}
            args={[hollowSizeXZ, plugDepth, hollowSizeXZ]}
            radius={PLUG_FILLET}
            smoothness={4}
            receiveShadow
            {...raycastProp}
          >
            {renderPlugMaterial()}
          </RoundedBox>
        ) : (
          <mesh position={[0, height - PLUG_SINK, 0]} receiveShadow {...raycastProp}>
            <latheGeometry args={[plugProfile, RADIAL_SEGMENTS]} />
            {renderPlugMaterial()}
          </mesh>
        ))}
    </group>
  );
}
