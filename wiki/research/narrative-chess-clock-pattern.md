---
tags:
  - domain/architecture
  - status/verified
  - origin/grill-2026-05-25
---

# Research: narrative-chess-v2 Clock Pattern

Polished clock module in `narrative-chess-v2/lib/chess/clock.ts`. Pure functions (no DOM, no `Date.now()` defaults). Server-mirroring elapsed math with 200ms lag credit.

**Reusable for Quarto.** The pure-math part — `computeRemaining`, `formatLive`, `formatCorrespondence`, `tickRateMs` — ports verbatim. Drop the server-mirroring concerns (no RPCs, no Realtime, no cron, no lag credit) since Quarto v1 is local-only.

**Modes from narrative-chess.**

- `untimed | live | correspondence`. Quarto v1 keeps `untimed | live`. Correspondence deferred (needs server persistence).
- Presets: Untimed / 5+0 / 10+0 / 15+10 / 1 day/move. Quarto presets: Untimed / 3+0 / 5+0 / 10+0 / 15+10.

**Spec referenced.** `narrative-chess-v2/docs/superpowers/specs/2026-05-05-clocks-timeout-reconnect-design.md`.

**Adopted in.** [[decision-clock-pattern-from-narrative-chess]]
