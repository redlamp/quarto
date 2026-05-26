'use client';

import { useEffect, useRef } from 'react';
import { useSfx } from './use-sfx';
import type { QuartoState } from '@/lib/game/definition';

interface StateLike {
  G: QuartoState;
  ctx: { gameover?: unknown; currentPlayer: string };
}

function filledCount(board: readonly (number | null)[]): number {
  let n = 0;
  for (const v of board) if (v !== null) n++;
  return n;
}

// Watches game state and fires SFX on transitions:
//  - piece-place when a new piece lands on the board
//  - handoff    when the current player flips (and a piece is now handed)
//  - win-fanfare on gameover transition
export function useSfxBus(state: StateLike | null): void {
  const play = useSfx();
  const prev = useRef<StateLike | null>(null);

  useEffect(() => {
    const last = prev.current;
    prev.current = state;
    if (!state || !last) return;

    if (filledCount(state.G.board) > filledCount(last.G.board)) {
      play('piece-place');
    }
    if (state.ctx.currentPlayer !== last.ctx.currentPlayer && state.G.handedPiece !== null) {
      play('handoff');
    }
    if (state.ctx.gameover && !last.ctx.gameover) {
      play('win-fanfare');
    }
  }, [state, play]);
}
