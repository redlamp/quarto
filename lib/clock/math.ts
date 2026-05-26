// Pure clock math — ported from narrative-chess-v2/lib/chess/clock.ts.
// Dropped: LAG_CREDIT_MS (no server mirror), correspondence mode (deferred).

export type ClockMode = 'untimed' | 'live';

export interface ClockPreset {
  name: string;
  label: string;
  initialMs: number;
  incrementMs: number;
}

export const CLOCK_PRESETS: readonly ClockPreset[] = [
  { name: 'untimed', label: 'Untimed', initialMs: 0, incrementMs: 0 },
  { name: 'blitz-3-0', label: 'Blitz 3+0', initialMs: 3 * 60_000, incrementMs: 0 },
  { name: 'blitz-5-0', label: 'Blitz 5+0', initialMs: 5 * 60_000, incrementMs: 0 },
  { name: 'rapid-10-0', label: 'Rapid 10+0', initialMs: 10 * 60_000, incrementMs: 0 },
  { name: 'rapid-15-10', label: 'Rapid 15+10', initialMs: 15 * 60_000, incrementMs: 10_000 },
];

export const DEFAULT_CLOCK_PRESET = CLOCK_PRESETS[0]!;

export function getClockPreset(name: string | null | undefined): ClockPreset {
  if (!name) return DEFAULT_CLOCK_PRESET;
  return CLOCK_PRESETS.find((p) => p.name === name) ?? DEFAULT_CLOCK_PRESET;
}

export function modeFor(preset: ClockPreset): ClockMode {
  return preset.initialMs > 0 ? 'live' : 'untimed';
}

export function computeRemaining(args: {
  remainingMs: number;
  turnStartedAtMs: number | null;
  nowMs: number;
  isActive: boolean;
}): number {
  const { remainingMs, turnStartedAtMs, nowMs, isActive } = args;
  if (!isActive || turnStartedAtMs === null) return remainingMs;
  const elapsed = nowMs - turnStartedAtMs;
  const adjusted = remainingMs - elapsed;
  return adjusted > 0 ? adjusted : 0;
}

export function formatLive(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe >= 10_000) {
    const totalSec = Math.floor(safe / 1_000);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }
  const totalTenths = Math.floor(safe / 100);
  const sec = Math.floor(totalTenths / 10);
  const tenth = totalTenths % 10;
  return `0:${sec.toString().padStart(2, '0')}.${tenth}`;
}

export function tickRateMs(mode: ClockMode, displayedMs: number): number {
  if (mode === 'untimed') return 0;
  return displayedMs <= 10_000 ? 100 : 1_000;
}
