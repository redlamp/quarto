---
tags:
  - domain/audio
  - status/verified
  - origin/grill-2026-05-25
---

# Research: color-taylor WebAudio Synth Pattern

WebAudio synth pattern in `color-taylor/src/utils/audioContext.ts` + `colorSynth.ts`. Singleton `AudioContext`, master gain → compressor → destination. Lazy-loaded engine. Oscillator-based voices with attack/release/glide envelopes, biquad filters, just/equal tuning, RGB-chord vs hue-voice modes.

**Reusable for Quarto.** Port the `audioContext.ts` module directly (singleton context + master gain). The full `ToneController` is overkill — Quarto needs one-shot UI SFX (piece-pick blip, piece-place click, confirm click, hand-off rising tone, Quarto-call tone, win fanfare chord). Build a slim `lib/sfx/quarto-sfx.ts` using the same patterns.

**Why this pattern.** No asset files. Theme can override params (sound becomes a theme axis later). Lazy-loaded so silent users pay zero cost.

**Adopted in.** [[decision-sound-webaudio-synth]]
