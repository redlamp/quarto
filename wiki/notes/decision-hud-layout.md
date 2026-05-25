---
tags:
  - domain/visual
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: HUD Layout — Route `/`

**Context.** No menus v1; HUD carries everything.

**Choice.**

- **Top bar:** turn label + stage (center). Settings drawer toggle (right). Branding placeholder (left).
- **Sides of board:** two clocks (top + bottom of board, narrative-chess pattern). Visible only when clock enabled.
- **Bottom HUD:** current handed piece (dominant focal point), confirm button, Quarto-call button (appears + pulses only when a win is on the board).
- **Settings drawer:** shadcn `Sheet`, right-side slide-in. Contents — opponent picker (Hot-seat / AI/Random), camera mode toggle, lighting mode toggle (theme-defined presets), motion preset toggle (Quick / Smooth / Cinematic), theme picker (dev-flagged until 2+ themes), sound mute toggle, clock preset, confirm-step toggle, **Reset/Restart button**.
- **Restart confirmation modal** required — fat-finger guard consistent with the confirm-step ethos.

**Why.**
- Top bar stays clean; toggles + dangerous actions live in the drawer.
- Clocks mirror the narrative-chess pattern for muscle-memory consistency between projects.
- Quarto-call button only appears when needed — surface area for the must-call rule.

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-no-menu-app-shape]].
