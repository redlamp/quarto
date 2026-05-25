import { describe, it, expect } from 'vitest';
import { findWin, isBoardFull, LINES, type Board } from './win';

const empty: Board = Array.from({ length: 16 }, () => null);

function withCells(updates: Record<number, number>): Board {
  const b = empty.slice();
  for (const [k, v] of Object.entries(updates)) b[Number(k)] = v;
  return b;
}

describe('win', () => {
  it('does not detect a win on an empty board', () => {
    expect(findWin(empty)).toBeNull();
  });

  it('detects a row win when all 4 share an attribute', () => {
    // Row 0: all four tall (bit 0 set).
    const board = withCells({ 0: 0b0001, 1: 0b0011, 2: 0b0101, 3: 0b0111 });
    const win = findWin(board);
    expect(win).not.toBeNull();
    expect(win?.cells).toEqual([0, 1, 2, 3]);
    expect((win?.sharedMask ?? 0) & 0b0001).not.toBe(0);
  });

  it('detects a column win when all 4 share an attribute', () => {
    // Col 1: all four dark (bit 1 set).
    const board = withCells({ 1: 0b0010, 5: 0b0011, 9: 0b0110, 13: 0b1110 });
    const win = findWin(board);
    expect(win?.cells).toEqual([1, 5, 9, 13]);
    expect((win?.sharedMask ?? 0) & 0b0010).not.toBe(0);
  });

  it('detects a main diagonal win', () => {
    // 0,5,10,15: all square (bit 2 set).
    const board = withCells({ 0: 0b0100, 5: 0b0101, 10: 0b0110, 15: 0b0111 });
    const win = findWin(board);
    expect(win?.cells).toEqual([0, 5, 10, 15]);
  });

  it('detects an anti-diagonal win', () => {
    // 3,6,9,12: all hollow (bit 3 set).
    const board = withCells({ 3: 0b1000, 6: 0b1001, 9: 0b1010, 12: 0b1100 });
    const win = findWin(board);
    expect(win?.cells).toEqual([3, 6, 9, 12]);
  });

  it('detects a shared-off win (all light = bit 1 cleared)', () => {
    // Row 1: 4,5,6,7 — all bit 1 = 0.
    const board = withCells({ 4: 0b0000, 5: 0b0001, 6: 0b0100, 7: 0b1101 });
    const win = findWin(board);
    expect(win).not.toBeNull();
  });

  it('does not detect a win when the line has no shared attribute', () => {
    // Row 0: four pieces with no common bit and no common cleared bit.
    const board = withCells({ 0: 0b0000, 1: 0b0011, 2: 0b1100, 3: 0b1111 });
    const win = findWin(board);
    expect(win).toBeNull();
  });

  it('does not detect a win when a line is incomplete', () => {
    const board = withCells({ 0: 0b0001, 1: 0b0011, 2: 0b0101 });
    expect(findWin(board)).toBeNull();
  });

  it('enumerates 10 winning lines', () => {
    expect(LINES.length).toBe(10);
  });

  it('isBoardFull returns true only when all cells filled', () => {
    expect(isBoardFull(empty)).toBe(false);
    const full: Board = Array.from({ length: 16 }, (_, i) => i);
    expect(isBoardFull(full)).toBe(true);
  });
});
