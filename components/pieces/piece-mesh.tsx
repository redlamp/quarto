'use client';

import { useMemo } from 'react';
import { Vector2 } from 'three';
import { Outlines, RoundedBox } from '@react-three/drei';
import { visualParamsOf, type ShapeKind, type VariantDef } from '@/lib/game/variants';
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

// Prism silhouettes (triangle/diamond/hexagon) via low-segment cylinders.
// Radius multipliers even out the visual mass across silhouettes — a 3-sided
// prism at the same circumradius reads much smaller than a cylinder.
const PRISM_SEGMENTS: Partial<Record<ShapeKind, number>> = { tri: 3, diamond: 4, hex: 6 };
const SHAPE_RADIUS_MUL: Record<ShapeKind, number> = {
  round: 1,
  square: 1,
  tri: 1.32,
  diamond: 1.2,
  hex: 1.06,
};

// Girth trait: slim/wide radius extents (multiplies the theme radius).
const GIRTH_MIN = 0.72;
const GIRTH_MAX = 1.22;
// Band trait: contrasting ring around the piece's waist.
const BAND_HEIGHT = 0.1;
const BAND_OVERHANG = 1.1;

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
// interpolates in the linear working space, which crushes the mid steps of
// the 3- and 5-value tone ramps toward light.
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
  const baseRadius = p.radius * girthMul * s;
  const shapeRadius = baseRadius * SHAPE_RADIUS_MUL[v.shape];
  const edgeRadius = Math.min(EDGE_RADIUS, baseRadius * 0.45);

  const opacity = ghost ? 0.8 : dimmed ? 0.35 : 1;
  const transparent = ghost || dimmed;

  // Tone: mix between the theme's light and dark piece colors so ternary and
  // 5-step tone ramps stay on the theme's palette.
  const color = useMemo(
    () => mixHex(c.pieceLight, c.pieceDark, v.toneT),
    [c.pieceLight, c.pieceDark, v.toneT],
  );
  // Band contrast: light pieces get a dark band and vice versa.
  const bandColor = v.toneT <= 0.5 ? c.pieceDark : c.pieceLight;

  const isPrism = v.shape === 'tri' || v.shape === 'diamond' || v.shape === 'hex';
  const prismSegments = PRISM_SEGMENTS[v.shape] ?? RADIAL_SEGMENTS;

  const cylinderProfile = useMemo(
    () => roundedCylinderProfile(shapeRadius, height, edgeRadius),
    [shapeRadius, height, edgeRadius],
  );

  const hollowSizeXZ = v.shape === 'square' ? baseRadius * 1.15 : shapeRadius * 0.6;
  const plugDepth = p.hollowDepth * s;
  const plugProfile = useMemo(
    () => roundedCylinderProfile(hollowSizeXZ, plugDepth, PLUG_FILLET),
    [hollowSizeXZ, plugDepth],
  );
  const noiseMap = useMemo(() => getSoftNoiseTexture(), []);

  const renderClayMaterial = () => (
    <meshStandardMaterial
      color={color}
      roughness={p.roughness}
      metalness={p.metalness}
      envMapIntensity={CLAY_ENV_INTENSITY}
      transparent={transparent}
      opacity={opacity}
      flatShading={isPrism}
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

  const outline = selected && (
    <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />
  );

  return (
    <group {...handlers}>
      {v.shape === 'square' ? (
        <RoundedBox
          position={[0, height / 2, 0]}
          args={[baseRadius * 2, height, baseRadius * 2]}
          radius={edgeRadius}
          smoothness={4}
          castShadow
          receiveShadow
          {...raycastProp}
        >
          {renderClayMaterial()}
          {outline}
        </RoundedBox>
      ) : isPrism ? (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow {...raycastProp}>
          <cylinderGeometry args={[shapeRadius, shapeRadius, height, prismSegments]} />
          {renderClayMaterial()}
          {outline}
        </mesh>
      ) : (
        // LatheGeometry revolves a 2D profile around the Y axis. Profile gives
        // a quarter-arc fillet at the top + bottom rim while keeping the side
        // at full radius — matches the rounded-edge feel of RoundedBox without
        // tapering the silhouette into a spool shape.
        <mesh castShadow receiveShadow {...raycastProp}>
          <latheGeometry args={[cylinderProfile, RADIAL_SEGMENTS]} />
          {renderClayMaterial()}
          {outline}
        </mesh>
      )}

      {v.band &&
        (v.shape === 'square' ? (
          <RoundedBox
            position={[0, height / 2, 0]}
            args={[baseRadius * 2 * BAND_OVERHANG, BAND_HEIGHT * s, baseRadius * 2 * BAND_OVERHANG]}
            radius={PLUG_FILLET}
            smoothness={2}
            castShadow
            receiveShadow
            {...raycastProp}
          >
            <meshStandardMaterial
              color={bandColor}
              roughness={p.roughness}
              metalness={p.metalness}
              envMapIntensity={CLAY_ENV_INTENSITY}
              transparent={transparent}
              opacity={opacity}
            />
          </RoundedBox>
        ) : (
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow {...raycastProp}>
            <cylinderGeometry
              args={[
                shapeRadius * BAND_OVERHANG,
                shapeRadius * BAND_OVERHANG,
                BAND_HEIGHT * s,
                prismSegments,
              ]}
            />
            <meshStandardMaterial
              color={bandColor}
              roughness={p.roughness}
              metalness={p.metalness}
              envMapIntensity={CLAY_ENV_INTENSITY}
              transparent={transparent}
              opacity={opacity}
              flatShading={isPrism}
            />
          </mesh>
        ))}

      {v.hollow &&
        (v.shape === 'square' ? (
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
        ) : isPrism ? (
          <mesh
            position={[0, height + plugDepth / 2 - PLUG_SINK, 0]}
            receiveShadow
            {...raycastProp}
          >
            <cylinderGeometry args={[hollowSizeXZ, hollowSizeXZ, plugDepth, prismSegments]} />
            {renderPlugMaterial()}
          </mesh>
        ) : (
          <mesh position={[0, height - PLUG_SINK, 0]} receiveShadow {...raycastProp}>
            <latheGeometry args={[plugProfile, RADIAL_SEGMENTS]} />
            {renderPlugMaterial()}
          </mesh>
        ))}
    </group>
  );
}
