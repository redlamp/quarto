'use client';

import { useMemo } from 'react';
import { AnimatedBoardCell } from './animated-board-cell';
import { WinLineOverlay } from './win-line-overlay';
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
  const winCells = useMemo(() => winLine ?? [], [winLine]);
  const winSet = useMemo(() => new Set(winCells), [winCells]);
  const hasPendingPlace = pendingPlace !== null;

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
        const piece = cells[idx] ?? null;
        const isOnWinLine = winSet.has(idx);
        const cascadeIdx = isOnWinLine ? winCells.indexOf(idx) : -1;
        return (
          <AnimatedBoardCell
            key={idx}
            position={cellPosition(idx, cellPitch)}
            cellSize={cellSize}
            piece={piece}
            ghostPiece={ghostPiece}
            isPending={pendingPlace === idx}
            isOnWinLine={isOnWinLine}
            winLineCascadeIndex={cascadeIdx}
            winDecided={winCells.length > 0}
            ghostAllowed={!hasPendingPlace}
            canPlace={canPlace}
            hasPendingPlace={hasPendingPlace}
            onSelectCell={() => onSelectCell(idx)}
            onConfirmPlace={onConfirmPlace}
            onClearPendingPlace={onClearPendingPlace}
          />
        );
      })}

      {winLine && winLine.length === 4 && <WinLineOverlay cells={winLine} cellPitch={cellPitch} />}
    </group>
  );
}
