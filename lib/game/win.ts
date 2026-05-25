import { ATTR_MASK, type Piece } from './pieces';

export type Cell = Piece | null;
export type Board = readonly Cell[];

export type LineIndices = readonly [number, number, number, number];

// 4 rows + 4 cols + 2 diagonals. Cell indices 0..15 = row-major.
export const LINES: readonly LineIndices[] = Object.freeze([
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
] as const);

export interface WinLine {
  cells: LineIndices;
  sharedMask: number;
}

// A line wins when all four cells are filled and at least one bit is
// shared (all-on) or co-cleared (all-off) across the four pieces.
function checkLine(board: Board, line: LineIndices): WinLine | null {
  const [a, b, c, d] = [board[line[0]], board[line[1]], board[line[2]], board[line[3]]];
  if (a === null || a === undefined) return null;
  if (b === null || b === undefined) return null;
  if (c === null || c === undefined) return null;
  if (d === null || d === undefined) return null;
  const sharedOn = a & b & c & d & ATTR_MASK;
  const sharedOff = ~a & ~b & ~c & ~d & ATTR_MASK;
  const sharedMask = (sharedOn | sharedOff) & ATTR_MASK;
  return sharedMask !== 0 ? { cells: line, sharedMask } : null;
}

export function findWin(board: Board): WinLine | null {
  for (const line of LINES) {
    const win = checkLine(board, line);
    if (win) return win;
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((c) => c !== null && c !== undefined);
}
