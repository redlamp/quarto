'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { cellPosition } from './board-grid';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import type { Piece } from '@/lib/game/pieces';
import type { VariantDef } from '@/lib/game/variants';

interface PlacementGhostProps {
  variant: VariantDef;
  targetIdx: number;
  piece: Piece;
}

export function PlacementGhost({ variant, targetIdx, piece }: PlacementGhostProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const groupRef = useRef<Group>(null);
  const placed = useRef(false);
  const pitch = theme.piece.cellPitch * variant.worldScale;
  const [x, , z] = cellPosition(targetIdx, variant.boardSize, pitch);

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
      <PieceMesh variant={variant} piece={piece} ghost interactive={false} />
    </group>
  );
}
