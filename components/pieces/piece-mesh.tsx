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
  ghost?: boolean;
  highlight?: boolean;
  selected?: boolean;
}

const OUTLINE_THICKNESS = 0.05;
const EDGE_RADIUS = 0.06;
const CLAY_ENV_INTENSITY = 0.35;
const RADIAL_SEGMENTS = 48;
const FILLET_SEGMENTS = 6;

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
  highlight = false,
  selected = false,
  ...handlers
}: PieceMeshProps) {
  const { theme } = useTheme();
  const t = useMemo(() => traits(piece), [piece]);
  const p = theme.piece;
  const c = theme.colors;
  const height = t.tall ? p.heightTall : p.heightShort;
  const color = t.dark ? c.pieceDark : c.pieceLight;
  const emissive = highlight ? c.winLine : '#000000';
  const opacity = ghost ? 0.8 : 1;
  const transparent = ghost;

  const cylinderProfile = useMemo(
    () => roundedCylinderProfile(p.radius, height, EDGE_RADIUS),
    [p.radius, height],
  );

  const renderClayMaterial = () => (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={highlight ? p.highlightEmissive : 0}
      roughness={p.roughness}
      metalness={p.metalness}
      envMapIntensity={CLAY_ENV_INTENSITY}
      transparent={transparent}
      opacity={opacity}
    />
  );

  const hollowSizeXZ = t.square ? p.radius * 1.15 : p.radius * 0.6;

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
        >
          {renderClayMaterial()}
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </RoundedBox>
      ) : (
        // LatheGeometry revolves a 2D profile around the Y axis. Profile gives
        // a quarter-arc fillet at the top + bottom rim while keeping the side
        // at full radius — matches the rounded-edge feel of RoundedBox without
        // tapering the silhouette into a spool shape.
        <mesh castShadow receiveShadow>
          <latheGeometry args={[cylinderProfile, RADIAL_SEGMENTS]} />
          {renderClayMaterial()}
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </mesh>
      )}
      {t.hollow && (
        <mesh position={[0, height + 0.001, 0]} receiveShadow>
          {t.square ? (
            <boxGeometry args={[hollowSizeXZ, p.hollowDepth, hollowSizeXZ]} />
          ) : (
            <cylinderGeometry args={[hollowSizeXZ, hollowSizeXZ, p.hollowDepth, 32]} />
          )}
          <meshStandardMaterial
            color={c.pieceHollowInset}
            roughness={0.95}
            metalness={0}
            envMapIntensity={CLAY_ENV_INTENSITY}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      )}
    </group>
  );
}
