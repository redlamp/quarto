'use client';

import { Button } from '@/components/ui/button';
import { ATTR, ATTR_NAMES, ATTR_VALUE_LABELS, type AttrName } from '@/lib/game/pieces';
import type { QuartoState } from '@/lib/game/definition';

interface WinBannerProps {
  state: { G: QuartoState; ctx: { gameover?: { winner?: string; draw?: boolean } } } | null;
  onRestart: () => void;
}

function sharedAttributeLabels(mask: number, samplePiece: number): string[] {
  const parts: string[] = [];
  for (const name of ATTR_NAMES) {
    const bit = ATTR[name as AttrName];
    if ((mask & bit) === 0) continue;
    const valueIndex = (samplePiece & bit) === 0 ? 0 : 1;
    parts.push(ATTR_VALUE_LABELS[name as AttrName][valueIndex]);
  }
  return parts;
}

export function WinBanner({ state, onRestart }: WinBannerProps) {
  if (!state) return null;
  const gameover = state.ctx.gameover;
  if (!gameover) return null;
  const winner = state.G.winner;
  const timeoutLoser = state.G.timeoutLoser;
  const aborted = state.G.aborted;
  const draw = state.G.draw || gameover.draw;

  const title = aborted
    ? 'Game aborted'
    : winner
      ? `Player ${Number(winner.player) + 1} wins`
      : timeoutLoser !== null
        ? `Player ${timeoutLoser === '0' ? 2 : 1} wins on time`
        : draw
          ? 'Draw'
          : 'Game over';

  const subtitle = aborted ? 'Ran out of time on the first move — no result.' : null;

  const sharedTraits =
    winner && state.G.board[winner.line[0]] !== null
      ? sharedAttributeLabels(winner.sharedMask, state.G.board[winner.line[0]] ?? 0)
      : [];

  // Float above the board near the top — no full-screen scrim, so the winning
  // line stays visible and the parallax camera keeps responding to the pointer.
  // pointer-events pass through except over the card itself.
  return (
    <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex justify-center px-4 pt-20">
      <div className="border-border bg-popover text-popover-foreground pointer-events-auto flex flex-col items-center gap-4 rounded-xl border px-8 py-6 text-center shadow-2xl">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        {sharedTraits.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-popover-foreground text-xs font-semibold tracking-widest uppercase opacity-90">
              Line shared
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-sm capitalize">
              {sharedTraits.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-amber-300 px-3 py-1 font-bold text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_0_1px_rgba(180,120,30,0.5)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <Button size="lg" onClick={onRestart}>
          Play again
        </Button>
      </div>
    </div>
  );
}
