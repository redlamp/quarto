---
tags:
  - domain/architecture
  - domain/rules
  - domain/visual
  - status/adopted
  - origin/playtest-range-2026-07-31
---

# Decision: Variant Lineup for Board-Size Playtesting

**Context.** Goal: test the Quarto concept (n-in-a-line sharing a trait value, opponent picks your piece) across a range of board sizes, each with a matching set of visually distinct pieces. Branch `variants`.

**Options considered (piece identity).**

- **A.** Keep the 4-bit bitmask and only ship sizes where piece count = 2^t.
- **B.** Mixed-radix trait vectors: a variant declares traits with arbitrary arity; piece id = mixed-radix index (trait 0 = least significant digit). Win check compares value indices per trait.

**Choice.** **B.** The classic variant's radices are (2,2,2,2), so its mixed-radix layout reproduces the canonical bitmask bit-for-bit — [[decision-piece-bitmask-identity]] is generalized, not discarded. Bitwise win detection became per-trait value comparison over generated lines (n rows + n cols + 2 diagonals).

**The lineup.**

| id        | Board | Traits                         | Pieces | Cells |
| --------- | ----- | ------------------------------ | ------ | ----- |
| `duo`     | 2×2   | shape, tone                    | 4      | 4     |
| `trio`    | 3×3   | height, tone, shape            | 8      | 9     |
| `classic` | 4×4   | height, tone, shape, top       | 16     | 16    |
| `alt`     | 4×4   | girth, band, shape, tone       | 16     | 16    |
| `penta`   | 5×5   | shape ×5, shade ×5             | 25     | 25    |
| `hexa`    | 6×6   | height, top, tone ×3, shape ×3 | 36     | 36    |

- **trio** is the one deliberate piece/cell mismatch (8 pieces, 9 cells — the ask was 3 traits on 3×3). Draw rule generalized: no win + (board full **or** rack exhausted) = draw.
- **penta**'s shade trait encodes through height **and** tone together (palest+shortest → deepest+tallest) so a 5-value trait is never color-only — keeps the [[decision-wcag-aa-baseline]] redundant-encoding rule.
- **hexa** mixes radices (2,2,3,3); ternary shape adds a triangular prism, ternary tone a mid grey.
- Per-variant `worldScale` shrinks pitches + piece dims so every board fits the camera framing tuned for classic 4×4 (no camera changes).

**Alternative traits for 4×4 (`alt`).** Classic Quarto's height and hollow-top are weak reads at low camera angles (height compresses) and from the side (hollow is top-only). Chosen replacements, legible from every angle:

- **girth** — slim/wide radius.
- **band** — plain vs contrasting ring around the waist.

Also considered and rejected for now: finish matte/gloss (vanishes under flat lighting), hue pairs (color-only, breaks the redundancy rule), corner notch and cap color (top-only visibility, same flaw as hollow), tilt (reads as a rendering glitch). Worth revisiting if `alt` playtests well.

**Win declarations.** "Quarto" is Italian for fourth, so each variant's call matches its line length with the same Italian ordinal series: Secondo (2), Terzo (3), Quarto (4, both 4×4s), Quinto (5), Sesto (6). Carried on `VariantDef.call`; the call button and drawer descriptions use it. Extends [[decision-must-call-quarto-with-e4-hint]] — the must-call rule is unchanged, only the word scales.

**Menu.** Variant switcher lives in the top bar (quick playtest swaps) and mirrors into the settings drawer. Switching rebuilds the boardgame.io client from `createQuartoGame(variant)` — a fresh game, since mid-game conversion is meaningless. Persisted in localStorage via the ui-store.

**Early gameplay expectations to verify.** duo is near-degenerate (any two non-opposite pieces share a trait — first placement pair usually wins); penta's 5-value traits make shared lines rare, likely draw-heavy; hexa sits between. That spread is the point of the playtest.

**Date.** 2026-07-31.

Linked from [[decisions]].
