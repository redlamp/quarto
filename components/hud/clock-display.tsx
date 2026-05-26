'use client';

import { formatLive } from '@/lib/clock/math';

interface ClockDisplayProps {
  ms: number;
  isActive: boolean;
  label: string;
}

const LOW_TIME_THRESHOLD_MS = 10_000;

export function ClockDisplay({ ms, isActive, label }: ClockDisplayProps) {
  const low = ms <= LOW_TIME_THRESHOLD_MS;
  return (
    <div
      className={[
        'pointer-events-none flex flex-col items-center rounded-md px-3 py-2 font-mono shadow-md',
        isActive
          ? 'bg-[var(--color-ink)] text-[var(--color-snow)]'
          : 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]',
        low ? (isActive ? 'animate-pulse text-[var(--color-selection,#ff8a2a)]' : '') : '',
      ].join(' ')}
      aria-live="off"
    >
      <span className="text-xs tracking-wider uppercase opacity-70">{label}</span>
      <span className="text-2xl leading-none tabular-nums">{formatLive(ms)}</span>
    </div>
  );
}
