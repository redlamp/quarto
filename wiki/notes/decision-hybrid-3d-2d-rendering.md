---
tags:
  - domain/visual
  - domain/architecture
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Hybrid 3D-Primary, 2D-Fallback Rendering

**Context.** Stack lists Three.js + R3F + GSAP. Quarto board is flat 4×4 — 3D could be cosmetic or load-bearing. 2D is faster to ship and easier to make accessible.

**Options considered.**

- **A.** Full 3D (R3F) — pieces + board as real meshes, camera, lighting.
- **B.** 2D only — DOM/SVG, styled pieces, no Three.js.
- **C.** Hybrid — 3D in scene + DOM HUD overlay; later, a parallel 2D view.

**Choice.** **C. Hybrid. v1 ships 3D primary. M4 adds a parallel 2D view of the same game state.**

**Why.**
- Quarto pieces want to be 3D — 4 attributes map naturally to physical geometry (tall/short, square/round, light/dark, solid/hollow).
- Hand-passing a piece between players reads dramatic in 3D, flat in 2D.
- 2D fallback covers accessibility + small-screen story without compromising the 3D ambition.
- Game state stays renderer-agnostic — both views read the same boardgame.io state.

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-camera-modes-toggleable]], [[decision-piece-bitmask-identity]].
