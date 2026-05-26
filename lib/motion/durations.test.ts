import { describe, it, expect } from 'vitest';
import { durationsFor } from './durations';
import type { MotionPreset } from '@/lib/theme/types';

const smooth: MotionPreset = {
  name: 'smooth',
  label: 'Smooth',
  base: 280,
  cinematic: 600,
  ease: 'power3.out',
};

describe('durationsFor', () => {
  it('converts ms → seconds when reduced motion off', () => {
    const d = durationsFor(smooth, false);
    expect(d.base).toBeCloseTo(0.28);
    expect(d.cinematic).toBeCloseTo(0.6);
    expect(d.ease).toBe('power3.out');
    expect(d.reduced).toBe(false);
  });

  it('clamps base to essential minimum and zeroes cinematic under reduced motion', () => {
    const d = durationsFor(smooth, true);
    expect(d.base).toBeGreaterThan(0);
    expect(d.base).toBeLessThan(0.1);
    expect(d.cinematic).toBe(0);
    expect(d.ease).toBe('none');
    expect(d.reduced).toBe(true);
  });
});
