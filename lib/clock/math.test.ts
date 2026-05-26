import { describe, it, expect } from 'vitest';
import {
  CLOCK_PRESETS,
  computeRemaining,
  formatLive,
  getClockPreset,
  modeFor,
  tickRateMs,
} from './math';

describe('CLOCK_PRESETS', () => {
  it('exposes Untimed, two Blitz, and two Rapid options', () => {
    const names = CLOCK_PRESETS.map((p) => p.name);
    expect(names).toEqual(['untimed', 'blitz-3-0', 'blitz-5-0', 'rapid-10-0', 'rapid-15-10']);
  });
});

describe('getClockPreset', () => {
  it('falls back to Untimed when name is missing or unknown', () => {
    expect(getClockPreset(null).name).toBe('untimed');
    expect(getClockPreset(undefined).name).toBe('untimed');
    expect(getClockPreset('does-not-exist').name).toBe('untimed');
  });
  it('returns the matching preset by name', () => {
    expect(getClockPreset('rapid-15-10').incrementMs).toBe(10_000);
  });
});

describe('modeFor', () => {
  it('returns live when preset has initial time, untimed otherwise', () => {
    expect(modeFor(CLOCK_PRESETS[0]!)).toBe('untimed');
    expect(modeFor(CLOCK_PRESETS[1]!)).toBe('live');
  });
});

describe('computeRemaining', () => {
  it('returns remaining unchanged when inactive', () => {
    expect(
      computeRemaining({
        remainingMs: 60_000,
        turnStartedAtMs: null,
        nowMs: 1000,
        isActive: false,
      }),
    ).toBe(60_000);
  });
  it('subtracts elapsed when active', () => {
    expect(
      computeRemaining({
        remainingMs: 60_000,
        turnStartedAtMs: 1000,
        nowMs: 4000,
        isActive: true,
      }),
    ).toBe(57_000);
  });
  it('clamps at 0', () => {
    expect(
      computeRemaining({
        remainingMs: 1000,
        turnStartedAtMs: 0,
        nowMs: 5000,
        isActive: true,
      }),
    ).toBe(0);
  });
});

describe('formatLive', () => {
  it('renders MM:SS above 10 seconds', () => {
    expect(formatLive(63_400)).toBe('1:03');
    expect(formatLive(10_000)).toBe('0:10');
  });
  it('renders M:SS.t below 10 seconds', () => {
    expect(formatLive(9_900)).toBe('0:09.9');
    expect(formatLive(450)).toBe('0:00.4');
  });
  it('renders 0:00.0 when ms <= 0', () => {
    expect(formatLive(0)).toBe('0:00.0');
    expect(formatLive(-100)).toBe('0:00.0');
  });
});

describe('tickRateMs', () => {
  it('is 0 in untimed mode', () => {
    expect(tickRateMs('untimed', 9999)).toBe(0);
  });
  it('is 1000ms above 10s remaining', () => {
    expect(tickRateMs('live', 30_000)).toBe(1000);
  });
  it('drops to 100ms at or below 10s', () => {
    expect(tickRateMs('live', 10_000)).toBe(100);
    expect(tickRateMs('live', 5_000)).toBe(100);
  });
});
