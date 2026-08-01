import { describe, it, expect } from 'vitest';
import {
  BOARD_SIZES,
  CALLS,
  DEFAULT_TRAITS,
  TRAIT_CATALOG,
  buildVariant,
  describePiece,
  getTrait,
  piecesOf,
  traitValuesOf,
  variantFromConfig,
  visualParamsOf,
} from './variants';

describe('trait catalog', () => {
  it('every trait is binary with single-word expression labels', () => {
    for (const t of TRAIT_CATALOG) {
      expect(t.values).toHaveLength(2);
      for (const label of t.values) expect(label).not.toMatch(/\s/);
    }
  });

  it('trait ids and visual channels are unique — one channel per trait', () => {
    expect(new Set(TRAIT_CATALOG.map((t) => t.id)).size).toBe(TRAIT_CATALOG.length);
    expect(new Set(TRAIT_CATALOG.map((t) => t.encode)).size).toBe(TRAIT_CATALOG.length);
  });

  it('conflicts are symmetric', () => {
    for (const t of TRAIT_CATALOG) {
      for (const other of t.conflictsWith) {
        expect(getTrait(other)?.conflictsWith).toContain(t.id);
      }
    }
  });

  it('default trait sets contain no conflicting pairs and match the board size', () => {
    for (const size of BOARD_SIZES) {
      const ids = DEFAULT_TRAITS[size]!;
      expect(ids.length).toBe(size);
      for (const id of ids) {
        const spec = getTrait(id)!;
        for (const other of spec.conflictsWith) expect(ids).not.toContain(other);
      }
    }
  });
});

describe('buildVariant', () => {
  it('piece count is 2^traits for every default board', () => {
    const counts = Object.fromEntries(BOARD_SIZES.map((n) => [n, buildVariant(n).pieceCount]));
    expect(counts).toEqual({ 2: 4, 3: 8, 4: 16, 5: 32, 6: 64 });
  });

  it('classic 4×4 defaults reproduce the canonical 4-bit encoding', () => {
    const classic = buildVariant(4);
    expect(classic.traits.map((t) => t.id)).toEqual(['height', 'tone', 'shape', 'top']);
    expect(traitValuesOf(classic, 0b0000)).toEqual([0, 0, 0, 0]);
    expect(traitValuesOf(classic, 0b1111)).toEqual([1, 1, 1, 1]);
    expect(describePiece(classic, 0b0000)).toBe('short light round solid');
    expect(describePiece(classic, 0b1111)).toBe('tall dark square hollow');
  });

  it('selection order does not matter — traits sort into catalog order', () => {
    const shuffled = buildVariant(4, ['top', 'shape', 'tone', 'height']);
    expect(shuffled.id).toBe(buildVariant(4).id);
  });

  it('every piece has a unique description', () => {
    for (const size of BOARD_SIZES) {
      const v = buildVariant(size);
      const descriptions = new Set(piecesOf(v).map((p) => describePiece(v, p)));
      expect(descriptions.size).toBe(v.pieceCount);
    }
  });

  it('win declarations follow the Italian ordinal series', () => {
    expect(BOARD_SIZES.map((n) => CALLS[n])).toEqual([
      'Secondo',
      'Terzo',
      'Quarto',
      'Quinto',
      'Sesto',
    ]);
    expect(buildVariant(5).call).toBe('Quinto');
    expect(buildVariant(6).call).toBe('Sesto');
  });

  it('variantFromConfig falls back to classic defaults', () => {
    expect(variantFromConfig(null).id).toBe(buildVariant(4).id);
    expect(variantFromConfig({ boardSize: 6, traitIds: DEFAULT_TRAITS[6]! }).boardSize).toBe(6);
  });
});

describe('visual params', () => {
  it('hue tints pair with tone: light/dark × orange/blue stay distinct', () => {
    const v = buildVariant(5); // height, tone, hue, shape, top
    const lightOrange = visualParamsOf(v, 0b00000);
    const darkOrange = visualParamsOf(v, 0b00010);
    const lightBlue = visualParamsOf(v, 0b00100);
    const darkBlue = visualParamsOf(v, 0b00110);
    expect([lightOrange.toneT, lightOrange.hueT]).toEqual([0, 0]);
    expect([darkOrange.toneT, darkOrange.hueT]).toEqual([1, 0]);
    expect([lightBlue.toneT, lightBlue.hueT]).toEqual([0, 1]);
    expect([darkBlue.toneT, darkBlue.hueT]).toEqual([1, 1]);
  });

  it('band, stripes, base and girth map to their own channels', () => {
    const v = buildVariant(6, ['tone', 'shape', 'girth', 'band', 'stripes', 'base']);
    const all = visualParamsOf(v, 0b111111);
    expect(all.girthT).toBe(1);
    expect(all.band).toBe(true);
    expect(all.stripes).toBe(true);
    expect(all.base).toBe(true);
    const none = visualParamsOf(v, 0);
    expect(none.girthT).toBe(0);
    expect(none.band).toBe(false);
    expect(none.stripes).toBe(false);
    expect(none.base).toBe(false);
  });

  it('opacity maps to the clear channel', () => {
    const v = buildVariant(3, ['tone', 'shape', 'opacity']);
    expect(visualParamsOf(v, 0b100).clear).toBe(true);
    expect(visualParamsOf(v, 0b000).clear).toBe(false);
  });

  it('variants without height or hue render neutral defaults', () => {
    const v = buildVariant(2); // tone, shape
    const params = visualParamsOf(v, 0);
    expect(params.heightT).toBe(0.5);
    expect(params.hueT).toBeNull();
    expect(params.girthT).toBeNull();
  });
});
