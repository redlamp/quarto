---
tags:
  - domain/visual
  - domain/rules
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Confirm Step + Ghost Preview Affordance

**Context.** Each Quarto turn has two commits (place piece, then hand piece). Mis-clicks cost a turn. Real-table players mentally simulate piece placements before handing the piece off — the digital game can surface that affordance without giving away analysis.

**Options considered (confirm).**

- No confirm; rely on undo / hold-to-place / explicit confirm button.

**Options considered (preview).**

- No preview; preview only during place phase; preview only during pick phase; preview in both phases.
- Piece-only ghost; piece + win-line highlight; piece + threat analysis.

**Choice.**

- **Confirm step on every commit (place + pass), togglable in settings, default on.**
- **Ghost preview available in both phases. Hover and drag both trigger ghost. Piece-only — no win-line or threat overlays in v1.**

**Why.**
- Confirm step replaces undo; simpler mental model than "you can take back a move".
- Symmetric preview (both phases) matches how the mental simulation works in real Quarto.
- Piece-only ghost preserves competitive purity — analytic overlays belong to a future training mode.
- Drag-triggered preview folds into the drag-to-place input cleanly; release on non-cell returns the piece untouched.

**Date.** 2026-05-25.

Linked from [[decisions]].
