---
tags:
  - domain/persistence
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Persistence v1 = Settings + Active Game in localStorage

**Context.** Should the game survive a page refresh? Should settings persist? Stats history?

**Choice.** **Settings + active game state in `localStorage`. No history of past games v1. No cloud sync v1.**

**Settings persisted.** Camera mode, theme, clock preset, confirm-toggle, sound on/off, motion preset, lighting preset.

**Game state persisted.** boardgame.io's local storage adapter writes the active match. Refresh resumes the game.

**Why.**
- Settings persistence is cheap, big UX win ("my camera mode stuck").
- Resume-mid-game prevents accidental loss during designer iteration.
- History/stats deferred — needs schema design that isn't worth committing to v1.
- Cloud sync requires auth + a backend — out of scope.

**Date.** 2026-05-25.

Linked from [[decisions]].
