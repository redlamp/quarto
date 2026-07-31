import { describe, it, expect } from 'vitest';
import { findWin, isBoardFull, linesFor, type Board } from './win';
import { getVariant } from './variants';

const classic = getVariant('classic');
const empty: Board = Array.from({ length: 16 }, () => null);

function withCells(updates: Record<number, number>, size = 16): Board {
  const b: (number | null)[] = Array.from({ length: size }, () => null);
  for (const [k, v] of Object.entries(updates)) b[Number(k)] = v;
  return b;
}

describe('win', () => {
  it('does not detect a win on an empty board', () => {
    expect(findWin(empty, classic)).toBeNull();
  });

  it('detects a row win when all 4 share a trait value', () => {
    // Row 0: all four tall (trait 0 = 1).
    const board = withCells({ 0: 0b0001, 1: 0b0011, 2: 0b0101, 3: 0b0111 });
    const win = findWin(board, classic);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1, 2, 3]);
    expect(win?.shared).toContainEqual({ trait: 0, value: 1 });
  });

  it('detects a column win when all 4 share a trait value', () => {
    // Col 1: all four dark (trait 1 = 1).
    const board = withCells({ 1: 0b0010, 5: 0b0011, 9: 0b0110, 13: 0b1110 });
    const win = findWin(board, classic);
    expect(win?.cells).toEqual([1, 5, 9, 13]);
    expect(win?.shared).toContainEqual({ trait: 1, value: 1 });
  });

  it('detects a main diagonal win', () => {
    // 0,5,10,15: all square (trait 2 = 1).
    const board = withCells({ 0: 0b0100, 5: 0b0101, 10: 0b0110, 15: 0b0111 });
    const win = findWin(board, classic);
    expect(win?.cells).toEqual([0, 5, 10, 15]);
  });

  it('detects an anti-diagonal win', () => {
    // 3,6,9,12: all hollow (trait 3 = 1).
    const board = withCells({ 3: 0b1000, 6: 0b1001, 9: 0b1010, 12: 0b1100 });
    const win = findWin(board, classic);
    expect(win?.cells).toEqual([3, 6, 9, 12]);
  });

  it('detects a shared-zero win (all light = tone value 0)', () => {
    // Row 1: 4,5,6,7 — all trait 1 = 0.
    const board = withCells({ 4: 0b0000, 5: 0b0001, 6: 0b0100, 7: 0b1101 });
    const win = findWin(board, classic);
    expect(win).not.toBeNull();
    expect(win?.shared).toContainEqual({ trait: 1, value: 0 });
  });

  it('does not detect a win when the line has no shared trait value', () => {
    const board = withCells({ 0: 0b0000, 1: 0b0011, 2: 0b1100, 3: 0b1111 });
    expect(findWin(board, classic)).toBeNull();
  });

  it('does not detect a win when a line is incomplete', () => {
    const board = withCells({ 0: 0b0001, 1: 0b0011, 2: 0b0101 });
    expect(findWin(board, classic)).toBeNull();
  });

  it('enumerates 2n + 2 winning lines per board size', () => {
    expect(linesFor(2).length).toBe(6);
    expect(linesFor(3).length).toBe(8);
    expect(linesFor(4).length).toBe(10);
    expect(linesFor(5).length).toBe(12);
    expect(linesFor(6).length).toBe(14);
  });

  it('detects a 2-in-a-line win on the duo board', () => {
    const duo = getVariant('duo');
    // Pieces 0 (round light) and 1 (square light) share tone on row 0.
    const board = withCells({ 0: 0, 1: 1 }, 4);
    const win = findWin(board, duo);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1]);
    expect(win?.shared).toContainEqual({ trait: 1, value: 0 });
  });

  it('rejects a duo line of exact opposites', () => {
    const duo = getVariant('duo');
    // Piece 0 (round light) vs 3 (square dark) — no shared value.
    const board = withCells({ 0: 0, 1: 3 }, 4);
    expect(findWin(board, duo)).toBeNull();
  });

  it('detects a ternary-trait win on the hexa board', () => {
    const hexa = getVariant('hexa');
    // Row 0 of 6: all mid tone (trait 2 = 1). Trait radices: 2,2,3,3 →
    // piece = h + 2*top + 4*tone + 12*shape; tone=1 pieces: 4 + h + 2*top + 12*shape.
    const tone1 = [4, 5, 6, 7, 16, 17];
    const board = withCells(Object.fromEntries(tone1.map((p, i) => [i, p])), 36);
    const win = findWin(board, hexa);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1, 2, 3, 4, 5]);
    expect(win?.shared).toContainEqual({ trait: 2, value: 1 });
  });

  it('isBoardFull returns true only when all cells filled', () => {
    expect(isBoardFull(empty)).toBe(false);
    const full: Board = Array.from({ length: 16 }, (_, i) => i);
    expect(isBoardFull(full)).toBe(true);
  });
});
