'use client';

import { useGSAP } from '@gsap/react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useDragStore } from '@/lib/state/drag-store';
import type { Piece } from '@/lib/game/pieces';

interface HandedPiecePedestalProps {
  piece: Piece | null;
  ownerPlayerID: string | null;
  draggable: boolean;
}

// P0 is "front" of the board (+z); P1 is "back" (-z). Pedestal sits between
// board edge and the owning player. Owner flip animates the piece across.
const FRONT_Z = 2.7;
const BACK_Z = -2.7;
const PAD_SIZE = 0.95;
const ARC_PEAK_Y = 1.4;

function zForOwner(owner: string | null): number {
  if (owner === '0') return FRONT_Z;
  if (owner === '1') return BACK_Z;
  return FRONT_Z;
}

export function HandedPiecePedestal({ piece, ownerPlayerID, draggable }: HandedPiecePedestalProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const startDrag = useDragStore((s) => s.start);
  const groupRef = useRef<Group>(null);
  const prevOwner = useRef<string | null>(ownerPlayerID);
  const visible = piece !== null && ownerPlayerID !== null;
  const z = zForOwner(ownerPlayerID);

  useGSAP(
    () => {
      const g = groupRef.current;
      if (!g) return;
      if (
        prevOwner.current !== ownerPlayerID &&
        prevOwner.current !== null &&
        ownerPlayerID !== null
      ) {
        // Owner flipped — animate travel arc.
        const fromZ = zForOwner(prevOwner.current);
        const toZ = z;
        if (motion.reduced) {
          g.position.set(0, 0, toZ);
        } else {
          gsap.fromTo(
            g.position,
            { z: fromZ, y: 0 },
            {
              z: toZ,
              duration: motion.cinematic,
              ease: 'power2.inOut',
              overwrite: 'auto',
            },
          );
          gsap.fromTo(
            g.position,
            { y: 0 },
            {
              y: ARC_PEAK_Y,
              duration: motion.cinematic / 2,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
              overwrite: false,
            },
          );
        }
      } else if (g) {
        g.position.set(0, 0, z);
      }
      prevOwner.current = ownerPlayerID;
    },
    { dependencies: [ownerPlayerID, z, motion.cinematic, motion.reduced] },
  );

  // Reset position when pedestal hides between turns.
  useEffect(() => {
    if (!visible && groupRef.current) {
      groupRef.current.position.set(0, 0, z);
    }
  }, [visible, z]);

  if (!visible) return null;
  return (
    <group ref={groupRef} position={[0, 0, z]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[PAD_SIZE, PAD_SIZE]} />
        <meshStandardMaterial
          color={theme.colors.rackSurface}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>
      <PieceMesh piece={piece} />
      {draggable && (
        <mesh
          position={[0, 0.5, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag();
          }}
        >
          <cylinderGeometry args={[0.45, 0.45, 0.9, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
