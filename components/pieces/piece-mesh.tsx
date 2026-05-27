'use client';

import { useMemo } from 'react';
import { Vector2 } from 'three';
import { Outlines, RoundedBox } from '@react-three/drei';
import { traits, type Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

interface PieceMeshProps {
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

// Hollow plug: rounded rim to match the pieces, plus a metallic/low-roughness
// finish + boosted env so it catches the light and reads at a glancing angle.
const PLUG_FILLET = 0.02;
const PLUG_METALNESS = 0.85;
const PLUG_ROUGHNESS = 0.25;
const PLUG_ENV_INTENSITY = 1.1;
const PLUG_SINK = 0.005;

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
  piece,
  ghost = false,
  selected = false,
  dimmed = false,
  interactive = true,
  ...handlers
}: PieceMeshProps) {
  const { theme } = useTheme();
  const raycastProp = interactive ? {} : { raycast: NO_RAYCAST };
  const t = useMemo(() => traits(piece), [piece]);
  const p = theme.piece;
  const c = theme.colors;
  const height = t.tall ? p.heightTall : p.heightShort;
  const color = t.dark ? c.pieceDark : c.pieceLight;
  const opacity = ghost ? 0.8 : dimmed ? 0.35 : 1;
  const transparent = ghost || dimmed;

  const cylinderProfile = useMemo(
    () => roundedCylinderProfile(p.radius, height, EDGE_RADIUS),
    [p.radius, height],
  );

  const hollowSizeXZ = t.square ? p.radius * 1.15 : p.radius * 0.6;
  const plugProfile = useMemo(
    () => roundedCylinderProfile(hollowSizeXZ, p.hollowDepth, PLUG_FILLET),
    [hollowSizeXZ, p.hollowDepth],
  );

  const renderClayMaterial = () => (
    <meshStandardMaterial
      color={color}
      roughness={p.roughness}
      metalness={p.metalness}
      envMapIntensity={CLAY_ENV_INTENSITY}
      transparent={transparent}
      opacity={opacity}
    />
  );

  const renderPlugMaterial = () => (
    <meshStandardMaterial
      color={c.pieceHollowInset}
      roughness={PLUG_ROUGHNESS}
      metalness={PLUG_METALNESS}
      envMapIntensity={PLUG_ENV_INTENSITY}
      transparent={transparent}
      opacity={opacity}
    />
  );

  return (
    <group {...handlers}>
      {t.square ? (
        <RoundedBox
          position={[0, height / 2, 0]}
          args={[p.radius * 2, height, p.radius * 2]}
          radius={EDGE_RADIUS}
          smoothness={4}
          castShadow
          receiveShadow
          {...raycastProp}
        >
          {renderClayMaterial()}
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </RoundedBox>
      ) : (
        // LatheGeometry revolves a 2D profile around the Y axis. Profile gives
        // a quarter-arc fillet at the top + bottom rim while keeping the side
        // at full radius — matches the rounded-edge feel of RoundedBox without
        // tapering the silhouette into a spool shape.
        <mesh castShadow receiveShadow {...raycastProp}>
          <latheGeometry args={[cylinderProfile, RADIAL_SEGMENTS]} />
          {renderClayMaterial()}
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </mesh>
      )}
      {t.hollow &&
        (t.square ? (
          <RoundedBox
            position={[0, height + p.hollowDepth / 2 - PLUG_SINK, 0]}
            args={[hollowSizeXZ, p.hollowDepth, hollowSizeXZ]}
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
