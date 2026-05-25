---
tags:
  - domain/visual
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: No-Menu App Shape v1

**Context.** App can be single-page (boot into game) or have a menu loop (menu → game → game-over → menu). Affects routing + HUD scope.

**Options considered.**

- **A.** No menu, boot into game.
- **B.** Menu → game → game-over → menu.
- **C.** Single page + settings drawer.
- **D.** In-place game-over reveal.

**Choice.** **A + D for v1 (no menu, in-place win reveal). B (menu loop) lands later in M3+ once core feel is locked.**

**Why.**
- During prototyping, landing on the game is faster feedback.
- Menus are deferred design surface — easy to add when the game itself stabilizes.
- In-place game-over reveal keeps the GSAP win-line timeline the centerpiece — no jarring screen swap.
- Restart + opponent picker live in the HUD/settings drawer until the menu exists.

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-hud-layout]], [[decision-game-over-in-place-reveal]].
