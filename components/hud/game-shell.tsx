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
