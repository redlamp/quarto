'use client';

import { useMemo } from 'react';
import { useTheme } from '@/lib/theme/context';
import { durationsFor, type MotionDurations } from './durations';
import { useReducedMotion } from './use-reduced-motion';

export function useMotion(): MotionDurations {
  const { motionPreset } = useTheme();
  const reduced = useReducedMotion();
  return useMemo(() => durationsFor(motionPreset, reduced), [motionPreset, reduced]);
}
