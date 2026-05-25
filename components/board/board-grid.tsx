'use client';

import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
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
  onConfirmPlace: () => void;
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
  onConfirmPlace,
}: BoardGridProps) {
  const { theme } = useTheme();
  const { cellPitch, cellSize } = theme.piece;
  const c = theme.colors;
  const indices = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[cellPitch * 4 + 0.4, cellPitch * 4 + 0.4]} />
        <meshStandardMaterial color={c.boardSurface} roughness={0.55} metalness={0.04} />
      </mesh>

      {indices.map((idx) => {
        const piece = cells[idx];
        const isPending = pendingPlace === idx;
        const isHovered = hoveredCell === idx;
        const isOnWinLine = winLine?.includes(idx) ?? false;
        const [x, , z] = cellPosition(idx, cellPitch);
        const filled = piece !== null && piece !== undefined;
        const showGhost = !filled && ghostPiece !== null && (isPending || (isHovered && canPlace));
        // First click on an empty cell selects it (ghost). Second click on the
        // same (pending) cell confirms the place. Clicking another empty cell
        // switches the selection.
        const handleClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (isPending) onConfirmPlace();
          else onSelectCell(idx);
        };
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
                onClick={handleClick}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredCell(idx);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredCell((current) => (current === idx ? null : current));
                }}
              >
                <planeGeometry args={[cellSize, cellSize]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {filled && <PieceMesh piece={piece} highlight={isOnWinLine} />}
            {showGhost && <PieceMesh piece={ghostPiece} ghost selected={isPending} />}
            {isPending && (
              <Html
                position={[0, 0.02, cellPitch * 0.55]}
                center
                distanceFactor={6}
                style={{ pointerEvents: 'auto' }}
              >
                <button
                  type="button"
                  onClick={onConfirmPlace}
                  className="rounded-lg bg-[var(--color-ink)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:opacity-90"
                >
                  Place
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
