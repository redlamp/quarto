'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useDragStore } from '@/lib/state/drag-store';
import { useMotion } from '@/lib/motion/use-motion';

interface DragGhostProps {
  cellPitch: number;
  cells: readonly (number | null)[];
}

const GHOST_Y = 0.6;
const SNAP_RADIUS_FACTOR = 0.6;

function snapToCell(
  x: number,
  z: number,
  pitch: number,
  cells: readonly (number | null)[],
): { x: number; z: number } | null {
  const col = Math.round(x / pitch + 1.5);
  const row = Math.round(z / pitch + 1.5);
  if (col < 0 || col > 3 || row < 0 || row > 3) return null;
  const cx = (col - 1.5) * pitch;
  const cz = (row - 1.5) * pitch;
  const dx = x - cx;
  const dz = z - cz;
  const r = pitch * SNAP_RADIUS_FACTOR;
  if (dx * dx + dz * dz > r * r) return null;
  const idx = row * 4 + col;
  if (cells[idx] !== null && cells[idx] !== undefined) return null;
  return { x: cx, z: cz };
}

export function DragGhost({ cellPitch, cells }: DragGhostProps) {
  const motion = useMotion();
  const dragActive = useDragStore((s) => s.active);
  const piece = useDragStore((s) => s.piece);
  const cursor = useDragStore((s) => s.cursorWorld);
  const hasMoved = useDragStore((s) => s.hasMoved);
  const groupRef = useRef<Group>(null);

  // Compute target position — snap to nearest empty cell when close, else
  // free-follow the cursor on the board plane.
  const snap = cursor ? snapToCell(cursor.x, cursor.z, cellPitch, cells) : null;
  const targetX = snap?.x ?? cursor?.x ?? 0;
  const targetZ = snap?.z ?? cursor?.z ?? 0;

  useGSAP(
    () => {
      if (!groupRef.current) return;
      if (!dragActive || !hasMoved) return;
      gsap.to(groupRef.current.position, {
        x: targetX,
        z: targetZ,
        duration: snap ? motion.base : motion.base * 0.5,
        ease: motion.ease,
        overwrite: 'auto',
      });
    },
    { dependencies: [dragActive, hasMoved, targetX, targetZ, motion.base, motion.ease, snap] },
  );

  if (!dragActive || !hasMoved || piece === null || cursor === null) return null;

  return (
    <group ref={groupRef} position={[targetX, GHOST_Y, targetZ]}>
      <PieceMesh piece={piece} selected />
    </group>
  );
}
