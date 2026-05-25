import { describe, it, expect } from 'vitest';
import { ALL_PIECES, PIECE_COUNT, traits, describe as describePiece } from './pieces';

describe('pieces', () => {
  it('enumerates exactly 16 pieces', () => {
    expect(ALL_PIECES.length).toBe(PIECE_COUNT);
    expect(new Set(ALL_PIECES).size).toBe(16);
  });

  it('decodes traits from bitmask', () => {
    expect(traits(0b0000)).toEqual({ tall: false, dark: false, square: false, hollow: false });
    expect(traits(0b1111)).toEqual({ tall: true, dark: true, square: true, hollow: true });
    expect(traits(0b0101)).toEqual({ tall: true, dark: false, square: true, hollow: false });
  });

  it('produces a human description', () => {
    expect(describePiece(0b0000)).toBe('short light round solid');
    expect(describePiece(0b1111)).toBe('tall dark square hollow');
  });
});
