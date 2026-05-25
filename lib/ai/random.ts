import type { Bot, BotInput, BotMove } from './types';
import { findWin } from '@/lib/game/win';

function pickRandom<T>(arr: readonly T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function decideRandom({ G, stage }: BotInput): BotMove {
  // Free win — always claim it.
  if (findWin(G.board) !== null) {
    return { kind: 'callQuarto' };
  }
  if (stage === 'place') {
    const emptyCells: number[] = [];
    for (let i = 0; i < G.board.length; i++) {
      if (G.board[i] === null || G.board[i] === undefined) emptyCells.push(i);
    }
    if (emptyCells.length === 0) {
      // No legal placement — shouldn't happen mid-game.
      throw new Error('decideRandom called with no empty cells in place stage');
    }
    return { kind: 'place', cell: pickRandom(emptyCells) };
  }
  // Pick stage.
  if (G.available.length === 0) {
    throw new Error('decideRandom called with no available pieces in pick stage');
  }
  return { kind: 'pick', piece: pickRandom(G.available) };
}

export const randomBot: Bot = {
  name: 'random',
  label: 'Random',
  decide: decideRandom,
};
