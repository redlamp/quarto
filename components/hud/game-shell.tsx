'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { TopBar } from './top-bar';
import { BottomHud } from './bottom-hud';
import { ClockDisplay } from './clock-display';
import { SettingsDrawer } from './settings-drawer';
import { WinBanner } from './win-banner';
import { UiThemeSync } from './ui-theme-sync';
import { useQuartoClient } from '@/hooks/use-quarto-client';
import { useAiOpponent } from '@/hooks/use-ai-opponent';
import { useClock } from '@/hooks/use-clock';
import { useSfxBus } from '@/hooks/use-sfx-bus';
import { useUiStore } from '@/lib/state/ui-store';
import { useHoverStore } from '@/lib/state/hover-store';

const BoardCanvas = dynamic(
  () => import('@/components/canvas/board-canvas').then((m) => m.BoardCanvas),
  { ssr: false },
);

export function GameShell() {
  const { state, moves, restart } = useQuartoClient();
  const opponent = useUiStore((s) => s.opponent);
  const lastOpponent = useRef(opponent);

  // Restart game when opponent mode swaps (avoids mid-game incoherence).
  useEffect(() => {
    if (lastOpponent.current !== opponent) {
      lastOpponent.current = opponent;
      restart();
    }
  }, [opponent, restart]);

  useAiOpponent({
    state,
    moves,
    enabled: opponent === 'ai-random',
  });

  useSfxBus(state);
  const clock = useClock(state);
  const clockOn = clock.mode === 'live';

  // Flag-fall enforcement: when the player on the clock hits zero, end the game
  // (the move resolves to a loss, or an abort if no move was committed yet). The
  // AI never holds an active clock, so only a human can flag. Guarded so the
  // move fires once per game.
  const gameover = !!state?.ctx.gameover;
  const flagged = useRef(false);
  const activeMs = clock.active === '0' ? clock.p0Ms : clock.active === '1' ? clock.p1Ms : null;
  const flagFall = moves.flagFall;
  useEffect(() => {
    if (gameover) {
      flagged.current = false;
      return;
    }
    if (!clockOn || activeMs === null) return;
    if (activeMs <= 0 && !flagged.current) {
      flagged.current = true;
      flagFall();
    }
  }, [clockOn, activeMs, gameover, flagFall]);

  // Clear any stale hover highlight when the turn or stage shifts, so a piece
  // left "hovered" in a prior round doesn't reappear lit on re-entry.
  const clearHover = useHoverStore((s) => s.set);
  const currentPlayer = state?.ctx.currentPlayer ?? null;
  const stage = state ? (state.ctx.activePlayers?.[state.ctx.currentPlayer] ?? null) : null;
  useEffect(() => {
    clearHover(null);
  }, [currentPlayer, stage, clearHover]);

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden">
      <UiThemeSync />
      <TopBar state={state} />
      <div className="relative flex-1">
        <BoardCanvas state={state} moves={moves} />
        {clockOn && (
          <>
            <div className="pointer-events-none absolute top-20 left-1/2 z-10 -translate-x-1/2">
              <ClockDisplay ms={clock.p1Ms} isActive={clock.active === '1'} label="Player 2" />
            </div>
            <div className="pointer-events-none absolute bottom-32 left-1/2 z-10 -translate-x-1/2">
              <ClockDisplay ms={clock.p0Ms} isActive={clock.active === '0'} label="Player 1" />
            </div>
          </>
        )}
      </div>
      <BottomHud state={state} moves={moves} />
      <SettingsDrawer onRestart={restart} />
      <WinBanner state={state} onRestart={restart} />
    </main>
  );
}
