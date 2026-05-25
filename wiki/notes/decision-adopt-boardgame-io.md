---
tags:
  - domain/architecture
  - status/adopted
  - scope/m0
  - origin/grill-2026-05-25
---

# Decision: Adopt boardgame.io for Game State

**Context.** Quarto needs deterministic turn order, two-stage moves (place piece + pick opponent's piece), legal-move validation, win detection, undo, and a clean path to online multiplayer. Either adopt a library or hand-roll with zustand/reducer.

**Options considered.**

- **A.** `boardgame.io` — purpose-built turn-based engine. Built-in stages, undo, replay, AI bot framework, optional server.
- **B.** Hand-rolled state with zustand. Full control, minimal bundle, must write netcode + undo later.

**Choice.** **A. boardgame.io.**

**Why.**
- Shape of the problem maps cleanly — Quarto's two-stage turn (place, then select piece for opponent) is what `stages` were designed for.
- Online multiplayer is plausible roadmap (M5). boardgame.io's lobby + transport saves writing netcode later.
- Built-in storage adapter handles persistence (M1) without inventing one.
- AI bot interface is library-standard — any future heuristic/minimax tier plugs in.

**Date.** 2026-05-25.

Linked from [[decisions]].
