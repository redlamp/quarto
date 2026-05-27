'use client';

import { AnimatedRackSlot } from './animated-rack-slot';
import { ALL_PIECES, type Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

export interface PieceRackProps {
  available: readonly Piece[];
  pendingHandoff: Piece | null;
  canPick: boolean;
  onSelectPiece: (piece: Piece) => void;
  onConfirmHandoff: () => void;
  onDeselectHandoff: () => void;
}

const ROWS = 4;
const COLS = 4;
const PITCH = 0.7;
const X_OFFSET = -3.6;
const SLOT_SIZE = PITCH * 0.85;
// Click travel (px) above which the click is treated as a camera drag, not a tap.
const DESELECT_DRAG_PX = 6;

function slotPosition(piece: Piece): [number, number, number] {
  const row = Math.floor(piece / COLS);
  const col = piece % COLS;
  return [(col - (COLS - 1) / 2) * PITCH, 0, (row - (ROWS - 1) / 2) * PITCH];
}

// World-space position of a piece's rack slot (rack group is offset on X).
export function rackSlotWorld(piece: Piece): [number, number, number] {
  const [x, y, z] = slotPosition(piece);
  return [x + X_OFFSET, y, z];
}

export function PieceRack({
  available,
  pendingHandoff,
  canPick,
  onSelectPiece,
  onConfirmHandoff,
  onDeselectHandoff,
}: PieceRackProps) {
  const { theme } = useTheme();
  return (
    <group position={[X_OFFSET, 0, 0]}>
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
        <planeGeometry args={[PITCH * COLS + 0.4, PITCH * ROWS + 0.4]} />
        <meshStandardMaterial
          color={theme.colors.rackSurface}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>
      {ALL_PIECES.map((piece) => {
        const isAvailable = available.includes(piece);
        const isPendingHandoff = pendingHandoff === piece;
        const showPiece = isAvailable || isPendingHandoff;
        const sweepDelay = (piece / ALL_PIECES.length) * 0.35;
        return (
          <AnimatedRackSlot
            key={piece}
            piece={piece}
            position={slotPosition(piece)}
            slotSize={SLOT_SIZE}
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
