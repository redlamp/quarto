'use client';

import { Html } from '@react-three/drei';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import type { Piece } from '@/lib/game/pieces';

const BUTTON_BASE_OFFSET = 0.5;

interface AnimatedBoardCellProps {
  position: [number, number, number];
  cellPitch: number;
  cellSize: number;
  piece: Piece | null;
  isPending: boolean;
  isHovered: boolean;
  isOnWinLine: boolean;
  winDecided: boolean;
  canPlace: boolean;
  handoffPending: boolean;
  suppressPiece: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onClick: () => void;
  onConfirmPlace: () => void;
  onDeselectHandoff: () => void;
}

export function AnimatedBoardCell({
  position,
  cellPitch,
  cellSize,
  piece,
  isPending,
  isHovered,
  isOnWinLine,
  winDecided,
  canPlace,
  handoffPending,
  suppressPiece,
  onHoverIn,
  onHoverOut,
  onClick,
  onConfirmPlace,
  onDeselectHandoff,
}: AnimatedBoardCellProps) {
  const { theme } = useTheme();
  const filled = piece !== null;
  const c = theme.colors;

  // The arriving piece is animated by PlacementFlight (pedestal → cell arc);
  // the cell shows its resting piece only once that flight has landed.
  const showPiece = filled && !suppressPiece;

  const tileColor = isOnWinLine
    ? c.winLine
    : isPending
      ? c.pendingCell
      : isHovered && canPlace && !filled
        ? c.selection
        : c.surfaceMuted;

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (filled) return;
    if (canPlace) {
      if (isPending) onConfirmPlace();
      else onClick();
    } else if (handoffPending) {
      // Pick stage with a piece queued to give: clicking the board cancels it.
      onDeselectHandoff();
    }
  };

  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[cellSize, cellSize]} />
        <meshStandardMaterial
          color={tileColor}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
          emissive={isOnWinLine ? c.winLineEmissive : '#000'}
          emissiveIntensity={isOnWinLine ? 0.25 : 0}
        />
      </mesh>
      {/* Pitch-sized hit mesh so adjacent cells touch — kills the pointer
          hiccup that happens when crossing the gap between visible tiles. */}
      {!filled && (canPlace || handoffPending) && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverIn();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverOut();
          }}
        >
          <planeGeometry args={[cellPitch, cellPitch]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {showPiece && piece !== null && (
        <PieceMesh piece={piece} dimmed={winDecided && !isOnWinLine} />
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
            className="confirm-pulse rounded-lg border border-white/40 bg-[var(--color-slate)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[var(--color-slate)]/85"
          >
            Place
          </button>
        </Html>
      )}
    </group>
  );
}
