'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { rackSlotWorld } from './piece-rack';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';
import { useFlightStore } from '@/lib/state/flight-store';
import type { Piece } from '@/lib/game/pieces';
import type { VariantDef } from '@/lib/game/variants';

interface HandoffFlightProps {
  variant: VariantDef;
  handedPiece: Piece | null;
  receiver: '0' | '1' | null;
}

const PEDESTAL_Z: Record<'0' | '1', number> = { '0': 2.7, '1': -2.7 };
const ARC_PEAK_Y = 1.6;

export function HandoffFlight({ variant, handedPiece, receiver }: HandoffFlightProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const groupRef = useRef<Group>(null);
  const prevHanded = useRef<Piece | null>(handedPiece);
  const flightToken = useRef(0);
  const setFlying = useFlightStore((s) => s.setFlying);
  const clearFlying = useFlightStore((s) => s.clear);
  const [flightPiece, setFlightPiece] = useState<Piece | null>(null);

  useGSAP(
    () => {
      const wasNull = prevHanded.current === null;
      prevHanded.current = handedPiece;
      const g = groupRef.current;
      if (handedPiece === null || !wasNull || receiver === null || !g) return;

      const token = ++flightToken.current;
      const from = rackSlotWorld(variant, theme.piece.cellPitch, handedPiece);
      const toX = 0;
      const toZ = PEDESTAL_Z[receiver];
      g.position.set(from[0], 0, from[2]);
      setFlightPiece(handedPiece);
      setFlying(receiver);

      // Guard against a rapid follow-up flight (fast AI): a stale timeline's
      // onComplete must not clear a newer flight's state.
      const finish = () => {
        if (flightToken.current !== token) return;
        setFlightPiece(null);
        clearFlying();
      };

      const dur = motion.reduced ? 0 : motion.cinematic;
      if (dur === 0) {
        finish();
        return;
      }
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(g.position, { x: toX, z: toZ, duration: dur, ease: 'power1.inOut' }, 0);
      tl.to(g.position, { y: ARC_PEAK_Y, duration: dur / 2, ease: 'power2.out' }, 0);
      tl.to(g.position, { y: 0, duration: dur / 2, ease: 'power2.in' }, dur / 2);
    },
    {
      dependencies: [
        handedPiece,
        receiver,
        variant,
        theme.piece.cellPitch,
        motion.cinematic,
        motion.reduced,
      ],
    },
  );

  return (
    <group ref={groupRef} visible={flightPiece !== null}>
      {flightPiece !== null && (
        <PieceMesh variant={variant} piece={flightPiece} interactive={false} />
      )}
    </group>
  );
}
