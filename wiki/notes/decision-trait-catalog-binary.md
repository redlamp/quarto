---
tags:
  - domain/architecture
  - domain/rules
  - domain/visual
  - status/adopted
  - origin/playtest-range-2026-08-01
---

# Decision: Binary Trait Catalog with Per-Board Trait Selection

**Context.** Take 2 on [[decision-variant-lineup]]. Playtest feedback: Quarto's identity is _binary_ traits (dark/light, tall/short, square/round, solid/hollow). Quinto and Sesto should add a **new trait**, not a third expression on an existing one. And the tester wants to choose which traits each board size uses.

**Choice.** A catalog of binary traits, each owning one visual channel; a game = board size + a trait selection. Piece id = bitmask over the selected traits (catalog order, first = bit 0) — with the canonical four selected this reproduces the original Quarto encoding, so [[decision-piece-bitmask-identity]] is restored in spirit. Mixed-arity expressions (ternary tone, 5-value shade) are dropped.

**The catalog.** trait — expression 0 / expression 1 — conflicts:

| Trait   | Expr 0 | Expr 1  | Channel         | Conflicts |
| ------- | ------ | ------- | --------------- | --------- |
| Height  | short  | tall    | piece height    | —         |
| Tone    | light  | dark    | base color      | —         |
| Hue     | orange | blue    | tint over tone  | —         |
| Shape   | round  | square  | cross-section   | —         |
| Top     | solid  | hollow  | plug on top     | —         |
| Girth   | slim   | wide    | radius          | —         |
| Band    | plain  | banded  | one waist ring  | stripes   |
| Stripes | solid  | striped | two thin rings  | band      |
| Base    | bare   | plinth  | plate underfoot | —         |

Opacity (opaque/clear) joined the catalog 2026-08-01: clear pieces are transmission glass, not opacity fading, so they never read as the ghost preview or dimmed pieces (which fade). Catalog-only candidates (documented, not implemented): matte/gloss (vanishes under flat lighting), domed/flat top and top markings (compete with hollow for top real estate), tilt (reads as a glitch), uniform small/large (aliases height × girth).

**Defaults per board.** 2×2: tone+shape. 3×3: +height. 4×4: canonical four. 5×5: +hue (Quinto). 6×6: +girth (Sesto). Piece count = 2^traits, so 5×5 runs 32 pieces on 25 cells and 6×6 runs 64 on 36 — the game ends on a full board; the generalized draw rule (no win + board full or rack exhausted) covers every combination.

**Board size = trait count (2026-08-01 amendment).** Each trait adds a row and a column: toggling a trait in the picker resizes the board to match (min 2, max 6) and starts a fresh game; the board-size menu acts as a preset that loads that size's remembered (or default) trait set. Note the arithmetic: cells grow as n² but piece combinations grow as 2^n, and the two agree only at n = 2 and n = 4 — canonical Quarto sits on that coincidence. At n = 3 the rack runs out first (8 pieces, 9 cells); at n = 5/6 the rack outnumbers the board (32/25, 64/36), which just widens the pick-a-piece choice. Matching counts was never a rules requirement.

**Trait picker.** Settings drawer lists the catalog with a switch per trait, scoped to the current board size and persisted per size. Conflicting traits disable with an inline reason; a floor of 2 traits; reset-to-default button. Changing traits rebuilds the client (fresh game). Top bar keeps the quick board-size menu (2×2 Secondo … 6×6 Sesto).

**Hue pairing.** Hue tints the tone color at 55% so both stay legible: light-orange / dark-orange / light-blue / dark-blue. Redundancy note: hue is a color-only trait — acceptable for playtesting, flagged against [[decision-wcag-aa-baseline]] before any shipped default includes it.

**Date.** 2026-08-01.

Linked from [[decisions]], supersedes the lineup table in [[decision-variant-lineup]].
