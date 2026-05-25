'use client';

import { useMemo } from 'react';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import type { Cell } from '@/lib/game/win';

export interface BoardGridProps {
  cells: readonly Cell[];
  pendingPlace: number | null;
  ghostPiece: number | null;
  winLine: readonly number[] | null;
  canPlace: boolean;
  onSelectCell: (cell: number) => void;
}

const CELL_PITCH = 0.85;
const CELL_SIZE = 0.78;

function cellPosition(idx: number): [number, number, number] {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return [(col - 1.5) * CELL_PITCH, 0, (row - 1.5) * CELL_PITCH];
}

export function BoardGrid({
  cells,
  pendingPlace,
  ghostPiece,
  winLine,
  canPlace,
  onSelectCell,
}: BoardGridProps) {
  const indices = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  return (
    <group>
      {/* Board surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[CELL_PITCH * 4 + 0.4, CELL_PITCH * 4 + 0.4]} />
        <meshStandardMaterial color="#eef0f3" roughness={0.55} metalness={0.04} />
      </mesh>

      {indices.map((idx) => {
        const piece = cells[idx];
        const isPending = pendingPlace === idx;
        const isOnWinLine = winLine?.includes(idx) ?? false;
        const [x, , z] = cellPosition(idx);
        const filled = piece !== null && piece !== undefined;
        return (
          <group key={idx} position={[x, 0, z]}>
            {/* Cell inset visual */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
              <meshStandardMaterial
                color={isOnWinLine ? '#f7e9c8' : isPending ? '#dfe7f5' : '#e2e5ea'}
                roughness={0.7}
                emissive={isOnWinLine ? '#c9a866' : '#000'}
                emissiveIntensity={isOnWinLine ? 0.25 : 0}
              />
            </mesh>
            {/* Click target — only when empty and place allowed */}
            {!filled && canPlace && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.4, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCell(idx);
                }}
              >
                <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {/* Placed piece */}
            {filled && <PieceMesh piece={piece} highlight={isOnWinLine} />}
            {/* Ghost preview on pending-place cell */}
            {!filled && isPending && ghostPiece !== null && <PieceMesh piece={ghostPiece} ghost />}
          </group>
        );
      })}
    </group>
  );
}
