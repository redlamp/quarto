'use client';

import dynamic from 'next/dynamic';
import { TopBar } from './top-bar';
import { BottomHud } from './bottom-hud';
import { SettingsDrawer } from './settings-drawer';

const BoardCanvas = dynamic(
  () => import('@/components/canvas/board-canvas').then((m) => m.BoardCanvas),
  { ssr: false },
);

export function GameShell() {
  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <div className="relative flex-1">
        <BoardCanvas />
      </div>
      <BottomHud />
      <SettingsDrawer />
    </main>
  );
}
