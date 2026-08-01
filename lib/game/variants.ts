import type { Piece } from './pieces';

// Board-size playtest lineup, take 2: every trait is BINARY (two expressions,
// like canonical Quarto's dark/light, tall/short, square/round, solid/hollow).
// Bigger boards add NEW traits from the catalog below instead of adding a
// third expression to an existing trait. Piece count = 2^traits, so it only
// matches cell count on 2×2 (2 traits) and 4×4 (4 traits); elsewhere the game
// ends on a full board or an exhausted rack (draw rule covers both).

// How a trait value renders on the piece. Each trait owns one channel so
// traits can't visually collide; catalog `conflictsWith` marks the pairs that
// would (e.g. band vs stripes both live on the piece's side wall).
export type VisualChannel =
  | 'height'
  | 'tone'
  | 'hue'
  | 'shape'
  | 'hollow'
  | 'girth'
  | 'band'
  | 'stripes'
  | 'base'
  | 'opacity';

export interface TraitSpec {
  id: string;
  label: string;
  // Display labels for expression 0 / expression 1. Single words only — the
  // HUD splits piece descriptions on spaces.
  values: readonly [string, string];
  encode: VisualChannel;
  note: string;
  // Trait ids that read badly together — the picker disables these pairings.
  conflictsWith: readonly string[];
}

// Catalog order is canonical: selections are sorted into this order, and a
// piece id is a bitmask over the selected traits (first selected = bit 0).
// With the canonical four selected this reproduces the original Quarto
// encoding bit-for-bit.
export const TRAIT_CATALOG: readonly TraitSpec[] = Object.freeze([
  {
    id: 'height',
    label: 'Height',
    values: ['short', 'tall'],
    encode: 'height',
    note: 'Canonical. Weak read from directly above.',
    conflictsWith: [],
  },
  {
    id: 'tone',
    label: 'Tone',
    values: ['light', 'dark'],
    encode: 'tone',
    note: 'Canonical. Strongest read at any angle.',
    conflictsWith: [],
  },
  {
    id: 'hue',
    label: 'Hue',
    values: ['orange', 'blue'],
    encode: 'hue',
    note: 'Tints the tone: light-orange / dark-orange / light-blue / dark-blue.',
    conflictsWith: [],
  },
  {
    id: 'shape',
    label: 'Shape',
    values: ['round', 'square'],
    encode: 'shape',
    note: 'Canonical. Cross-section silhouette.',
    conflictsWith: [],
  },
  {
    id: 'top',
    label: 'Top',
    values: ['solid', 'hollow'],
    encode: 'hollow',
    note: 'Canonical. Top-only visibility — weak read from the side.',
    conflictsWith: [],
  },
  {
    id: 'girth',
    label: 'Girth',
    values: ['slim', 'wide'],
    encode: 'girth',
    note: 'Radius. Legible from every angle.',
    conflictsWith: [],
  },
  {
    id: 'band',
    label: 'Band',
    values: ['plain', 'banded'],
    encode: 'band',
    note: 'One contrasting ring at the waist.',
    conflictsWith: ['stripes'],
  },
  {
    id: 'stripes',
    label: 'Stripes',
    values: ['solid', 'striped'],
    encode: 'stripes',
    note: 'Two thin contrasting rings. Same wall real estate as band.',
    conflictsWith: ['band'],
  },
  {
    id: 'base',
    label: 'Base',
    values: ['bare', 'plinth'],
    encode: 'base',
    note: 'Contrasting plate under the piece.',
    conflictsWith: [],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    values: ['opaque', 'clear'],
    encode: 'opacity',
    note: 'Clay vs glass. Clear pieces refract (transmission), so they never read as the fading ghost preview.',
    conflictsWith: [],
  },
]);

export function getTrait(id: string): TraitSpec | undefined {
  return TRAIT_CATALOG.find((t) => t.id === id);
}

export const BOARD_SIZES: readonly number[] = Object.freeze([2, 3, 4, 5, 6]);

// The declaration a player shouts to claim a win — Italian ordinal matching
// the line length ("Quarto" = fourth), no trailing "!".
export const CALLS: Record<number, string> = {
  2: 'Secondo',
  3: 'Terzo',
  4: 'Quarto',
  5: 'Quinto',
  6: 'Sesto',
};

// Default trait set per board size: the canonical four, minus the weakest
// reads on small boards, plus new binary traits above four.
export const DEFAULT_TRAITS: Record<number, readonly string[]> = {
  2: ['tone', 'shape'],
  3: ['height', 'tone', 'shape'],
  4: ['height', 'tone', 'shape', 'top'],
  5: ['height', 'tone', 'hue', 'shape', 'top'],
  6: ['height', 'tone', 'hue', 'shape', 'top', 'girth'],
};

