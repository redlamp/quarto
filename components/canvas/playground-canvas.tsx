'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { describePiece, piecesOf, type VariantDef } from '@/lib/game/variants';
import { useTheme } from '@/lib/theme/context';

const GRID_PITCH = 1.1;

function position(idx: number, cols: number, rows: number): [number, number, number] {
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  return [(col - (cols - 1) / 2) * GRID_PITCH, 0, (row - (rows - 1) / 2) * GRID_PITCH];
}

export function PlaygroundCanvas({ variant }: { variant: VariantDef }) {
  const { lightingPreset, theme } = useTheme();
  const cols = variant.rackCols;
  const rows = Math.ceil(variant.pieceCount / cols);
  const extent = Math.max(cols, rows);
  const camDist = 1.4 + extent * 1.15;
  return (
    <Canvas camera={{ position: [camDist, camDist * 1.2, camDist], fov: 38 }} shadows>
      <Suspense fallback={null}>
        <ambientLight intensity={lightingPreset.ambient} />
        <directionalLight
          position={lightingPreset.directionalPosition}
          intensity={lightingPreset.directional}
          castShadow
        />
        {lightingPreset.environment && <Environment preset={lightingPreset.environment} />}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[GRID_PITCH * cols + 0.6, GRID_PITCH * rows + 0.6]} />
          <meshStandardMaterial
            color={theme.colors.boardSurface}
            roughness={0.55}
            metalness={0.04}
          />
        </mesh>
        {piecesOf(variant).map((piece) => {
          const [x, , z] = position(piece, cols, rows);
          return (
            <group key={piece} position={[x, 0, z]}>
              <PieceMesh variant={variant} piece={piece} />
            </group>
          );
        })}
      </Suspense>
    </Canvas>
  );
}

export function PiecePlayground({ variant }: { variant: VariantDef }) {
  return (
    <ul className="font-mono text-[10px]">
      {piecesOf(variant).map((p) => (
        <li key={p}>
          {String(p).padStart(2, '0')} — {describePiece(variant, p)}
        </li>
      ))}
    </ul>
  );
}
