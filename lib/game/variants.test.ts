import { describe, it, expect } from 'vitest';
import {
  VARIANTS,
  getVariant,
  piecesOf,
  traitValuesOf,
  describePiece,
  visualParamsOf,
} from './variants';

describe('variants', () => {
  it('registers the full playtest lineup', () => {
    expect(VARIANTS.map((v) => v.id)).toEqual(['duo', 'trio', 'classic', 'alt', 'penta', 'hexa']);
  });

  it('piece counts follow the trait product', () => {
    const counts = Object.fromEntries(VARIANTS.map((v) => [v.id, v.pieceCount]));
    expect(counts).toEqual({ duo: 4, trio: 8, classic: 16, alt: 16, penta: 25, hexa: 36 });
  });

  it('piece count matches board cells except the deliberate trio mismatch', () => {
    for (const v of VARIANTS) {
      const cells = v.boardSize * v.boardSize;
      if (v.id === 'trio') expect(v.pieceCount).toBe(cells - 1);
      else expect(v.pieceCount).toBe(cells);
    }
  });

  it('every piece has a unique trait vector and a unique description', () => {
    for (const v of VARIANTS) {
      const vectors = new Set(piecesOf(v).map((p) => traitValuesOf(v, p).join(',')));
      const descriptions = new Set(piecesOf(v).map((p) => describePiece(v, p)));
      expect(vectors.size).toBe(v.pieceCount);
      expect(descriptions.size).toBe(v.pieceCount);
    }
  });

  it('classic mixed-radix layout reproduces the canonical 4-bit encoding', () => {
    const classic = getVariant('classic');
    expect(traitValuesOf(classic, 0b0000)).toEqual([0, 0, 0, 0]);
    expect(traitValuesOf(classic, 0b1111)).toEqual([1, 1, 1, 1]);
    expect(traitValuesOf(classic, 0b0101)).toEqual([1, 0, 1, 0]);
    expect(describePiece(classic, 0b0000)).toBe('short light round solid');
    expect(describePiece(classic, 0b1111)).toBe('tall dark square hollow');
  });

  it('trait value labels are single words (the HUD splits on spaces)', () => {
    for (const v of VARIANTS) {
      for (const trait of v.traits) {
        for (const label of trait.values) {
          expect(label).not.toMatch(/\s/);
        }
      }
    }
  });

  it('win declarations match the line length (Italian ordinals)', () => {
    const calls = Object.fromEntries(VARIANTS.map((v) => [v.id, v.call]));
    expect(calls).toEqual({
      duo: 'Secondo',
      trio: 'Terzo',
      classic: 'Quarto',
      alt: 'Quarto',
      penta: 'Quinto',
      hexa: 'Sesto',
    });
  });

  it('getVariant falls back to classic for unknown ids', () => {
    expect(getVariant('nope').id).toBe('classic');
    expect(getVariant(undefined).id).toBe('classic');
  });

  it('penta shade couples height and tone for redundant encoding', () => {
    const penta = getVariant('penta');
    const palest = visualParamsOf(penta, 0); // shade palest
    const deepest = visualParamsOf(penta, 5 * 4); // shade deepest (trait 1 value 4)
    expect(palest.heightT).toBe(0);
    expect(palest.toneT).toBe(0);
    expect(deepest.heightT).toBe(1);
    expect(deepest.toneT).toBe(1);
  });

  it('alt variant encodes girth and band instead of height and hollow', () => {
    const alt = getVariant('alt');
    const slimPlain = visualParamsOf(alt, 0);
    expect(slimPlain.girthT).toBe(0);
    expect(slimPlain.band).toBe(false);
    expect(slimPlain.hollow).toBe(false);
    const wideBanded = visualParamsOf(alt, 0b0011);
    expect(wideBanded.girthT).toBe(1);
    expect(wideBanded.band).toBe(true);
    expect(wideBanded.hollow).toBe(false);
  });
});
