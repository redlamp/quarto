---
tags:
  - domain/architecture
  - status/adopted
  - scope/m0
  - origin/grill-2026-05-25
---

# Decision: R3F Ecosystem Dependencies

**Context.** `@react-three/fiber` alone is the renderer. Practical R3F apps add helpers, postprocessing, physics, dev tools.

**Choice (v1 deps).**

- **`@react-three/drei`** — yes. `OrbitControls`, `Environment`, `Html`, `RoundedBox`, `useGLTF`.
- **`@react-three/postprocessing`** — yes, light use. Bloom on win-line cells + subtle vignette per theme. Theme can opt out.
- **`leva`** — yes, dev-only build. Designer iteration on materials, lighting, timings. Stripped from prod bundle.
- **`@types/three`** — yes, table stakes.

**Choice (deferred / backlog).**

- **`@react-three/rapier`** — no v1. No physics in Quarto. Piece "drop bounce" is animated, not simulated. Revisit if a theme wants real collision.
- **`@react-three/uikit`** — backlog. 3D-native UI primitives in scene. May help future themes that want HUD inside the 3D space.
- **`maath`** — defer. Add only when easing/random helpers prove repeatedly useful.

**Why.**
- drei is universal; not adopting it costs more than the bundle.
- Postprocessing gives the win-line bloom moment a quality lift for free.
- leva loaded only in dev — zero prod cost — and saves hours of designer iteration.

**Date.** 2026-05-25.

Linked from [[decisions]].
