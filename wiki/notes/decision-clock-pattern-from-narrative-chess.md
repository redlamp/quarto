---
tags:
  - domain/architecture
  - status/adopted
  - scope/m3
  - origin/grill-2026-05-25
---

# Decision: Optional Clock — Pattern Ported from narrative-chess-v2

**Context.** Optional per-player clock is in scope. `narrative-chess-v2` already shipped a polished clock module — borrow the pattern.

**Choice.** **Port the pure-math clock module shape from `narrative-chess-v2/lib/chess/clock.ts`. Adapt: drop server-mirroring concerns (no RPCs, no Realtime, no cron, no 200ms lag credit) since Quarto v1 is local-only. Modes for v1: `untimed | live`. Correspondence is deferred until a server exists.**

**Presets.** Untimed (default), Blitz 3+0, Blitz 5+0, Rapid 10+0, Rapid 15+10. Fischer post-move increment.

**Tick + format.** Tick adapts (1s above 10s, 100ms at/below). Format `MM:SS` → `M:SS.t` at low time.

**AI behavior.** Human clock pauses during AI's turn. AI has infinite time.

**First-move timeout.** Abort (no result recorded).

**Why.**
- Pure math module is reusable verbatim — no need to redesign from scratch.
- v1 has no server, so the server-mirroring complexity drops away.
- Correspondence is meaningless without persistence beyond a single device.

**Date.** 2026-05-25.

Linked from [[decisions]], `narrative-chess-v2/lib/chess/clock.ts`.
