'use client';

import { useMemo } from 'react';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import type { Cell } from '@/lib/game/win';

export interface BoardGridProps {
  cells: readonly Cell[];
  pendingPlace: number | null;
  ghostPiece: number | null;
  winLine: readonly number[] | null;
  canPlace: boolean;
  onSelectCell: (cell: number) => void;
}

function cellPosition(idx: number, pitch: number): [number, number, number] {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return [(col - 1.5) * pitch, 0, (row - 1.5) * pitch];
}

export function BoardGrid({
  cells,
  pendingPlace,
  ghostPiece,
  winLine,
  canPlace,
  onSelectCell,
}: BoardGridProps) {
  const { theme } = useTheme();
  const { cellPitch, cellSize } = theme.piece;
  const c = theme.colors;
  const indices = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[cellPitch * 4 + 0.4, cellPitch * 4 + 0.4]} />
        <meshStandardMaterial color={c.boardSurface} roughness={0.55} metalness={0.04} />
      </mesh>

      {indices.map((idx) => {
        const piece = cells[idx];
        const isPending = pendingPlace === idx;
        const isOnWinLine = winLine?.includes(idx) ?? false;
        const [x, , z] = cellPosition(idx, cellPitch);
        const filled = piece !== null && piece !== undefined;
        return (
          <group key={idx} position={[x, 0, z]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[cellSize, cellSize]} />
              <meshStandardMaterial
                color={isOnWinLine ? c.winLine : isPending ? c.pendingCell : c.surfaceMuted}
                roughness={0.7}
                emissive={isOnWinLine ? c.winLineEmissive : '#000'}
                emissiveIntensity={isOnWinLine ? 0.25 : 0}
              />
            </mesh>
            {!filled && canPlace && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.4, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCell(idx);
                }}
              >
                <planeGeometry args={[cellSize, cellSize]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {filled && <PieceMesh piece={piece} highlight={isOnWinLine} />}
            {!filled && isPending && ghostPiece !== null && <PieceMesh piece={ghostPiece} ghost />}
          </group>
        );
      })}
    </group>
  );
}
