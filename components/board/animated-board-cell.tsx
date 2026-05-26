'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useFlightStore } from '@/lib/state/flight-store';
import type { Piece } from '@/lib/game/pieces';

const BUTTON_BASE_OFFSET = 0.5;
const DROP_FROM_Y = 0.9;
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
  onHoverIn,
  onHoverOut,
  onClick,
  onConfirmPlace,
}: AnimatedBoardCellProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const flyingReceiver = useFlightStore((s) => s.flyingReceiver);
  const pieceGroupRef = useRef<Group>(null);
  const prevFilled = useRef(piece !== null);
  const dropped = useRef(piece !== null);
  const filled = piece !== null;
  const c = theme.colors;

  // Placement drop is gated on the handoff flight landing first — the piece a
  // player just placed shouldn't drop while its inbound piece is still arcing
  // to their pedestal (matters for fast AI moves). While a flight is in
  // progress the freshly-placed piece is held hidden, then drops once clear.
  useGSAP(
    () => {
      const g = pieceGroupRef.current;
      if (!g) {
        prevFilled.current = filled;
        return;
      }
      if (filled && !prevFilled.current) {
        dropped.current = false;
      }
      prevFilled.current = filled;

      if (!filled) {
        dropped.current = false;
        return;
      }

      if (!dropped.current) {
        if (flyingReceiver !== null) {
          // Hold the piece off-screen until the flight clears.
          g.visible = false;
          return;
        }
        g.visible = true;
        dropped.current = true;
        if (!motion.reduced) {
          gsap.fromTo(
            g.position,
            { y: DROP_FROM_Y },
            { y: 0, duration: motion.base, ease: 'power2.in' },
          );
        } else {
          g.position.y = 0;
        }
      }
    },
    { dependencies: [filled, flyingReceiver, motion.base, motion.reduced] },
  );

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
      {filled && piece !== null && (
        <group ref={pieceGroupRef}>
          <PieceMesh piece={piece} highlight={cascadeOn} dimmed={winDecided && !isOnWinLine} />
        </group>
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
