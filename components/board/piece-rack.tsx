'use client';

import { AnimatedRackSlot } from './animated-rack-slot';
import { piecesOf, type VariantDef } from '@/lib/game/variants';
import type { Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

export interface PieceRackProps {
  variant: VariantDef;
  available: readonly Piece[];
  pendingHandoff: Piece | null;
  canPick: boolean;
  onSelectPiece: (piece: Piece) => void;
  onConfirmHandoff: () => void;
  onDeselectHandoff: () => void;
}

const BASE_PITCH = 0.7;
const RACK_GAP = 0.5;
// Click travel (px) above which the click is treated as a camera drag, not a tap.
const DESELECT_DRAG_PX = 6;

interface RackLayout {
  cols: number;
  rows: number;
  pitch: number;
  offsetX: number;
}

// Rack sits to the board's left; the offset keeps a constant gap between the
// board edge and the rack edge as both scale with the variant.
export function rackLayout(variant: VariantDef, cellPitch: number): RackLayout {
  const cols = variant.rackCols;
  const rows = Math.ceil(variant.pieceCount / cols);
  const pitch = BASE_PITCH * variant.worldScale;
  const boardHalf = (variant.boardSize * cellPitch * variant.worldScale) / 2;
  const rackHalf = (cols * pitch) / 2;
  return { cols, rows, pitch, offsetX: -(boardHalf + rackHalf + RACK_GAP + 0.2) };
}

function slotPosition(piece: Piece, layout: RackLayout): [number, number, number] {
  const row = Math.floor(piece / layout.cols);
  const col = piece % layout.cols;
  return [
    (col - (layout.cols - 1) / 2) * layout.pitch,
    0,
    (row - (layout.rows - 1) / 2) * layout.pitch,
  ];
}

// World-space position of a piece's rack slot (rack group is offset on X).
export function rackSlotWorld(
  variant: VariantDef,
  cellPitch: number,
  piece: Piece,
): [number, number, number] {
  const layout = rackLayout(variant, cellPitch);
  const [x, y, z] = slotPosition(piece, layout);
  return [x + layout.offsetX, y, z];
}

export function PieceRack({
  variant,
  available,
  pendingHandoff,
  canPick,
  onSelectPiece,
  onConfirmHandoff,
  onDeselectHandoff,
}: PieceRackProps) {
  const { theme } = useTheme();
  const layout = rackLayout(variant, theme.piece.cellPitch);
  const slotSize = layout.pitch * 0.85;
  const allPieces = piecesOf(variant);
  return (
    <group position={[layout.offsetX, 0, 0]}>
      {/* Rack surface doubles as a deselect target: a tap on empty rack space
          (pieces stop propagation) cancels a pending give. Skip camera drags. */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > DESELECT_DRAG_PX) return;
          if (canPick && pendingHandoff !== null) onDeselectHandoff();
        }}
      >
        <planeGeometry
          args={[layout.pitch * layout.cols + 0.4, layout.pitch * layout.rows + 0.4]}
        />
        <meshStandardMaterial
          color={theme.colors.rackSurface}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>
      {allPieces.map((piece) => {
        const isAvailable = available.includes(piece);
        const isPendingHandoff = pendingHandoff === piece;
        const showPiece = isAvailable || isPendingHandoff;
        const sweepDelay = (piece / allPieces.length) * 0.35;
        return (
          <AnimatedRackSlot
            key={piece}
            variant={variant}
            piece={piece}
            position={slotPosition(piece, layout)}
            slotSize={slotSize}
            showPiece={showPiece}
            isPendingHandoff={isPendingHandoff}
            canPick={canPick}
            handoffPending={canPick && pendingHandoff !== null}
            sweepDelay={sweepDelay}
            onSelectPiece={() => onSelectPiece(piece)}
            onConfirmHandoff={onConfirmHandoff}
            onDeselectHandoff={onDeselectHandoff}
          />
        );
      })}
    </group>
  );
}
