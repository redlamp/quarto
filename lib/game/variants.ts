import type { Piece } from './pieces';

// Playtest lineup: the Quarto concept (n-in-a-line sharing a trait value,
// opponent picks your piece) stretched across board sizes 2×2 through 6×6.
// Piece count tracks the trait product; board cells = boardSize². The trio
// variant is the one deliberate mismatch (8 pieces, 9 cells — the request was
// "3 traits on a 3×3", so one cell stays empty and exhausting the rack draws).

// How a trait value renders on the piece. A trait may encode through more
// than one channel (e.g. penta's shade = height + tone) so no attribute is
// color-only — redundant encoding per the PRD accessibility contract.
export type VisualChannel = 'height' | 'tone' | 'shape' | 'hollow' | 'girth' | 'band';

export interface TraitDef {
  name: string;
  label: string;
  // Display labels, one per value. Single words only — the HUD splits piece
  // descriptions on spaces. Arity = values.length.
  values: readonly string[];
  encode: readonly VisualChannel[];
}

export interface VariantDef {
  id: string;
  label: string;
  description: string;
  // Board is boardSize × boardSize; a win is boardSize in a line.
  boardSize: number;
  traits: readonly TraitDef[];
  pieceCount: number;
  rackCols: number;
  // Scales piece dimensions and board/rack pitches so every variant fits the
  // camera framing tuned for the classic 4×4.
  worldScale: number;
}

function makeVariant(v: Omit<VariantDef, 'pieceCount'>): VariantDef {
  const pieceCount = v.traits.reduce((n, t) => n * t.values.length, 1);
  return Object.freeze({ ...v, pieceCount });
}

export const VARIANTS: readonly VariantDef[] = Object.freeze([
  makeVariant({
    id: 'duo',
    label: '2×2 - 2 Traits',
    description: '4 pieces, 2 binary traits. Any 2-in-a-line sharing a trait wins.',
    boardSize: 2,
    traits: [
      { name: 'shape', label: 'Shape', values: ['round', 'square'], encode: ['shape'] },
      { name: 'tone', label: 'Tone', values: ['light', 'dark'], encode: ['tone'] },
    ],
    rackCols: 2,
    worldScale: 1.2,
  }),
  makeVariant({
    id: 'trio',
    label: '3×3 - 3 Traits',
    description: '8 pieces on 9 cells — one cell stays empty; an exhausted rack is a draw.',
    boardSize: 3,
    traits: [
      { name: 'height', label: 'Height', values: ['short', 'tall'], encode: ['height'] },
      { name: 'tone', label: 'Tone', values: ['light', 'dark'], encode: ['tone'] },
      { name: 'shape', label: 'Shape', values: ['round', 'square'], encode: ['shape'] },
    ],
    rackCols: 4,
    worldScale: 1.1,
  }),
  makeVariant({
    id: 'classic',
    label: '4×4 - Classic',
    description: 'Canonical Quarto: height, tone, shape, top. 16 pieces.',
    boardSize: 4,
    traits: [
      { name: 'height', label: 'Height', values: ['short', 'tall'], encode: ['height'] },
      { name: 'tone', label: 'Tone', values: ['light', 'dark'], encode: ['tone'] },
      { name: 'shape', label: 'Shape', values: ['round', 'square'], encode: ['shape'] },
      { name: 'top', label: 'Top', values: ['solid', 'hollow'], encode: ['hollow'] },
    ],
    rackCols: 4,
    worldScale: 1,
  }),
  // Alternative 4-trait vocabulary. Classic Quarto's height and hollow-top are
  // hard to read at low camera angles or from directly above; girth and a
  // contrasting mid band stay legible from every angle.
  makeVariant({
    id: 'alt',
    label: '4×4 - Alt Traits',
    description: 'Classic rules, alternative traits: girth and band replace height and top.',
    boardSize: 4,
    traits: [
      { name: 'girth', label: 'Girth', values: ['slim', 'wide'], encode: ['girth'] },
      { name: 'band', label: 'Band', values: ['plain', 'banded'], encode: ['band'] },
      { name: 'shape', label: 'Shape', values: ['round', 'square'], encode: ['shape'] },
      { name: 'tone', label: 'Tone', values: ['light', 'dark'], encode: ['tone'] },
    ],
    rackCols: 4,
    worldScale: 1,
  }),
  makeVariant({
    id: 'penta',
    label: '5×5 - 2×5 Traits',
    description: '25 pieces: 5 silhouettes × 5 shades (each shade step is taller and darker).',
    boardSize: 5,
    traits: [
      {
        name: 'shape',
        label: 'Shape',
        values: ['round', 'square', 'triangle', 'hexagon', 'diamond'],
        encode: ['shape'],
      },
      {
        name: 'shade',
        label: 'Shade',
        values: ['palest', 'pale', 'mid', 'deep', 'deepest'],
        encode: ['height', 'tone'],
      },
    ],
    rackCols: 5,
    worldScale: 0.8,
  }),
  makeVariant({
    id: 'hexa',
    label: '6×6 - 4 Mixed Traits',
    description: '36 pieces: two binary traits (height, top) × two ternary (tone, shape).',
    boardSize: 6,
    traits: [
      { name: 'height', label: 'Height', values: ['short', 'tall'], encode: ['height'] },
      { name: 'top', label: 'Top', values: ['solid', 'hollow'], encode: ['hollow'] },
      { name: 'tone', label: 'Tone', values: ['light', 'mid', 'dark'], encode: ['tone'] },
      { name: 'shape', label: 'Shape', values: ['round', 'square', 'triangle'], encode: ['shape'] },
    ],
    rackCols: 6,
    worldScale: 0.68,
  }),
]);

