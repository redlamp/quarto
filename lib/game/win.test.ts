import { describe, it, expect } from 'vitest';
import { findWin, isBoardFull, linesFor, type Board } from './win';
import { buildVariant } from './variants';

const classic = buildVariant(4);
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

  it('detects a row win when all 4 share a trait expression', () => {
    // Row 0: all four tall (trait 0 = 1).
    const board = withCells({ 0: 0b0001, 1: 0b0011, 2: 0b0101, 3: 0b0111 });
    const win = findWin(board, classic);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1, 2, 3]);
    expect(win?.shared).toContainEqual({ trait: 0, value: 1 });
  });

  it('detects a column win when all 4 share a trait expression', () => {
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

  it('does not detect a win when the line has no shared trait expression', () => {
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

  it('detects a 2-in-a-line win on the 2×2 board', () => {
    const duo = buildVariant(2); // tone, shape
    // Pieces 0 (light round) and 2 (light square) share tone on row 0.
    const board = withCells({ 0: 0, 1: 2 }, 4);
    const win = findWin(board, duo);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1]);
    expect(win?.shared).toContainEqual({ trait: 0, value: 0 });
  });

  it('rejects a 2×2 line of exact opposites', () => {
    const duo = buildVariant(2);
    // Piece 0 (light round) vs 3 (dark square) — no shared expression.
    const board = withCells({ 0: 0, 1: 3 }, 4);
    expect(findWin(board, duo)).toBeNull();
  });

  it('detects a shared-hue win on the 6×6 board', () => {
    const hexa = buildVariant(6); // height, tone, hue, shape, top, girth
    // Row 0 of 6: all blue (trait 2 = 1); every other binary trait mixed
    // except girth (also all slim — a second shared trait is fine).
    const blue = [0b000100, 0b000101, 0b000110, 0b000111, 0b001100, 0b010100];
    const board = withCells(Object.fromEntries(blue.map((p, i) => [i, p])), 36);
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
