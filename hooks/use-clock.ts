'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/lib/state/ui-store';
import {
  computeRemaining,
  getClockPreset,
  modeFor,
  tickRateMs,
  type ClockMode,
  type ClockPreset,
} from '@/lib/clock/math';
import type { QuartoState } from '@/lib/game/definition';

interface StateLike {
  G: QuartoState;
  ctx: {
    currentPlayer: string;
    gameover?: unknown;
    activePlayers?: Record<string, string> | null;
  };
}

export interface ClockTick {
  p0Ms: number;
  p1Ms: number;
  active: '0' | '1' | null;
  mode: ClockMode;
  preset: ClockPreset;
}

interface ClockState {
  p0Ms: number;
  p1Ms: number;
  active: '0' | '1' | null;
  turnStartedAt: number | null;
  prevCurrentPlayer: string | null;
  prevMoveCount: number;
  prevGameover: boolean;
}

function moveCount(G: QuartoState): number {
  let placed = 0;
  for (const c of G.board) if (c !== null) placed++;
  const handed = G.handedPiece !== null ? 1 : 0;
  const taken = 16 - G.available.length;
  return placed + handed + taken;
}

function isAiPlayer(playerId: string, opponent: string): boolean {
  return opponent === 'ai-random' && playerId === '1';
}

function fresh(preset: ClockPreset): ClockState {
  return {
    p0Ms: preset.initialMs,
    p1Ms: preset.initialMs,
    active: null,
    turnStartedAt: null,
    prevCurrentPlayer: null,
    prevMoveCount: 0,
    prevGameover: false,
  };
}

export function useClock(state: StateLike | null): ClockTick {
  const presetName = useUiStore((s) => s.clockPresetName);
  const opponent = useUiStore((s) => s.opponent);
  const preset = getClockPreset(presetName);
  const mode = modeFor(preset);

  const [clock, setClock] = useState<ClockState>(() => fresh(preset));
  const [now, setNow] = useState<number | null>(null);

  // Re-seed on preset change.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setClock(fresh(preset));
  }, [preset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Drive transitions from game state (turn switch, restart, gameover).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (mode === 'untimed') return;
    if (!state) return;
    const t = performance.now();
    const moves = moveCount(state.G);
    const cp = state.ctx.currentPlayer;
    const gameover = !!state.ctx.gameover;

    setClock((prev) => {
      let next = prev;

      // Restart detection: move count dropped (fresh game).
      if (moves < prev.prevMoveCount) {
        next = fresh(preset);
      }

      if (gameover && !next.prevGameover) {
        let p0Ms = next.p0Ms;
        let p1Ms = next.p1Ms;
        if (next.active !== null && next.turnStartedAt !== null) {
          const elapsed = t - next.turnStartedAt;
          if (next.active === '0') p0Ms = Math.max(0, p0Ms - elapsed);
          else p1Ms = Math.max(0, p1Ms - elapsed);
        }
        return {
          ...next,
          p0Ms,
          p1Ms,
          active: null,
          turnStartedAt: null,
          prevCurrentPlayer: cp,
          prevMoveCount: moves,
          prevGameover: true,
        };
      }

      const expectedActive: '0' | '1' | null = gameover
        ? null
        : isAiPlayer(cp, opponent)
          ? null
          : (cp as '0' | '1');

      if (expectedActive !== next.active || next.prevCurrentPlayer !== cp) {
        let p0Ms = next.p0Ms;
        let p1Ms = next.p1Ms;
        if (next.active !== null && next.turnStartedAt !== null) {
          const elapsed = t - next.turnStartedAt;
          if (next.active === '0') {
            p0Ms = Math.max(0, p0Ms - elapsed) + preset.incrementMs;
          } else {
            p1Ms = Math.max(0, p1Ms - elapsed) + preset.incrementMs;
          }
        }
        return {
          ...next,
          p0Ms,
          p1Ms,
          active: expectedActive,
          turnStartedAt: expectedActive !== null ? t : null,
          prevCurrentPlayer: cp,
          prevMoveCount: moves,
          prevGameover: gameover,
        };
      }

      return {
        ...next,
        prevCurrentPlayer: cp,
        prevMoveCount: moves,
        prevGameover: gameover,
      };
    });
  }, [state, mode, opponent, preset, preset.initialMs, preset.incrementMs]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Ticker: re-render at adaptive cadence so the displayed time interpolates.
  useEffect(() => {
    if (mode === 'untimed') return;
    if (clock.active === null) return;
    const displayed = clock.active === '0' ? clock.p0Ms : clock.p1Ms;
    const interval = tickRateMs('live', displayed);
    if (interval <= 0) return;
    const id = window.setInterval(() => setNow(performance.now()), interval);
    return () => window.clearInterval(id);
  }, [mode, clock.active, clock.p0Ms, clock.p1Ms]);

  if (mode === 'untimed') {
    return { p0Ms: 0, p1Ms: 0, active: null, mode, preset };
  }

  const nowMs = now ?? clock.turnStartedAt ?? 0;
  const p0Disp = computeRemaining({
    remainingMs: clock.p0Ms,
    turnStartedAtMs: clock.turnStartedAt,
    nowMs,
    isActive: clock.active === '0',
  });
  const p1Disp = computeRemaining({
    remainingMs: clock.p1Ms,
    turnStartedAtMs: clock.turnStartedAt,
    nowMs,
    isActive: clock.active === '1',
  });
  return { p0Ms: p0Disp, p1Ms: p1Disp, active: clock.active, mode, preset };
}
