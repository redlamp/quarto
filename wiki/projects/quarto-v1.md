---
tags:
  - domain/architecture
  - status/open
  - scope/m0
  - origin/grill-2026-05-25
---

# Quarto v1 — Project Tracker

Browser implementation of the boardgame Quarto. Two-player hot-seat + AI bot. Next.js + Bun + R3F + GSAP + boardgame.io + Tailwind + shadcn. Designed as a portfolio piece.

Single source of truth for scope: `docs/PRD.md`.

## Current state

**Phase:** pre-scaffold. Grilling complete (2026-05-25). PRD locked. Decision notes written. Ready for M0.

## Milestones

| ID | Name | State |
|---|---|---|
| M0 | Scaffold | next |
| M1 | Core game (hot-seat) | not started |
| M2 | AI bot (random) + Theme layer | not started |
| M3 | Polish + menu loop + clocks + sound + win-sequence polish | not started |
| M4 | 2D fallback view + mobile | not started |
| M5 | Backlog: heuristic/minimax AI tiers, online multiplayer, stats, sound theming, physics, 3D UI | not started |

## M0 exit criteria

- `bun dev` boots `/` showing R3F canvas + HUD shell + settings drawer.
- `/playground` route stubbed (theme tester scaffold).
- ESLint + Prettier + Husky + lint-staged wired (Windows worktree fixes applied).
- Vitest + Playwright configs in place (no tests yet).
- TypeScript strict, no JS in source.
- Local commit only. No CI, no remote, no Vercel.

## Decisions log

See [[decisions]] for the full Map of Content. Key atomic notes from the 2026-05-25 grilling session:

- [[decision-adopt-boardgame-io]]
- [[decision-must-call-quarto-with-e4-hint]]
- [[decision-ai-strategy-v1-random-in-worker]]
- [[decision-hybrid-3d-2d-rendering]]
- [[decision-portfolio-audience-and-desktop-first]]
- [[decision-theme-architecture-typed-modules]]
- [[decision-camera-modes-toggleable]]
- [[decision-piece-bitmask-identity]]
- [[decision-no-menu-app-shape]]
- [[decision-confirm-step-and-ghost-preview]]
- [[decision-clock-pattern-from-narrative-chess]]
- [[decision-wcag-aa-baseline]]
- [[decision-gsap-everywhere-with-catalog]]
- [[decision-sound-webaudio-synth]]
- [[decision-persistence-localstorage]]
- [[decision-game-over-in-place-reveal]]
- [[decision-hud-layout]]
- [[decision-r3f-ecosystem-deps]]
- [[decision-project-structure-and-tooling]]
- [[decision-generic-theme-baseline]]
- [[decision-license-mit]]

## Open items

For v1 commit:

- None foundational. All major design + architecture branches resolved.

For the next session:

- Default camera mode out of the four toggleable modes.
- Bright-color accent vs strictly tonal accent in the generic theme.
- Concrete win-fanfare sound — chord, duration, voicing.
- E4 Quarto-call button placement details.
- First themed skin direction after `generic`.
- GitHub repo visibility (private at first; public-on-portfolio later TBD).
- Custom domain selection at Vercel cutover time.

## References

- `narrative-chess-v2` — clock pattern ported from `lib/chess/clock.ts`.
- `color-taylor` — WebAudio synth pattern ported from `src/utils/audioContext.ts`.
- [[research]] — full research index.
