'use client';

import { useMemo } from 'react';
import { Outlines } from '@react-three/drei';
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
  const opacity = ghost ? 0.45 : 1;
  const transparent = ghost;

  return (
    <group {...handlers}>
      {t.square ? (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[p.radius * 2, height, p.radius * 2]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={highlight ? p.highlightEmissive : 0}
            roughness={p.roughness}
            metalness={p.metalness}
            transparent={transparent}
            opacity={opacity}
          />
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </mesh>
      ) : (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[p.radius, p.radius, height, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={highlight ? p.highlightEmissive : 0}
            roughness={p.roughness}
            metalness={p.metalness}
            transparent={transparent}
            opacity={opacity}
          />
          {selected && <Outlines color={c.selection} thickness={OUTLINE_THICKNESS} angle={0} />}
        </mesh>
      )}
      {t.hollow && (
        <mesh position={[0, height + 0.001, 0]} receiveShadow>
          {t.square ? (
            <boxGeometry args={[p.radius * 1.2, p.hollowDepth, p.radius * 1.2]} />
          ) : (
            <cylinderGeometry args={[p.radius * 0.6, p.radius * 0.6, p.hollowDepth, 24]} />
          )}
          <meshStandardMaterial
            color={c.pieceHollowInset}
            roughness={0.6}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      )}
    </group>
  );
}
