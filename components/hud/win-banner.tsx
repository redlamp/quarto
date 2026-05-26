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

  // Float above the board near the top — no full-screen scrim, so the winning
  // line stays visible and the parallax camera keeps responding to the pointer.
  // pointer-events pass through except over the card itself.
  return (
    <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex justify-center px-4 pt-20">
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-xl bg-[var(--color-surface)]/85 px-8 py-5 text-center shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          {winner ? `Player ${Number(winner.player) + 1} wins` : draw ? 'Draw' : 'Game over'}
        </h2>
        {winner && state.G.board[winner.line[0]] !== null && (
          <p className="text-sm text-[var(--color-fog)]">
            Line shared:{' '}
            {sharedAttributeLabel(winner.sharedMask, state.G.board[winner.line[0]] ?? 0)}
          </p>
        )}
        <Button onClick={onRestart} className="mt-1">
          Play again
        </Button>
      </div>
    </div>
  );
}
