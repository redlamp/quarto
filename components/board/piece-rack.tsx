'use client';

import { useMemo } from 'react';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import type { Piece } from '@/lib/game/pieces';

export interface PieceRackProps {
  available: readonly Piece[];
  pendingHandoff: Piece | null;
  canPick: boolean;
  onSelectPiece: (piece: Piece) => void;
}

const ROWS = 2;
const COLS = 8;
const PITCH_X = 0.7;
const PITCH_Z = 0.85;
const Z_OFFSET = 3.5;

function slotPosition(slot: number): [number, number, number] {
  const row = Math.floor(slot / COLS);
  const col = slot % COLS;
  return [(col - (COLS - 1) / 2) * PITCH_X, 0, (row - (ROWS - 1) / 2) * PITCH_Z];
}

export function PieceRack({ available, pendingHandoff, canPick, onSelectPiece }: PieceRackProps) {
  const { theme } = useTheme();
  const slots = useMemo(() => available.slice(), [available]);
  return (
    <group position={[0, 0, Z_OFFSET]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[PITCH_X * COLS + 0.4, PITCH_Z * ROWS + 0.4]} />
        <meshStandardMaterial color={theme.colors.rackSurface} roughness={0.6} metalness={0.04} />
      </mesh>
      {slots.map((piece, slot) => {
        const [x, , z] = slotPosition(slot);
        const isPending = pendingHandoff === piece;
        return (
          <group key={piece} position={[x, 0, z]}>
            <PieceMesh piece={piece} highlight={isPending} />
            {canPick && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.5, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPiece(piece);
                }}
              >
                <planeGeometry args={[PITCH_X * 0.9, PITCH_Z * 0.9]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
