---
tags:
  - domain/visual
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Portfolio-Lean Audience, Desktop-First v1

**Context.** Target audience and device priority shape almost every downstream decision (control scheme, camera, layout, perf budget, copy tone).

**Options considered (audience).**

- Boardgame purist vs casual web visitor vs design-portfolio piece vs mix.

**Options considered (device).**

- Desktop-first vs mobile-first vs equal.

**Choice.** **Mix audience with emphasis on design-portfolio. Desktop-first v1; touch/mobile arrives in M4 with the 2D fallback view.**

**Why.**
- Built by a designer — visual craft matters. Generic-look v1 holds the design space open for iteration.
- Quarto session is 3-5 minutes — light onboarding (tooltip on first piece-hand) is enough; no full tutorial.
- 3D camera + hover affordances need pointer input — touch is a separate UX (handled in M4).
- Mobile + 2D is a natural pair; treating them together is cheaper than dual-tracking.

**Date.** 2026-05-25.

Linked from [[decisions]].
