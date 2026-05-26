'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useMotion } from '@/lib/motion/use-motion';
import type { Piece } from '@/lib/game/pieces';

interface PlacementGhostProps {
  targetIdx: number;
  cellPitch: number;
  piece: Piece;
}

function cellWorld(idx: number, pitch: number): [number, number, number] {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return [(col - 1.5) * pitch, 0, (row - 1.5) * pitch];
}

export function PlacementGhost({ targetIdx, cellPitch, piece }: PlacementGhostProps) {
  const motion = useMotion();
  const groupRef = useRef<Group>(null);
  const placed = useRef(false);
  const [x, , z] = cellWorld(targetIdx, cellPitch);

  // Drive position imperatively only. Binding a declarative `position` prop to
  // x/z makes React snap the group to the new cell on re-render, which fights
  // the gsap tween (snap → snap-back → tween). First appearance is instant;
  // subsequent cell changes tween.
  useGSAP(
    () => {
      const g = groupRef.current;
      if (!g) return;
      if (!placed.current) {
        g.position.set(x, 0, z);
        placed.current = true;
      } else {
        gsap.to(g.position, {
          x,
          z,
          duration: motion.base,
          ease: motion.ease,
          overwrite: 'auto',
        });
      }
    },
    { dependencies: [x, z, motion.base, motion.ease] },
  );

  return (
    <group ref={groupRef}>
      <PieceMesh piece={piece} ghost interactive={false} />
    </group>
  );
}
