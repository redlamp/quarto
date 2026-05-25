---
tags:
  - domain/visual
  - domain/architecture
  - status/adopted
  - scope/m3
  - origin/grill-2026-05-25
---

# Decision: GSAP Everywhere + v1 Animation Catalog

**Context.** Stack lists GSAP. R3F animations can also use react-spring (declarative state-driven) or `useFrame` (manual). Pick one vocabulary.

**Choice.** **GSAP everywhere — DOM HUD timelines and R3F mesh state both via `useGSAP` + tweening transform/material properties. No react-spring, no Theatre.js v1.**

**Catalog v1.**

- Piece pick on rack (lift + glow on hover)
- Piece hand-off (piece travels across screen)
- Ghost preview opacity/elevation on hover
- Piece placement drop (arc + squash + bounce)
- Confirm pulse on button + piece pending confirm
- Win-line reveal (line trace + piece glow cascade + camera move)
- Restart sweep (board clears, rack repopulates)
- Camera mode crossfade (top-down ↔ iso ↔ orbit transitions)
- Theme switch crossfade (materials/colors blend)
- Clock low-time pulse

**Deferred to M3+.** Game-intro reveal sequence; dedicated GSAP timeline for Quarto-button pulse (v1 ships a lightweight CSS pulse for the E4 must-call cue).

**Why.**
- Single vocabulary; designer-familiar timelines.
- GSAP's timeline orchestration matches cinematic win-line sequences cleanly.
- Imperative cost (manual tweens on state change) is acceptable for a small piece count.

**Date.** 2026-05-25.

Linked from [[decisions]].
