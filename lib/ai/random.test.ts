import { describe, it, expect } from 'vitest';
import { decideRandom } from './random';
import { ALL_PIECES } from '@/lib/game/pieces';
import type { QuartoState } from '@/lib/game/definition';

function emptyState(): QuartoState {
  return {
    board: Array.from({ length: 16 }, () => null),
    available: ALL_PIECES.slice(),
    handedPiece: null,
    pendingPlace: null,
    pendingHandoff: null,
    winner: null,
    draw: false,
    timeoutLoser: null,
    aborted: false,
  };
}

describe('random bot', () => {
  it('returns a pick from the available pool in pick stage', () => {
    const G = emptyState();
    const move = decideRandom({ G, stage: 'pick' });
    expect(move.kind).toBe('pick');
    if (move.kind === 'pick') {
      expect(G.available).toContain(move.piece);
    }
  });

  it('returns a place at an empty cell in place stage', () => {
    const G = emptyState();
    G.board[0] = 0b0001;
    G.board[5] = 0b0010;
    G.handedPiece = 0b0011;
    const move = decideRandom({ G, stage: 'place' });
    expect(move.kind).toBe('place');
    if (move.kind === 'place') {
      expect(G.board[move.cell]).toBeNull();
      expect(move.cell).not.toBe(0);
      expect(move.cell).not.toBe(5);
    }
  });

  it('calls Quarto whenever the board has a winning line — free win', () => {
    const G = emptyState();
    // Row 0: all four tall (bit 0 set) → win available.
    G.board[0] = 0b0001;
    G.board[1] = 0b0011;
    G.board[2] = 0b0101;
    G.board[3] = 0b0111;
    const moveInPlace = decideRandom({ G, stage: 'place' });
    expect(moveInPlace.kind).toBe('callQuarto');
    const moveInPick = decideRandom({ G, stage: 'pick' });
    expect(moveInPick.kind).toBe('callQuarto');
  });

  it('throws if asked to pick with no available pieces', () => {
    const G = emptyState();
    G.available = [];
    expect(() => decideRandom({ G, stage: 'pick' })).toThrow();
  });
});
