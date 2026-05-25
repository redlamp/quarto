'use client';

import { useState } from 'react';
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
// Distance from piece base to Html button anchor — same constant used by the
// place flow so Give + Place buttons sit at the same offset from each piece.
const BUTTON_BASE_OFFSET = 0.5;

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
  const [hoveredSlot, setHoveredSlot] = useState<Piece | null>(null);
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
        const [x, , z] = slotPosition(piece);
        const isAvailable = available.includes(piece);
        const isPendingHandoff = pendingHandoff === piece;
        const isHovered = hoveredSlot === piece && canPick;
        const showPiece = isAvailable || isPendingHandoff;
        const pieceY = isPendingHandoff ? RAISE_Y : 0;

        const slotClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPick) return;
          if (isPendingHandoff) onClearPendingHandoff();
          else if (showPiece) onSelectPiece(piece);
        };

        const pieceClick = (e: React.SyntheticEvent) => {
          e.stopPropagation();
          if (!canPick) return;
          if (isPendingHandoff) onConfirmHandoff();
          else onSelectPiece(piece);
        };

        const slotColor =
          isHovered && !isPendingHandoff ? theme.colors.selection : theme.colors.surfaceMuted;

        return (
          <group key={piece} position={[x, 0, z]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[PITCH * 0.85, PITCH * 0.85]} />
              <meshStandardMaterial
                color={slotColor}
                roughness={0.9}
                metalness={0}
                envMapIntensity={0.2}
              />
            </mesh>
            {canPick && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.01, 0]}
                onClick={slotClick}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredSlot(piece);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredSlot((current) => (current === piece ? null : current));
                }}
              >
                <planeGeometry args={[PITCH * 0.85, PITCH * 0.85]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {showPiece && (
              <group position={[0, pieceY, 0]}>
                <PieceMesh piece={piece} selected={isPendingHandoff} />
                {canPick && (
                  <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0.5, 0]}
                    onClick={pieceClick}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHoveredSlot(piece);
                    }}
                    onPointerOut={(e) => {
                      e.stopPropagation();
                      setHoveredSlot((current) => (current === piece ? null : current));
                    }}
                  >
                    <planeGeometry args={[PITCH * 0.9, PITCH * 0.9]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                )}
              </group>
            )}
            {isPendingHandoff && (
              <Html
                position={[0, pieceY + BUTTON_BASE_OFFSET, 0]}
                center
                distanceFactor={6}
                style={{ pointerEvents: 'auto' }}
              >
                <button
                  type="button"
                  onClick={onConfirmHandoff}
                  className="rounded-lg border border-white/40 bg-[var(--color-slate)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[var(--color-slate)]/85"
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
