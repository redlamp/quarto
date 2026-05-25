'use client';

import { Button } from '@/components/ui/button';
import { ATTR, ATTR_NAMES, ATTR_VALUE_LABELS, type AttrName } from '@/lib/game/pieces';
import type { QuartoState } from '@/lib/game/definition';

interface WinBannerProps {
  state: { G: QuartoState; ctx: { gameover?: { winner?: string; draw?: boolean } } } | null;
  onRestart: () => void;
}

function sharedAttributeLabel(mask: number, samplePiece: number): string {
  const parts: string[] = [];
  for (const name of ATTR_NAMES) {
    const bit = ATTR[name as AttrName];
    if ((mask & bit) === 0) continue;
    const valueIndex = (samplePiece & bit) === 0 ? 0 : 1;
    parts.push(ATTR_VALUE_LABELS[name as AttrName][valueIndex]);
  }
  return parts.length ? parts.join(', ') : '';
}

export function WinBanner({ state, onRestart }: WinBannerProps) {
  if (!state) return null;
  const gameover = state.ctx.gameover;
  if (!gameover) return null;
  const winner = state.G.winner;
  const draw = state.G.draw || gameover.draw;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-8">
      <div className="bg-snow flex w-[min(420px,90vw)] flex-col items-center gap-4 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-semibold tracking-tight">
          {winner ? `Player ${Number(winner.player) + 1} wins` : draw ? 'Draw' : 'Game over'}
        </h2>
        {winner && state.G.board[winner.line[0]] !== null && (
          <p className="text-slate text-sm">
            Line shared:{' '}
            {sharedAttributeLabel(winner.sharedMask, state.G.board[winner.line[0]] ?? 0)}
          </p>
        )}
        <Button onClick={onRestart}>Play again</Button>
      </div>
    </div>
  );
}
