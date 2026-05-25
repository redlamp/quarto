---
tags:
  - domain/audio
  - status/adopted
  - scope/m3
  - origin/grill-2026-05-25
---

# Decision: Sound v1 = WebAudio Synth, No Asset Files

**Context.** Sound v1 is minimal UI SFX, not music or ambient. Need cheap, themable, no-asset solution. Reference pattern exists in `color-taylor`.

**Choice.** **WebAudio synth, ported from `color-taylor/src/utils/audioContext.ts`. Singleton `AudioContext`, master gain → compressor → destination. Build `lib/sfx/quarto-sfx.ts` with named one-shot generators driven by oscillator + filter + envelope.**

**Initial event set.** Piece-pick blip, piece-place click, confirm click, hand-off rising tone, Quarto-call assertive tone, win fanfare chord.

**Behavior.** No persistent voices. Each event spawns short-lived nodes. Mute toggle in HUD/settings drawer. Audio off by default until user opt-in (browser autoplay policy + portfolio courtesy).

**Future.** Designer-tunable parameters per event live in a typed config alongside the theme — sound becomes a theme axis post-v1.

**Why.**
- No asset pipeline cost (no `.mp3`/`.wav` files to source, license, or bundle).
- Synth pattern is portable across themes; each theme can override params.
- Cheap to start; richer SFX/music can layer on top later without breaking the synth core.

**Date.** 2026-05-25.

Linked from [[decisions]], `color-taylor/src/utils/audioContext.ts`.
