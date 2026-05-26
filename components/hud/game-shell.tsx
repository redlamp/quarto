'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { TopBar } from './top-bar';
import { BottomHud } from './bottom-hud';
import { SettingsDrawer } from './settings-drawer';
import { WinBanner } from './win-banner';
import { UiThemeSync } from './ui-theme-sync';
import { useQuartoClient } from '@/hooks/use-quarto-client';
import { useAiOpponent } from '@/hooks/use-ai-opponent';
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

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden">
      <UiThemeSync />
      <TopBar state={state} />
      <div className="relative flex-1">
        <BoardCanvas state={state} moves={moves} />
      </div>
      <BottomHud state={state} moves={moves} />
      <SettingsDrawer onRestart={restart} />
      <WinBanner state={state} onRestart={restart} />
    </main>
  );
}
