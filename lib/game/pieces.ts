// Piece identity = 4-bit bitmask over canonical Quarto attributes.
//
//   bit 0 (1)  height : 0 = short, 1 = tall
//   bit 1 (2)  color  : 0 = light, 1 = dark
//   bit 2 (4)  shape  : 0 = round, 1 = square
//   bit 3 (8)  top    : 0 = solid, 1 = hollow

export type Piece = number;

export const PIECE_COUNT = 16;
export const ALL_PIECES: readonly Piece[] = Object.freeze(
  Array.from({ length: PIECE_COUNT }, (_, i) => i),
);

export const ATTR_MASK = 0b1111;

export const ATTR = {
  height: 0b0001,
  color: 0b0010,
  shape: 0b0100,
  top: 0b1000,
} as const;

export type AttrName = keyof typeof ATTR;
export const ATTR_NAMES: readonly AttrName[] = ['height', 'color', 'shape', 'top'] as const;

export const ATTR_VALUE_LABELS: Record<AttrName, [string, string]> = {
  height: ['short', 'tall'],
  color: ['light', 'dark'],
  shape: ['round', 'square'],
  top: ['solid', 'hollow'],
};

export interface PieceTraits {
  tall: boolean;
  dark: boolean;
  square: boolean;
  hollow: boolean;
}

export function traits(piece: Piece): PieceTraits {
  return {
    tall: (piece & ATTR.height) !== 0,
    dark: (piece & ATTR.color) !== 0,
    square: (piece & ATTR.shape) !== 0,
    hollow: (piece & ATTR.top) !== 0,
  };
}

export function describe(piece: Piece): string {
  const t = traits(piece);
  return [
    t.tall ? 'tall' : 'short',
    t.dark ? 'dark' : 'light',
    t.square ? 'square' : 'round',
    t.hollow ? 'hollow' : 'solid',
  ].join(' ');
}
