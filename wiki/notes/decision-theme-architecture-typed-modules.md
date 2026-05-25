---
tags:
  - domain/visual
  - domain/architecture
  - status/adopted
  - scope/m2
  - origin/grill-2026-05-25
---

# Decision: Theme Architecture — Typed Modules + /playground

**Context.** Designer expects to iterate visuals constantly. The visual layer must be swappable without touching game logic. Themes need a stable contract that game logic can ignore.

**Options considered.**

- **A.** Single theme; hand-edit when iterating.
- **B.** Named themes + runtime toggle.
- **C.** Named themes + runtime toggle + dedicated `/playground` route.
- **D.** Storybook.

**Choice.** **C. Named typed `Theme` modules + runtime toggle + `/playground` route.**

**Why.**
- Designer needs to feel a direction in actual gameplay, not isolated swatches.
- `/playground` (all 16 pieces × all themes on one page) pays back constantly during iteration without Storybook's framework cost.
- Each theme = one TypeScript file + a registry insert. Adding a theme is one line of import.
- Theme contract covers: colors, piece geometry, materials, board surface, lighting *presets*, motion *presets*, typography. Lighting and motion are themselves togglable per theme.
- Theme picker stays dev-flagged until 2+ themes exist (no empty picker).

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-generic-theme-baseline]].
