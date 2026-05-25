'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { ALL_PIECES, describe } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

const GRID_PITCH = 1.1;
const GRID_COLS = 4;

function position(idx: number): [number, number, number] {
  const row = Math.floor(idx / GRID_COLS);
  const col = idx % GRID_COLS;
  return [(col - (GRID_COLS - 1) / 2) * GRID_PITCH, 0, (row - 1.5) * GRID_PITCH];
}

export function PlaygroundCanvas() {
  const { lightingPreset, theme } = useTheme();
  return (
    <Canvas camera={{ position: [4.5, 5.5, 4.5], fov: 38 }} shadows>
      <Suspense fallback={null}>
        <ambientLight intensity={lightingPreset.ambient} />
        <directionalLight
          position={lightingPreset.directionalPosition}
          intensity={lightingPreset.directional}
          castShadow
        />
        {lightingPreset.environment && <Environment preset={lightingPreset.environment} />}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[GRID_PITCH * GRID_COLS + 0.6, GRID_PITCH * GRID_COLS + 0.6]} />
          <meshStandardMaterial
            color={theme.colors.boardSurface}
            roughness={0.55}
            metalness={0.04}
          />
        </mesh>
        {ALL_PIECES.map((piece) => {
          const [x, , z] = position(piece);
          return (
            <group key={piece} position={[x, 0, z]}>
              <PieceMesh piece={piece} />
            </group>
          );
        })}
      </Suspense>
    </Canvas>
  );
}

export function PiecePlayground() {
  return (
    <ul className="font-mono text-[10px]">
      {ALL_PIECES.map((p) => (
        <li key={p}>
          {p.toString(2).padStart(4, '0')} — {describe(p)}
        </li>
      ))}
    </ul>
  );
}
