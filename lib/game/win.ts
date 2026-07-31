import type { Piece } from './pieces';
import { traitValuesOf, type SharedTrait, type VariantDef } from './variants';

export type Cell = Piece | null;
export type Board = readonly Cell[];

export interface WinLine {
  cells: readonly number[];
  shared: readonly SharedTrait[];
}

const linesCache = new Map<number, readonly (readonly number[])[]>();

// n rows + n cols + 2 diagonals for an n×n board. Cell indices row-major.
export function linesFor(size: number): readonly (readonly number[])[] {
  const cached = linesCache.get(size);
  if (cached) return cached;
  const lines: number[][] = [];
  for (let r = 0; r < size; r++) lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c++) lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  const frozen = Object.freeze(lines.map((l) => Object.freeze(l)));
  linesCache.set(size, frozen);
  return frozen;
}

// A line wins when every cell is filled and at least one trait holds the same
// value across all of them.
function checkLine(board: Board, line: readonly number[], variant: VariantDef): WinLine | null {
  const pieces: Piece[] = [];
  for (const idx of line) {
    const cell = board[idx];
    if (cell === null || cell === undefined) return null;
    pieces.push(cell);
  }
  const first = traitValuesOf(variant, pieces[0]!);
  const rest = pieces.slice(1).map((p) => traitValuesOf(variant, p));
  const shared: SharedTrait[] = [];
  for (let t = 0; t < variant.traits.length; t++) {
    const v = first[t]!;
    if (rest.every((values) => values[t] === v)) shared.push({ trait: t, value: v });
  }
  return shared.length > 0 ? { cells: line, shared } : null;
}

export function findWin(board: Board, variant: VariantDef): WinLine | null {
  for (const line of linesFor(variant.boardSize)) {
    const win = checkLine(board, line, variant);
    if (win) return win;
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((c) => c !== null && c !== undefined);
}
