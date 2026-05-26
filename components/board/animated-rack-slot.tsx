'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useHoverStore } from '@/lib/state/hover-store';
import { useSfx } from '@/hooks/use-sfx';
import type { Piece } from '@/lib/game/pieces';

const RAISE_Y = 0.6;
const HOVER_LIFT_Y = 0.12;
const BUTTON_BASE_OFFSET = 0.5;

interface AnimatedRackSlotProps {
  piece: Piece;
  position: [number, number, number];
  slotSize: number;
  showPiece: boolean;
  isPendingHandoff: boolean;
  canPick: boolean;
  sweepDelay: number;
  onSelectPiece: () => void;
  onConfirmHandoff: () => void;
}

export function AnimatedRackSlot({
  piece,
  position,
  slotSize,
  showPiece,
  isPendingHandoff,
  canPick,
  sweepDelay,
  onSelectPiece,
  onConfirmHandoff,
}: AnimatedRackSlotProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const playSfx = useSfx();
  const setHover = useHoverStore((s) => s.set);
  const hoveredPiece = useHoverStore((s) => s.piece);
  const groupRef = useRef<Group>(null);
  const prevShowPiece = useRef(false);

  // Single source of truth — only the piece currently in hover-store is lit, so
  // at most one slot highlights at a time.
  const hovered = hoveredPiece === piece;
  const liftActive = hovered && canPick && showPiece;
  const targetY = isPendingHandoff ? RAISE_Y : liftActive ? HOVER_LIFT_Y : 0;

  useGSAP(
    () => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.position, {
        y: targetY,
        duration: motion.base,
        ease: motion.ease,
        overwrite: 'auto',
      });
    },
    { dependencies: [targetY, motion.base, motion.ease] },
  );

  useGSAP(
    () => {
      if (!groupRef.current) return;
      if (showPiece && !prevShowPiece.current) {
        const g = groupRef.current;
        if (motion.reduced) {
          g.scale.set(1, 1, 1);
        } else {
          gsap.fromTo(
            g.scale,
            { x: 0, y: 0, z: 0 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: motion.base,
              delay: sweepDelay,
              ease: 'back.out(1.6)',
            },
          );
        }
      }
      prevShowPiece.current = showPiece;
    },
    { dependencies: [showPiece, sweepDelay, motion.base, motion.reduced] },
  );

  const onHoverIn = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (showPiece) setHover(piece);
  };
  const onHoverOut = (e: React.PointerEvent) => {
    e.stopPropagation();
    // Only clear if this piece is still the hovered one — guards against a
    // late pointer-out from the slot we just left clobbering the new hover.
    if (useHoverStore.getState().piece === piece) setHover(null);
  };

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPick || !showPiece) return;
    if (isPendingHandoff) {
      onConfirmHandoff();
    } else {
      playSfx('piece-pick');
      onSelectPiece();
    }
  };

  const slotColor = isPendingHandoff
    ? theme.colors.selection
    : liftActive
      ? theme.colors.selection
      : theme.colors.surfaceMuted;

  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[slotSize, slotSize]} />
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
          onClick={handleClick}
          onPointerOver={onHoverIn}
          onPointerOut={onHoverOut}
        >
          <planeGeometry args={[slotSize, slotSize]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {showPiece && (
        <group ref={groupRef}>
          <PieceMesh
            piece={piece}
            selected={isPendingHandoff}
            onClick={canPick ? handleClick : undefined}
            onPointerOver={canPick ? onHoverIn : undefined}
            onPointerOut={canPick ? onHoverOut : undefined}
          />
        </group>
      )}
      {isPendingHandoff && (
        <Html
          position={[0, RAISE_Y + BUTTON_BASE_OFFSET, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'auto' }}
        >
          <button
            type="button"
            onClick={onConfirmHandoff}
            className="confirm-pulse rounded-lg border border-white/40 bg-[var(--color-slate)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[var(--color-slate)]/85"
          >
            Give
          </button>
        </Html>
      )}
    </group>
  );
}
