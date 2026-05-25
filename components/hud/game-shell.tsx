'use client';

import dynamic from 'next/dynamic';
import { TopBar } from './top-bar';
import { BottomHud } from './bottom-hud';
import { SettingsDrawer } from './settings-drawer';
import { WinBanner } from './win-banner';
import { useQuartoClient } from '@/hooks/use-quarto-client';

const BoardCanvas = dynamic(
  () => import('@/components/canvas/board-canvas').then((m) => m.BoardCanvas),
  { ssr: false },
);

export function GameShell() {
  const { state, moves, restart } = useQuartoClient();

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden">
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
