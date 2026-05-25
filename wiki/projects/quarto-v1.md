---
tags:
  - domain/architecture
  - status/open
  - scope/m3
  - origin/grill-2026-05-25
---

# Quarto v1 — Project Tracker

Browser implementation of the boardgame Quarto. Two-player hot-seat + AI bot. Next.js + Bun + R3F + GSAP + boardgame.io + Tailwind + shadcn. Designed as a portfolio piece.

Single source of truth for scope: `docs/PRD.md`.

## Current state

**Phase:** M3 interaction polish in progress. Hot-seat + AI/Random playable end-to-end with orbit camera, click-toggle selection, orange selection outlines, contextual confirm buttons.

## Milestones

| ID  | Name                                                                                          | State                   |
| --- | --------------------------------------------------------------------------------------------- | ----------------------- |
| M0  | Scaffold                                                                                      | done (commit `ab98887`) |
| M1  | Core game (hot-seat)                                                                          | done (commit `3885ef7`) |
| M2  | AI bot (random) + Theme layer                                                                 | done (commit `3b918fc`) |
| M3  | Polish + menu loop + clocks + sound + win-sequence polish                                     | in progress             |
| M4  | 2D fallback view + mobile                                                                     | not started             |
| M5  | Backlog: heuristic/minimax AI tiers, online multiplayer, stats, sound theming, physics, 3D UI | not started             |

## Dev environment

- `bun run dev` boots on **localhost:3003** (other local projects use 3000).
- `bun run test:run` / `bunx playwright test` / `bun run lint` / `bun run typecheck` — all green at last commit.

## M3 progress so far

- Visual contrast pass — board surface darkened, cool-neutral slate palette, pieces read clearly against board.
- Rack layout — 4×4 grid of fixed slots indexed by piece bitmask. Slot stays in place when a piece leaves the pool.
- Handed-piece pedestal — when a piece is given, it shows on the recipient's side of the board (P0 front, P1 back).
- Orbit camera — drei `OrbitControls` with polar/zoom limits.
- Selection outline — drei `Outlines` in theme `colors.selection` (orange v1, theme-overridable).
- Click-toggle selection model:
  - Pick: click piece raises; click another switches; click slot below lowers; click raised piece confirms; large `Give` button below piece confirms too.
  - Place: click cell ghosts piece; click another switches; click selected cell confirms; large `Place` button below cell confirms too.

## M3 still open

- [[backlog-drag-to-confirm]] — drag-and-drop confirm gesture (attempted, not working, deferred).
- GSAP animations (lift/drop/hand-off travel/win-line reveal/camera cinematics).
- Lighting + motion preset pickers in settings drawer.
- Sound (WebAudio synth + named SFX events).
- Clock UI + toggle.
- Menu loop + game-over screen polish.
- Default camera mode out of the four toggleable modes.
- Bright-color accent vs tonal accent for generic theme.

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

## Open items for next session

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
