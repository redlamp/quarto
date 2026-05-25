---
tags:
  - domain/architecture
  - domain/visual
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Piece Identity = 4-Bit Bitmask

**Context.** Quarto's 16 unique pieces are defined by 4 binary attributes. Need a canonical identity that works in game logic, AI, theme rendering, and persistence.

**Options considered.**

- **A.** 4-bit bitmask (`0b0000`–`0b1111`), each bit = one attribute.
- **B.** String IDs (`"tall-round-light-hollow"`).
- **C.** Numeric IDs 0–15 with a separate attribute table.

**Choice.** **A. 4-bit bitmask. No piece names.**

**Why.**
- Attribute checks (win detection) become bitwise ops — `(a & b & c & d) | (~a & ~b & ~c & ~d) !== 0` finds shared attributes in 4 ops.
- Theme layer renders pieces as a pure function of bitmask + theme — no name lookup, no asset mapping.
- 2D iso SVG and 3D mesh both derive from the same bit fields. Cross-view consistency is free.
- Serialization for persistence is trivial (4 bits per piece, 64 bits for the board).

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-hybrid-3d-2d-rendering]].
