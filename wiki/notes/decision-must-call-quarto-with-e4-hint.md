---
tags:
  - domain/rules
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Must-Call-Quarto Rule with E4 Button Hint

**Context.** Canonical tournament Quarto requires the winner to explicitly call "Quarto!" or play continues. Web games typically auto-detect wins. We want the tension of the rule without leaving players stranded.

**Options considered.**

- **E1.** Auto-detect toggle (defeats the rule).
- **E2.** Examine button — answers yes/no whether a win exists (training aid).
- **E3.** Highlight-on-examine — reveals the winning line (heaviest hint).
- **E4.** Post-place check: if a win exists, the Quarto-call button pulses. No line revealed.

**Choice.** **E4 — pulse on call button when a win is on the board.**

**Why.**
- Preserves "must call" tension — opponent's wins remain missable.
- Hints your own win without revealing the line — player still has to find it on the board.
- E2/E3 read as training-mode features; defer to a future explicit "training mode" toggle.
- Auto-detect (E1) erases the rule we wanted in the first place.

**Date.** 2026-05-25.

Linked from [[decisions]].
