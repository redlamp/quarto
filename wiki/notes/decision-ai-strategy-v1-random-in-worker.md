---
tags:
  - domain/ai
  - domain/architecture
  - status/adopted
  - scope/m2
  - origin/grill-2026-05-25
---

# Decision: AI Strategy v1 — Tiered Plan, Random Ships First, Web Worker

**Context.** Quarto AI has unusual structure — each turn requires two decisions (place the handed piece, then pick the opponent's next piece). Branching factor ~16×16=256 ply-1. Server vs client compute, and difficulty tiers, were both open.

**Options considered.**

- **A.** Random only, ever.
- **B.** Tiered Easy/Medium/Hard (random / heuristic / minimax depth 4).
- **C.** MCTS — overkill for 4×4.

**Compute location.**

- Client Web Worker (no server, no latency) vs server function.

**Choice.** **Tiered plan (Easy/Medium/Hard). v1 ships only Easy = Random. Heuristic + minimax are backlogged. Compute runs in a client Web Worker.**

**Why.**
- Tiered API written once; later tiers slot in without UI churn.
- Random first because it unblocks the gameplay loop without burning design budget on AI feel.
- Web Worker keeps the UI thread responsive when minimax lands later; static-deployable v1 stays static.
- Server function is unnecessary cost + latency for what stays a single-player toy.

**Date.** 2026-05-25.

Linked from [[decisions]].
