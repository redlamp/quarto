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
  onClearPendingPlace: () => void;
}

// Distance from piece base to Html button anchor — matches PieceRack so the
// Give and Place buttons sit at the same offset relative to their piece.
const BUTTON_BASE_OFFSET = 0.5;

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
  onClearPendingPlace,
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
        <meshStandardMaterial
          color={c.boardSurface}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>

      {indices.map((idx) => {
        const piece = cells[idx];
        const isPending = pendingPlace === idx;
        const isHovered = hoveredCell === idx;
        const isOnWinLine = winLine?.includes(idx) ?? false;
        const [x, , z] = cellPosition(idx, cellPitch);
        const filled = piece !== null && piece !== undefined;
        // Hover preview is active only when no cell is selected. Once a tile is
        // pending, the ghost locks to that cell and other empty cells stop
        // previewing on hover.
        const showGhost =
          !filled &&
          ghostPiece !== null &&
          (isPending || (pendingPlace === null && isHovered && canPlace));

        // Tile click target (cell surface). Mirrors rack slot logic:
        // — on the pending cell, clicking the bare tile cancels the selection
        // — on any other empty cell, clicking selects it (switches selection)
        const tileClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPlace) return;
          if (isPending) onClearPendingPlace();
          else onSelectCell(idx);
        };

        // Ghost piece click target (raised above the cell). Mirrors rack raised
        // piece logic: clicking the ghost piece on the pending cell confirms
        // the place; clicking it on any other cell (shouldn't happen since the
        // ghost only renders on pending or hovered cells) selects.
        const ghostClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPlace) return;
          if (isPending) onConfirmPlace();
          else onSelectCell(idx);
        };

        return (
          <group key={idx} position={[x, 0, z]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[cellSize, cellSize]} />
              <meshStandardMaterial
                color={
                  isOnWinLine
                    ? c.winLine
                    : isPending
                      ? c.pendingCell
                      : isHovered && canPlace && !filled
                        ? c.selection
                        : c.surfaceMuted
                }
                roughness={0.9}
                metalness={0}
                envMapIntensity={0.2}
                emissive={isOnWinLine ? c.winLineEmissive : '#000'}
                emissiveIntensity={isOnWinLine ? 0.25 : 0}
              />
            </mesh>
            {!filled && canPlace && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.01, 0]}
                onClick={tileClick}
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
            {showGhost && (
              <>
                <PieceMesh piece={ghostPiece} ghost />
                {canPlace && (
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} onClick={ghostClick}>
                    <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                )}
              </>
            )}
            {isPending && (
              <Html
                position={[0, BUTTON_BASE_OFFSET, 0]}
                center
                distanceFactor={6}
                style={{ pointerEvents: 'auto' }}
              >
                <button
                  type="button"
                  onClick={onConfirmPlace}
                  className="rounded-lg border border-white/40 bg-[var(--color-slate)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[var(--color-slate)]/85"
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
