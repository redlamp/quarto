'use client';

import { useGSAP } from '@gsap/react';
import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { Group, Quaternion, Vector3 } from 'three';
import { useTheme } from '@/lib/theme/context';
import { useMotion } from '@/lib/motion/use-motion';

const TRACE_RADIUS = 0.06;
const Y_OFFSET = 0.02;
const EMISSIVE_PEAK = 1.2;

interface WinLineOverlayProps {
  cells: readonly number[];
  cellPitch: number;
}

function cellWorld(idx: number, pitch: number): Vector3 {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return new Vector3((col - 1.5) * pitch, Y_OFFSET, (row - 1.5) * pitch);
}

export function WinLineOverlay({ cells, cellPitch }: WinLineOverlayProps) {
  const { theme } = useTheme();
  const motion = useMotion();
  const groupRef = useRef<Group>(null);

  const { mid, length, quat } = useMemo(() => {
    const start = cellWorld(cells[0]!, cellPitch);
    const end = cellWorld(cells[cells.length - 1]!, cellPitch);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const delta = end.clone().sub(start);
    const len = delta.length();
    const dirN = delta.clone().normalize();
    const up = new Vector3(0, 1, 0);
    const q = new Quaternion().setFromUnitVectors(up, dirN);
    return {
      mid: midpoint,
      length: len,
      quat: [q.x, q.y, q.z, q.w] as [number, number, number, number],
    };
  }, [cells, cellPitch]);

  useGSAP(
    () => {
      const g = groupRef.current;
      if (!g) return;
      const duration = motion.reduced ? motion.base : motion.cinematic;
      g.scale.set(1, 0, 1);
      gsap.to(g.scale, {
        y: 1,
        duration,
        ease: motion.reduced ? 'none' : 'power2.out',
      });
    },
    { dependencies: [cells, motion.base, motion.cinematic, motion.reduced] },
  );

  return (
    <group ref={groupRef} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <mesh castShadow>
        <cylinderGeometry args={[TRACE_RADIUS, TRACE_RADIUS, length, 16]} />
        <meshStandardMaterial
          color={theme.colors.winLine}
          emissive={theme.colors.winLineEmissive}
          emissiveIntensity={EMISSIVE_PEAK}
          roughness={0.4}
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
