---
tags:
  - domain/visual
  - status/adopted
  - scope/m3
  - origin/grill-2026-05-25
---

# Decision: Game-Over In-Place Reveal Sequence

**Context.** App ships with no game-over screen (decision-no-menu-app-shape). Need to spec the in-place win sequence.

**Choice.** **Ten-beat in-place sequence:**

1. **Freeze.** Game state locks; ghost previews and input disabled.
2. **Win-line trace.** GSAP-animated glowing line traces the 4 winning cells.
3. **Piece glow cascade.** The 4 winning pieces light sequentially in the shared-attribute color/material.
4. **Non-winning dim.** Remaining pieces fade to low opacity / desaturate.
5. **Camera move.** Scripted GSAP tween — slow push-in or pull-up.
6. **Win banner.** DOM HUD overlay: "Player N wins" + attribute description + "Play again" + "Settings".
7. **SFX.** Win fanfare via WebAudio synth.
8. **Missed-call.** If a player completed a winning line but did not press "Quarto!", play continues silently — opponent may now exploit. No "you had it" hint post-game.
9. **Draw.** All 16 pieces placed, no win → "Draw" banner + "Play again".
10. **Restart.** Fade out → restart-sweep animation → fresh match.

**Build priority.** Must-have v1: freeze, line trace, banner, draw, restart. Polish v1: cascade, dim, camera move, SFX.

**Why.**
- No route change — the GSAP win-line timeline gets the spotlight.
- Tournament missed-call behavior is silent (no "you had it" coddling) — keeps the must-call rule load-bearing.

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-no-menu-app-shape]], [[decision-must-call-quarto-with-e4-hint]].
