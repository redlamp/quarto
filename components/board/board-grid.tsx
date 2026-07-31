'use client';

import { useMemo, useState } from 'react';
import { AnimatedBoardCell } from './animated-board-cell';
import { PlacementGhost } from './placement-ghost';
import { useTheme } from '@/lib/theme/context';
import { useFlightStore } from '@/lib/state/flight-store';
import type { VariantDef } from '@/lib/game/variants';
import type { Cell } from '@/lib/game/win';

export interface BoardGridProps {
  variant: VariantDef;
  cells: readonly Cell[];
  pendingPlace: number | null;
  ghostPiece: number | null;
  winLine: readonly number[] | null;
  canPlace: boolean;
  handoffPending: boolean;
  onSelectCell: (cell: number) => void;
  onConfirmPlace: () => void;
  onClearPendingPlace: () => void;
  onDeselectHandoff: () => void;
}

export function cellPosition(idx: number, size: number, pitch: number): [number, number, number] {
  const row = Math.floor(idx / size);
  const col = idx % size;
  const half = (size - 1) / 2;
  return [(col - half) * pitch, 0, (row - half) * pitch];
}

export function BoardGrid({
  variant,
  cells,
  pendingPlace,
  ghostPiece,
  winLine,
  canPlace,
  handoffPending,
  onSelectCell,
  onConfirmPlace,
  onDeselectHandoff,
}: BoardGridProps) {
  const { theme } = useTheme();
  const size = variant.boardSize;
  const pitch = theme.piece.cellPitch * variant.worldScale;
  const cellSize = theme.piece.cellSize * variant.worldScale;
  const c = theme.colors;
  const indices = useMemo(() => Array.from({ length: size * size }, (_, i) => i), [size]);
  const winCells = useMemo(() => winLine ?? [], [winLine]);
  const winSet = useMemo(() => new Set(winCells), [winCells]);
  const flyingCell = useFlightStore((s) => s.flyingCell);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Shared placement ghost target: pending takes priority, then hovered.
  const ghostTarget =
    canPlace && ghostPiece !== null
      ? pendingPlace !== null
        ? pendingPlace
        : hoveredCell !== null && (cells[hoveredCell] ?? null) === null
          ? hoveredCell
          : null
      : null;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[pitch * size + 0.4, pitch * size + 0.4]} />
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
        return (
          <AnimatedBoardCell
            key={idx}
            variant={variant}
            position={cellPosition(idx, size, pitch)}
            cellPitch={pitch}
            cellSize={cellSize}
            piece={piece}
            isPending={pendingPlace === idx}
            isHovered={hoveredCell === idx}
            isOnWinLine={isOnWinLine}
            winDecided={winCells.length > 0}
            canPlace={canPlace}
            handoffPending={handoffPending}
            suppressPiece={flyingCell === idx}
            onHoverIn={() => setHoveredCell(idx)}
            onHoverOut={() => setHoveredCell((curr) => (curr === idx ? null : curr))}
            onClick={() => onSelectCell(idx)}
            onConfirmPlace={onConfirmPlace}
            onDeselectHandoff={onDeselectHandoff}
          />
        );
      })}

      {ghostTarget !== null && ghostPiece !== null && (
        <PlacementGhost variant={variant} targetIdx={ghostTarget} piece={ghostPiece} />
      )}
    </group>
  );
}