// Scales piece dimensions and board/rack pitches so every variant fits the
// camera framing tuned for the classic 4×4.
// 5×5 and 6×6 run 8-column racks (32/64 pieces), so they scale down harder
// than board width alone would need — the rack must clear the left frame edge.
const WORLD_SCALE: Record<number, number> = { 2: 1.2, 3: 1.1, 4: 1, 5: 0.74, 6: 0.68 };
const RACK_COLS: Record<number, number> = { 2: 2, 3: 4, 4: 4, 5: 8, 6: 8 };

// Board size is coupled to trait count: n traits play on an n×n board with
// n-in-a-line wins, so the selectable range matches BOARD_SIZES.
export const MIN_TRAITS = 2;
export const MAX_TRAITS = 6;

// What the game stores and the UI persists: a board size plus the trait ids
// composing the piece set.
export interface VariantConfig {
  boardSize: number;
  traitIds: readonly string[];
}

export interface VariantDef {
  id: string;
  label: string;
  call: string;
  boardSize: number;
  config: VariantConfig;
  traits: readonly TraitSpec[];
  pieceCount: number;
  rackCols: number;
  worldScale: number;
}

function catalogOrder(ids: readonly string[]): string[] {
  return TRAIT_CATALOG.filter((t) => ids.includes(t.id)).map((t) => t.id);
}

export function variantKey(boardSize: number, traitIds: readonly string[]): string {
  return `${boardSize}:${catalogOrder(traitIds).join(',')}`;
}

const variantCache = new Map<string, VariantDef>();

export function buildVariant(boardSize: number, traitIds?: readonly string[]): VariantDef {
  const size = BOARD_SIZES.includes(boardSize) ? boardSize : 4;
  const ids = catalogOrder(traitIds ?? DEFAULT_TRAITS[size]!);
  const key = variantKey(size, ids);
  const cached = variantCache.get(key);
  if (cached) return cached;
  const traits = ids.map((id) => getTrait(id)!);
  const def: VariantDef = Object.freeze({
    id: key,
    label: `${size}×${size}`,
    call: CALLS[size]!,
    boardSize: size,
    config: Object.freeze({ boardSize: size, traitIds: Object.freeze(ids) }),
    traits: Object.freeze(traits),
    pieceCount: 2 ** traits.length,
    rackCols: RACK_COLS[size]!,
    worldScale: WORLD_SCALE[size]!,
  });
  variantCache.set(key, def);
  return def;
}

export function variantFromConfig(config: VariantConfig | null | undefined): VariantDef {
  if (!config) return buildVariant(4);
  return buildVariant(config.boardSize, config.traitIds);
}

export function piecesOf(variant: VariantDef): readonly Piece[] {
  return Array.from({ length: variant.pieceCount }, (_, i) => i);
}

// Expression indices for a piece, one entry per selected trait — the piece id
// is a bitmask (first trait in catalog order = bit 0).
export function traitValuesOf(variant: VariantDef, piece: Piece): number[] {
  return variant.traits.map((_, i) => (piece >> i) & 1);
}

export function describePiece(variant: VariantDef, piece: Piece): string {
  return variant.traits.map((t, i) => t.values[(piece >> i) & 1]!).join(' ');
}

// A trait expression shared by every piece on a winning line.
export interface SharedTrait {
  trait: number;
  value: number;
}

export function sharedTraitLabels(variant: VariantDef, shared: readonly SharedTrait[]): string[] {
  return shared.map((s) => variant.traits[s.trait]!.values[s.value]!);
}

// --- Visual mapping -------------------------------------------------------

export type ShapeKind = 'round' | 'square';

export interface PieceVisualParams {
  shape: ShapeKind;
  // Normalized 0..1 — the renderer lerps between the theme's short/tall,
  // light/dark, slim/wide extents.
  heightT: number;
  toneT: number;
  girthT: number | null;
  // 0 = first hue expression (orange), 1 = second (blue), null = no hue trait.
  hueT: number | null;
  hollow: boolean;
  band: boolean;
  stripes: boolean;
  base: boolean;
  clear: boolean;
}

export function visualParamsOf(variant: VariantDef, piece: Piece): PieceVisualParams {
  const params: PieceVisualParams = {
    shape: 'round',
    // Variants without a height trait render at a middle height.
    heightT: 0.5,
    toneT: 0,
    girthT: null,
    hueT: null,
    hollow: false,
    band: false,
    stripes: false,
    base: false,
    clear: false,
  };
  variant.traits.forEach((trait, i) => {
    const v = (piece >> i) & 1;
    switch (trait.encode) {
      case 'height':
        params.heightT = v;
        break;
      case 'tone':
        params.toneT = v;
        break;
      case 'hue':
        params.hueT = v;
        break;
      case 'shape':
        params.shape = v === 1 ? 'square' : 'round';
        break;
      case 'hollow':
        params.hollow = v === 1;
        break;
      case 'girth':
        params.girthT = v;
        break;
      case 'band':
        params.band = v === 1;
        break;
      case 'stripes':
        params.stripes = v === 1;
        break;
      case 'base':
        params.base = v === 1;
        break;
      case 'opacity':
        params.clear = v === 1;
        break;
    }
  });
  return params;
}
