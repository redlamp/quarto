---
tags:
  - domain/visual
  - status/adopted
  - scope/m1
  - origin/grill-2026-05-25
---

# Decision: Four User-Toggleable Camera Modes

**Context.** R3F unlocks every camera idiom from locked-overhead to free orbit. Each reads differently and suits different play styles.

**Options considered.**

- Fixed top-down / fixed isometric / free orbit / subtle mouse parallax / scripted cinematic on key moments.

**Choice.** **Ship all four base modes as user-toggleable: fixed top-down, fixed iso, free orbit, subtle mouse parallax. Scripted GSAP cinematic moves run on top of any base mode for key beats (piece handed, piece placed, win).**

**Why.**
- Designer wants to compare directions in actual gameplay, not pick a single mode upfront.
- Each mode is cheap to implement once the camera rig component exists.
- Cinematic moves layer on top — they are not a separate "mode", they fire on events regardless of which base mode is selected.
- Default mode TBD by designer — listed in §8 open questions.

**Date.** 2026-05-25.

Linked from [[decisions]].
