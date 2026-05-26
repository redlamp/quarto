'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useDragStore } from '@/lib/state/drag-store';
import { useHoverStore } from '@/lib/state/hover-store';
import { useSfx } from '@/hooks/use-sfx';
import type { Piece } from '@/lib/game/pieces';

const RAISE_Y = 0.6;
const HOVER_LIFT_Y = 0.12;
const BUTTON_BASE_OFFSET = 0.5;

interface AnimatedRackSlotProps {
  piece: Piece;
  position: [number, number, number];
  worldPosition: [number, number, number];
  slotSize: number;
  pieceSize: number;
  showPiece: boolean;
  isPendingHandoff: boolean;
  canPick: boolean;
  sweepDelay: number;
  onSelectPiece: () => void;
  onClearPendingHandoff: () => void;
  onConfirmHandoff: () => void;
}

export function AnimatedRackSlot({
  piece,
  position,
  worldPosition,
  slotSize,
  pieceSize,
  showPiece,
  isPendingHandoff,
  canPick,
  sweepDelay,
  onSelectPiece,
  onClearPendingHandoff,
  onConfirmHandoff,
}: AnimatedRackSlotProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const playSfx = useSfx();
  const setHover = useHoverStore((s) => s.set);
  const startDrag = useDragStore((s) => s.start);
  const dragActive = useDragStore((s) => s.active);
  const dragPiece = useDragStore((s) => s.piece);
  const groupRef = useRef<Group>(null);
  const prevShowPiece = useRef(false);
  const [hovered, setHovered] = useState(false);

  const isBeingDragged = dragActive && dragPiece === piece;
  const renderPiece = showPiece && !isBeingDragged;

  const targetY = isPendingHandoff ? RAISE_Y : hovered && canPick && renderPiece ? HOVER_LIFT_Y : 0;

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
    setHovered(true);
    if (showPiece) setHover(piece);
  };
  const onHoverOut = (e: React.PointerEvent) => {
    e.stopPropagation();
    setHovered(false);
    setHover(null);
  };

  const onPieceClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPick || !renderPiece) return;
    if (isPendingHandoff) onConfirmHandoff();
    else {
      playSfx('piece-pick');
      onSelectPiece();
    }
  };

  const onSlotClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!canPick) return;
    if (isPendingHandoff) onClearPendingHandoff();
  };

  const onPiecePointerDown = (e: React.PointerEvent) => {
    if (!canPick || !renderPiece) return;
    e.stopPropagation();
    startDrag(piece, 'pick', { x: worldPosition[0], z: worldPosition[2] });
  };

  const slotColor =
    hovered && canPick && !isPendingHandoff ? theme.colors.selection : theme.colors.surfaceMuted;

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
          onClick={onSlotClick}
          onPointerOver={onHoverIn}
          onPointerOut={onHoverOut}
        >
          <planeGeometry args={[slotSize, slotSize]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {renderPiece && (
        <group ref={groupRef}>
          <PieceMesh piece={piece} selected={isPendingHandoff} />
          {canPick && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.5, 0]}
              onPointerDown={onPiecePointerDown}
              onClick={onPieceClick}
              onPointerOver={onHoverIn}
              onPointerOut={onHoverOut}
            >
              <planeGeometry args={[pieceSize, pieceSize]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
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