export const DEFAULT_VARIANT_ID = 'classic';

export function getVariant(id: string | null | undefined): VariantDef {
  return VARIANTS.find((v) => v.id === id) ?? VARIANTS.find((v) => v.id === DEFAULT_VARIANT_ID)!;
}

export function piecesOf(variant: VariantDef): readonly Piece[] {
  return Array.from({ length: variant.pieceCount }, (_, i) => i);
}

// Trait value indices for a piece, one entry per trait (trait 0 = least
// significant mixed-radix digit).
export function traitValuesOf(variant: VariantDef, piece: Piece): number[] {
  const out: number[] = [];
  let rest = piece;
  for (const t of variant.traits) {
    const arity = t.values.length;
    out.push(rest % arity);
    rest = Math.floor(rest / arity);
  }
  return out;
}

export function describePiece(variant: VariantDef, piece: Piece): string {
  const values = traitValuesOf(variant, piece);
  return variant.traits.map((t, i) => t.values[values[i]!]!).join(' ');
}

// A trait value shared by every piece on a winning line.
export interface SharedTrait {
  trait: number;
  value: number;
}

export function sharedTraitLabels(variant: VariantDef, shared: readonly SharedTrait[]): string[] {
  return shared.map((s) => variant.traits[s.trait]!.values[s.value]!);
}

// --- Visual mapping -------------------------------------------------------

export type ShapeKind = 'round' | 'square' | 'tri' | 'hex' | 'diamond';

// Shape trait value index → silhouette. Binary shape traits get round/square,
// ternary adds the triangle, penta uses all five.
export const SHAPE_ORDER: readonly ShapeKind[] = ['round', 'square', 'tri', 'hex', 'diamond'];

export interface PieceVisualParams {
  shape: ShapeKind;
  // Normalized 0..1 — the renderer lerps between the theme's short/tall,
  // light/dark, slim/wide extents.
  heightT: number;
  toneT: number;
  girthT: number | null;
  hollow: boolean;
  band: boolean;
}

export function visualParamsOf(variant: VariantDef, piece: Piece): PieceVisualParams {
  const values = traitValuesOf(variant, piece);
  const params: PieceVisualParams = {
    shape: 'round',
    // Variants without a height trait render at a middle height.
    heightT: 0.5,
    toneT: 0,
    girthT: null,
    hollow: false,
    band: false,
  };
  variant.traits.forEach((trait, i) => {
    const v = values[i]!;
    const arity = trait.values.length;
    const t = arity > 1 ? v / (arity - 1) : 0;
    for (const channel of trait.encode) {
      if (channel === 'height') params.heightT = t;
      else if (channel === 'tone') params.toneT = t;
      else if (channel === 'shape') params.shape = SHAPE_ORDER[v] ?? 'round';
      else if (channel === 'hollow') params.hollow = v === 1;
      else if (channel === 'girth') params.girthT = t;
      else if (channel === 'band') params.band = v === 1;
    }
  });
  return params;
}
