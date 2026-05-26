import type { MotionPreset } from '@/lib/theme/types';

export interface MotionDurations {
  base: number;
  cinematic: number;
  ease: string;
  reduced: boolean;
}

const REDUCED_BASE_S = 0.05;

// Maps theme motion preset (ms) → GSAP-friendly seconds.
// Reduced motion keeps essential state transitions at a minimum (50ms) so
// state-change feedback remains, but flags `reduced` so cinematic-only
// animations (handoff travel arc, win-line reveal, camera moves) can skip.
export function durationsFor(preset: MotionPreset, reducedMotion: boolean): MotionDurations {
  if (reducedMotion) {
    return { base: REDUCED_BASE_S, cinematic: 0, ease: 'none', reduced: true };
  }
  return {
    base: preset.base / 1000,
    cinematic: preset.cinematic / 1000,
    ease: preset.ease,
    reduced: false,
  };
}
