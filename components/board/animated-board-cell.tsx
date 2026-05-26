'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useSfx } from '@/hooks/use-sfx';
import type { Piece } from '@/lib/game/pieces';

const BUTTON_BASE_OFFSET = 0.5;
const DROP_FROM_Y = 0.9;
const DROP_SQUASH_Y = 0.7;
const CASCADE_STAGGER_S = 0.18;

interface AnimatedBoardCellProps {
  position: [number, number, number];
  cellSize: number;
  piece: Piece | null;
  ghostPiece: Piece | null;
  isPending: boolean;
  isOnWinLine: boolean;
  winLineCascadeIndex: number; // -1 if not on win line
  winDecided: boolean;
  ghostAllowed: boolean;
  canPlace: boolean;
  hasPendingPlace: boolean;
  onSelectCell: () => void;
  onConfirmPlace: () => void;
  onClearPendingPlace: () => void;
}

export function AnimatedBoardCell({
  position,
  cellSize,
  piece,
  ghostPiece,
  isPending,
  isOnWinLine,
  winLineCascadeIndex,
  winDecided,
  ghostAllowed,
  canPlace,
  hasPendingPlace,
  onSelectCell,
  onConfirmPlace,
  onClearPendingPlace,
}: AnimatedBoardCellProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const playSfx = useSfx();
  const [hovered, setHovered] = useState(false);
  const pieceGroupRef = useRef<Group>(null);
  const prevFilled = useRef(piece !== null);
  const filled = piece !== null;
  const c = theme.colors;

  const showGhost =
    !filled &&
    ghostPiece !== null &&
    canPlace &&
    (isPending || (!hasPendingPlace && hovered && ghostAllowed));

  // Drop animation when a piece newly lands on this cell.
  useGSAP(
    () => {
      if (filled && !prevFilled.current && pieceGroupRef.current) {
        const g = pieceGroupRef.current;
        gsap.fromTo(
          g.position,
          { y: motion.reduced ? 0 : DROP_FROM_Y },
          { y: 0, duration: motion.base, ease: 'power2.in' },
        );
        if (!motion.reduced) {
          gsap.fromTo(
            g.scale,
            { x: 1, y: DROP_SQUASH_Y, z: 1 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: motion.base,
              delay: motion.base * 0.9,
              ease: 'elastic.out(1, 0.45)',
            },
          );
        }
      }
      prevFilled.current = filled;
    },
    { dependencies: [filled, motion.base, motion.reduced] },
  );

  // Cascade highlight: stagger which winning piece is glowing.
  // Driven via a state flag set inside a timeline.
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

  const tileClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPlace) return;
    if (isPending) onClearPendingPlace();
    else {
      playSfx('piece-pick');
      onSelectCell();
    }
  };

  const ghostClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPlace) return;
    if (isPending) onConfirmPlace();
    else {
      playSfx('piece-pick');
      onSelectCell();
    }
  };

  const tileColor = isOnWinLine
    ? c.winLine
    : isPending
      ? c.pendingCell
      : hovered && canPlace && !filled
        ? c.selection
        : c.surfaceMuted;

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
      {!filled && canPlace && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          onClick={tileClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <planeGeometry args={[cellSize, cellSize]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {filled && piece !== null && (
        <group ref={pieceGroupRef}>
          <PieceMesh piece={piece} highlight={cascadeOn} dimmed={winDecided && !isOnWinLine} />
        </group>
      )}
      {showGhost && ghostPiece !== null && (
        <>
          <PieceMesh piece={ghostPiece} ghost />
          {canPlace && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} onClick={ghostClick}>
              <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
        </>
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
