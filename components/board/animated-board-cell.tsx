'use client';

import { useGSAP } from '@gsap/react';
import { useState } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import type { Piece } from '@/lib/game/pieces';

const BUTTON_BASE_OFFSET = 0.5;
const CASCADE_STAGGER_S = 0.18;

interface AnimatedBoardCellProps {
  position: [number, number, number];
  cellPitch: number;
  cellSize: number;
  piece: Piece | null;
  isPending: boolean;
  isHovered: boolean;
  isOnWinLine: boolean;
  winLineCascadeIndex: number;
  winDecided: boolean;
  canPlace: boolean;
  suppressPiece: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onClick: () => void;
  onConfirmPlace: () => void;
}

export function AnimatedBoardCell({
  position,
  cellPitch,
  cellSize,
  piece,
  isPending,
  isHovered,
  isOnWinLine,
  winLineCascadeIndex,
  winDecided,
  canPlace,
  suppressPiece,
  onHoverIn,
  onHoverOut,
  onClick,
  onConfirmPlace,
}: AnimatedBoardCellProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const filled = piece !== null;
  const c = theme.colors;

  // The arriving piece is animated by PlacementFlight (pedestal → cell arc);
  // the cell shows its resting piece only once that flight has landed.
  const showPiece = filled && !suppressPiece;

  const [cascadeOn, setCascadeOn] = useState(false);
  useGSAP(
    () => {
      if (isOnWinLine && winLineCascadeIndex >= 0) {
        const delay = motion.reduced ? 0 : winLineCascadeIndex * CASCADE_STAGGER_S;
        const tw = gsap.delayedCall(delay, () => setCascadeOn(true));
        return () => tw.kill();
      } else {
        setCascadeOn(false);
      }
    },
    { dependencies: [isOnWinLine, winLineCascadeIndex, motion.reduced] },
  );

  const tileColor = isOnWinLine
    ? c.winLine
    : isPending
      ? c.pendingCell
      : isHovered && canPlace && !filled
        ? c.selection
        : c.surfaceMuted;

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPlace || filled) return;
    if (isPending) onConfirmPlace();
    else onClick();
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
      {!filled && canPlace && (
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
        <PieceMesh piece={piece} highlight={cascadeOn} dimmed={winDecided && !isOnWinLine} />
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
