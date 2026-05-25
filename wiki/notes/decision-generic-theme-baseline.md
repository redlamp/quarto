---
tags:
  - domain/visual
  - status/adopted
  - scope/m2
  - origin/grill-2026-05-25
---

# Decision: Generic Theme Baseline (v1 Default)

**Context.** The generic theme is the v1 default — deliberately non-committal so the designer can iterate other directions later without fighting the baseline.

**Choice.**

- **Material:** modern matte / PBR neutral. Soft ceramics + deep charcoal. Architectural feel.
- **Color palette:** cool neutrals — slate, fog, snow, ink. Active-state accent stays a tonal step from the rest (no bright color v1).
- **Lighting (two toggleable presets):** HDRI environment via drei (`studio` preset) AND single overhead + soft ambient. User flips between them in the settings drawer.
- **Typography:** Geist (Vercel's default UI sans).
- **Motion (three toggleable presets):** Quick & crisp (150ms ease-out, snappy bounce), Considered & smooth (280ms ease-out, gentle cinematic), Cinematic (500ms+, dramatic reveals). Default = Considered.

**Why.**
- Cool neutrals read "tech" + "considered" without locking into a metaphor (no wood, no neon, no paper).
- Toggleable lighting + motion let the designer compare directions in real gameplay.
- Geist is a free, well-rendered default — Inter is an acceptable swap if Geist licensing changes.
- All three motion presets shipping at once turns the prototyping phase into A/B testing.

**Open follow-ups.**

- Default camera mode out of the four toggleable modes.
- Whether to add a bright-color accent option later.

**Date.** 2026-05-25.

Linked from [[decisions]], [[decision-theme-architecture-typed-modules]].
