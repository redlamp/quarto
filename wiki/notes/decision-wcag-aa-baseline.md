---
tags:
  - domain/a11y
  - status/adopted
  - scope/m0
  - origin/grill-2026-05-25
---

# Decision: WCAG 2.1 AA Baseline from Day 1

**Context.** Accessibility can be deferred (M3 polish pass) or baked in. Retrofitting a11y into a 3D R3F app is expensive; baking it in costs less.

**Choice.** **WCAG 2.1 AA target from day 1.**

**Commitments.**

- Keyboard nav on board (arrow keys move focus, Enter/Space places).
- Keyboard nav on rack (Tab/arrows traverse, Enter selects).
- `prefers-reduced-motion` respected — disables cinematic camera moves + piece travel arcs; essential state transitions remain.
- Color-blind safety baked into theme contract: every piece attribute must encode redundantly (geometry + value + at least one non-color signal). Theme modules fail validation if any attribute is color-only.
- Live region announcements for screen readers ("Player 2 picked tall round light hollow for you. Place piece.").
- Strong, theme-overridable focus indicators on board cells and rack pieces.
- Color contrast ≥ AA between piece, board, and HUD.

**Why.**
- Portfolio piece — a11y is a quality signal.
- `prefers-reduced-motion` doubles as the "I don't want cinematics" toggle for free.
- Color-blind contract forces redundant attribute encoding from the start, which is good design hygiene.

**Date.** 2026-05-25.

Linked from [[decisions]].
