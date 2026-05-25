'use client';

import { Html } from '@react-three/drei';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { ALL_PIECES, type Piece } from '@/lib/game/pieces';

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
const RAISE_Y = 0.6;

function slotPosition(piece: Piece): [number, number, number] {
  const row = Math.floor(piece / COLS);
  const col = piece % COLS;
  return [(col - (COLS - 1) / 2) * PITCH, 0, (row - (ROWS - 1) / 2) * PITCH];
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
        <meshStandardMaterial color={theme.colors.rackSurface} roughness={0.6} metalness={0.04} />
      </mesh>
      {ALL_PIECES.map((piece) => {
        const [x, , z] = slotPosition(piece);
        const isAvailable = available.includes(piece);
        const isPendingHandoff = pendingHandoff === piece;
        const showPiece = isAvailable || isPendingHandoff;
        const pieceY = isPendingHandoff ? RAISE_Y : 0;

        // Slot click target (base level). Click here on a selected slot lowers
        // the raised piece (cancel). Click on an empty/unselected slot selects it.
        const slotClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPick) return;
          if (isPendingHandoff) onClearPendingHandoff();
          else if (showPiece) onSelectPiece(piece);
        };

        // Piece click target (follows piece, including raised height). Click on
        // the raised selected piece confirms the give. Click on a non-selected
        // piece selects it.
        const pieceClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPick) return;
          if (isPendingHandoff) onConfirmHandoff();
          else onSelectPiece(piece);
        };

        return (
          <group key={piece} position={[x, 0, z]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[PITCH * 0.85, PITCH * 0.85]} />
              <meshStandardMaterial
                color={theme.colors.surfaceMuted}
                roughness={0.7}
                metalness={0.04}
              />
            </mesh>
            {canPick && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={slotClick}>
                <planeGeometry args={[PITCH * 0.85, PITCH * 0.85]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {showPiece && (
              <group position={[0, pieceY, 0]}>
                <PieceMesh piece={piece} selected={isPendingHandoff} />
                {canPick && (
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} onClick={pieceClick}>
                    <planeGeometry args={[PITCH * 0.9, PITCH * 0.9]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                )}
              </group>
            )}
            {isPendingHandoff && (
              <Html
                position={[0, 0.02, PITCH * 0.55]}
                center
                distanceFactor={6}
                style={{ pointerEvents: 'auto' }}
              >
                <button
                  type="button"
                  onClick={onConfirmHandoff}
                  className="rounded-lg bg-[var(--color-ink)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:opacity-90"
                >
                  Give
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
