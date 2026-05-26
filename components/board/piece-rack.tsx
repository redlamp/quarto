'use client';

import { AnimatedRackSlot } from './animated-rack-slot';
import { ALL_PIECES, type Piece } from '@/lib/game/pieces';
import { useTheme } from '@/lib/theme/context';

export interface PieceRackProps {
  available: readonly Piece[];
  pendingHandoff: Piece | null;
  canPick: boolean;
  onSelectPiece: (piece: Piece) => void;
  onClearPendingHandoff: () => void;
  onConfirmHandoff: () => void;
}

const ROWS = 4;
const COLS = 4;
const PITCH = 0.7;
const X_OFFSET = -3.6;
const SLOT_SIZE = PITCH * 0.85;
const PIECE_SIZE = PITCH * 0.9;

// Half-extent of the rack pad in world units. Used by the canvas pointerup
// handler to detect "drag off the rack = offer to opponent".
export const RACK_BOUNDS = {
  centerX: X_OFFSET,
  centerZ: 0,
  halfX: (PITCH * COLS + 0.4) / 2,
  halfZ: (PITCH * ROWS + 0.4) / 2,
} as const;

function slotPosition(piece: Piece): [number, number, number] {
  const row = Math.floor(piece / COLS);
  const col = piece % COLS;
  return [(col - (COLS - 1) / 2) * PITCH, 0, (row - (ROWS - 1) / 2) * PITCH];
}

function slotWorldPosition(piece: Piece): [number, number, number] {
  const [x, y, z] = slotPosition(piece);
  return [x + X_OFFSET, y, z];
}

export function PieceRack({
  available,
  pendingHandoff,
  canPick,
  onSelectPiece,
  onClearPendingHandoff,
  onConfirmHandoff,
}: PieceRackProps) {
  const { theme } = useTheme();
  return (
    <group position={[X_OFFSET, 0, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
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
            worldPosition={slotWorldPosition(piece)}
            slotSize={SLOT_SIZE}
            pieceSize={PIECE_SIZE}
            showPiece={showPiece}
            isPendingHandoff={isPendingHandoff}
            canPick={canPick}
            sweepDelay={sweepDelay}
            onSelectPiece={() => onSelectPiece(piece)}
            onClearPendingHandoff={onClearPendingHandoff}
            onConfirmHandoff={onConfirmHandoff}
          />
        );
      })}
    </group>
  );
}
