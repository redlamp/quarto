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
  const [x, , z] = cellWorld(targetIdx, cellPitch);

  useGSAP(
    () => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.position, {
        x,
        z,
        duration: motion.base,
        ease: motion.ease,
        overwrite: 'auto',
      });
    },
    { dependencies: [x, z, motion.base, motion.ease] },
  );

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <PieceMesh piece={piece} ghost />
    </group>
  );
}
