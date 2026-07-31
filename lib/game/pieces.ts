// Piece identity = mixed-radix index over the active variant's traits
// (trait 0 = least-significant digit). For the classic variant this reproduces
// the canonical 4-bit Quarto encoding: height, tone, shape, top.
//
// All trait metadata, piece enumeration, and visual mappings live in
// `variants.ts` — a piece number is meaningless without its VariantDef.

export type Piece = number;
