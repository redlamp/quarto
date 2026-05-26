'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Group } from 'three';
import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useMotion } from '@/lib/motion/use-motion';
import { useFlightStore } from '@/lib/state/flight-store';
import type { Piece } from '@/lib/game/pieces';
import type { Cell } from '@/lib/game/win';

interface PlacementFlightProps {
  cells: readonly Cell[];
  currentPlayer: string | null;
  cellPitch: number;
}

const PEDESTAL_Z: Record<'0' | '1', number> = { '0': 2.7, '1': -2.7 };
const ARC_PEAK_Y = 1.4;

interface PendingPlacement {
  piece: Piece;
  idx: number;
  fromZ: number;
}

function cellWorld(idx: number, pitch: number): [number, number, number] {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return [(col - 1.5) * pitch, 0, (row - 1.5) * pitch];
}

export function PlacementFlight({ cells, currentPlayer, cellPitch }: PlacementFlightProps) {
  const motion = useMotion();
  const groupRef = useRef<Group>(null);
  const prevCells = useRef<readonly Cell[]>(cells);
  const pending = useRef<PendingPlacement | null>(null);
  const flightToken = useRef(0);
  const flyingReceiver = useFlightStore((s) => s.flyingReceiver);
  const setFlyingCell = useFlightStore((s) => s.setFlyingCell);
  const clearFlyingCell = useFlightStore((s) => s.clearFlyingCell);
  const [flight, setFlight] = useState<PendingPlacement | null>(null);

  // Detect a newly-placed piece and stash it as pending (cell suppressed
  // immediately so the resting piece doesn't pop in before the arc).
  useGSAP(
    () => {
      const prev = prevCells.current;
      prevCells.current = cells;
      for (let i = 0; i < 16; i++) {
        const before = prev[i] ?? null;
        const now = cells[i] ?? null;
        if (before === null && now !== null && currentPlayer !== null) {
          pending.current = {
            piece: now,
            idx: i,
            fromZ: PEDESTAL_Z[currentPlayer as '0' | '1'],
          };
          setFlyingCell(i);
          break;
        }
      }
    },
    { dependencies: [cells, currentPlayer] },
  );

  // Launch the arc once the inbound handoff flight (if any) has landed.
  useGSAP(
    () => {
      const g = groupRef.current;
      if (!pending.current || flight !== null || flyingReceiver !== null || !g) return;

      const p = pending.current;
      pending.current = null;
      const token = ++flightToken.current;
      const [toX, , toZ] = cellWorld(p.idx, cellPitch);
      g.position.set(0, 0, p.fromZ);
      setFlight(p);

      const finish = () => {
        if (flightToken.current !== token) return;
        setFlight(null);
        clearFlyingCell();
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
    { dependencies: [flyingReceiver, cells, flight, cellPitch, motion.cinematic, motion.reduced] },
  );

  return (
    <group ref={groupRef} visible={flight !== null}>
      {flight !== null && <PieceMesh piece={flight.piece} interactive={false} />}
    </group>
  );
}
