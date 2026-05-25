'use client';

import { useMemo } from 'react';
import { traits, type Piece } from '@/lib/game/pieces';

interface PieceMeshProps {
  piece: Piece;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerOver?: (e: React.PointerEvent) => void;
  onPointerOut?: (e: React.PointerEvent) => void;
  ghost?: boolean;
  highlight?: boolean;
}

const COLOR_LIGHT = '#dfe2e7';
const COLOR_DARK = '#1e2128';
const COLOR_HIGHLIGHT = '#c9d2e0';

export function PieceMesh({
  piece,
  ghost = false,
  highlight = false,
  ...handlers
}: PieceMeshProps) {
  const t = useMemo(() => traits(piece), [piece]);
  const height = t.tall ? 0.7 : 0.4;
  const radiusOrSize = 0.28;
  const color = t.dark ? COLOR_DARK : COLOR_LIGHT;
  const emissive = highlight ? COLOR_HIGHLIGHT : '#000000';
  const opacity = ghost ? 0.45 : 1;
  const transparent = ghost;

  // Hollow top = subtract a smaller cylinder/box on top via two stacked
  // primitives: outer shell + recessed cap.
  return (
    <group {...handlers}>
      {t.square ? (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[radiusOrSize * 2, height, radiusOrSize * 2]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={highlight ? 0.3 : 0}
            roughness={0.45}
            metalness={0.05}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      ) : (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radiusOrSize, radiusOrSize, height, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={highlight ? 0.3 : 0}
            roughness={0.45}
            metalness={0.05}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      )}
      {t.hollow && (
        <mesh position={[0, height + 0.001, 0]} receiveShadow>
          {t.square ? (
            <boxGeometry args={[radiusOrSize * 1.2, 0.06, radiusOrSize * 1.2]} />
          ) : (
            <cylinderGeometry args={[radiusOrSize * 0.6, radiusOrSize * 0.6, 0.06, 24]} />
          )}
          <meshStandardMaterial
            color="#0c0e12"
            roughness={0.6}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      )}
    </group>
  );
}
