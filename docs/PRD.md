# Quarto — PRD

## 1. Summary

Browser-based implementation of the boardgame Quarto. Two-player hot-seat plus single-player vs AI bot. Built on Next.js App Router with 3D-capable rendering. Client-side AI runs in a Web Worker. Local development only at the start; Vercel deploy lands once the prototype settles. MIT licensed.

## 2. Goals / Non-goals

### Goals (v1)

- Playable canonical Quarto in browser: 4×4 board, 16 unique pieces, "opponent picks your piece" turn structure.
- Two opponent modes: local hot-seat, AI bot.
- Smooth, polished UI consistent with stack capabilities (GSAP animations, R3F 3D).
- Runs locally on Bun + Next.js dev server end-to-end (no deploy dependency v1).
- Deployable to Vercel without backend functions when the prototype is ready.

### Non-goals (v1)

- Online multiplayer (deferred — boardgame.io supports it natively, layered later).
- Strong AI (v1 = random move bot; tiered heuristic/minimax bots backlogged).
- Account system, leaderboards, persistent stats.
- Native mobile apps.
- Vercel deployment + custom domain (deferred until prototype settles).
- Public GitHub repository (private repo first; visibility decision later).

## 3. Users

Primary lens: **design portfolio piece**. Secondary: casual web visitors who may not know Quarto.

- Built by a designer — visual craft is a first-class concern, not a finishing pass.
- Aesthetic direction is expected to iterate heavily during development. Visual choices must be swappable without touching game logic.
- v1 holds a deliberately generic look. Themed/styled directions land later as parallel skins.
- Onboarding is light: rules are simple enough that a tooltip on first piece-hand replaces a tutorial.

## 4. Stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Runtime | Bun |
| Styling | Tailwind CSS |
| UI primitives | shadcn/ui |
| Animation (DOM) | GSAP |
| 3D rendering | Three.js + react-three-fiber (primary v1) |
| R3F helpers | `@react-three/drei` (`OrbitControls`, `Environment`, `Html`, etc.) |
| R3F postprocessing | `@react-three/postprocessing` (light use: bloom on win-line, vignette per theme) |
| 3D dev UI | `leva` (designer tweaks, dev-only build) |
| 2D rendering (fallback) | DOM/SVG (deferred to M4) |
| Game state | boardgame.io |
| AI compute | Web Worker (client-side) |
| Deploy | Vercel (deferred — local-only at the start) |
| License | MIT |

## 5. Architectural rules

- **Desktop-first.** v1 targets pointer + keyboard, wide viewport. Mobile/touch arrives in M4 alongside 2D view — degraded 3D experience acceptable on small screens until then.
- **Accessibility baseline = WCAG 2.1 AA from day 1.** Specific commitments:
  - Keyboard navigation on board (arrow keys move focus across 4×4 grid, Enter/Space places).
  - Keyboard navigation on rack (Tab/arrows traverse 16 pieces, Enter selects).
  - `prefers-reduced-motion` respected — disables cinematic camera moves + piece travel arcs; essential state transitions remain.
  - Color-blind safety baked into theme contract: every piece attribute must encode redundantly (geometry + value + at least one non-color signal). Theme modules fail validation if any attribute is color-only.
  - Live region announcements for screen readers ("Player 2 picked tall round light hollow for you. Place piece.").
  - Strong, theme-overridable focus indicators on cells and rack pieces.
  - Color contrast ≥ AA between piece, board, and HUD.
- **State of truth = boardgame.io.** All game logic (legal moves, win detection, turn order, piece selection stage) lives in the `Game` definition. UI subscribes; UI does not duplicate state.
- **AI runs client-side in a Web Worker.** No server function for moves. Random bot v1; advanced bots backlog only.
- **Static-deployable.** No required backend dependency in v1. Vercel build output should function as static + client routes.
- **Visual layer is swappable via typed Theme modules.** A `Theme` is a TypeScript module exporting tokens for:
  - Colors (palette + roles: surface, piece-light, piece-dark, accent-active, danger, win).
  - Piece geometry (base shape primitives, attribute mappings).
  - Piece materials (PBR: roughness, metalness, color, emissive).
  - Board surface.
  - **Lighting presets** — themes register multiple lighting modes user can toggle (e.g., HDRI environment + single-overhead). The generic theme registers both.
  - **Motion presets** — themes register multiple timing profiles user can toggle (Quick & crisp 150ms, Considered & smooth 280ms, Cinematic 500ms+). The generic theme registers all three.
  - Typography (UI font family + display font if distinct).
  Switching the visual direction must not require edits to game logic, AI, or boardgame.io definitions. Multiple themes coexist for A/B comparison.
- **`/playground` route is part of v1 surface.** Renders all 16 pieces and all key UI components across every registered theme on a single page. Primary tool for visual iteration.
- **App shape:** v1 prototyping ships **no menu, boot straight into game** (route `/`). Restart + opponent picker live in the in-game HUD. A menu / game-over loop is planned post-prototype (M3+) — included in roadmap, not v1.
- **Turn interaction (place handed piece):** Player may drag the handed piece onto a board cell, or click a cell to place. A confirm step gates every commit (place and pass). Confirm is on by default and can be disabled in settings for fast play.
- **Turn interaction (pick piece for opponent):** Click-select-then-confirm on the 3D rack. Drag-to-handoff-zone is acceptable as alternate input. Selection is reversible until confirmed.
- **Strategic preview affordance:** Available in both turn phases.
  - *Place phase:* hovering or dragging the handed piece over an empty cell ghosts the piece in that cell. Commit requires confirm. Non-commit hover/drag-release returns the piece untouched.
  - *Pick phase:* once the current player has selected a piece for the opponent, they may hover or drag that piece over board cells to ghost-preview what the opponent could do. Always non-committing — preview never plays the piece.
  - *Visual:* piece-only ghost. No win-line or threat-analysis overlays in v1 (kept for future training mode). Preserves competitive purity.
  - *Trigger:* hover-to-ghost (primary), drag-to-ghost (secondary, ties into drag-to-place input).
- **Turn indication:** HUD text states the current stage ("Place piece" / "Pick piece for opponent"). Board edge / lighting takes on the active player's color cue. No camera tilt.
- **Rules — canonical baseline + selected variants:**
  - **Must call "Quarto!"** is on. After placing a piece that completes a winning line, the player must explicitly press a "Quarto!" button. If they pass without calling it, play continues (and opponent may now exploit). Forces players to *see* their own win.
  - 4-in-a-2×2-square variant: **off**. Rows, columns, and diagonals only.
  - Diagonals: **on (hardcoded)**.
  - Piece ownership: **shared pool** (either player may hand any unused piece).
  - Undo: current turn only, handled implicitly by the existing confirm step. No separate undo command or history scrubbing.
  - Time control: **optional per-player clock**, opt-in setting. Default off.
- **Clock implementation pattern adopted from `narrative-chess-v2/lib/chess/clock.ts`:**
  - Modes for v1: `untimed | live`. Correspondence deferred (needs server persistence).
  - Presets: Untimed (default) / Blitz 3+0 / Blitz 5+0 / Rapid 10+0 / Rapid 15+10.
  - Fischer post-move increment. Pure client-side math; no lag credit, no RPCs, no Realtime, no cron — v1 is local-only.
  - Tick rate adapts: 1s above 10s remaining, 100ms at or below.
  - Format `MM:SS` → `M:SS.t` at low time.
  - First-move timeout = abort (no result recorded).
  - AI bot turn: human clock pauses while AI is thinking. AI has infinite time.
  - Reuse the pure clock math module shape (`computeRemaining`, `formatLive`, `tickRateMs`) from narrative-chess-v2 — port it, drop the server-mirroring concerns.
- **Theme picker hidden behind dev flag until 2+ themes exist.** v1 ships one default theme: `generic`.
- **Generic theme baseline (v1):**
  - *Material:* modern matte / PBR neutral. Soft ceramics + deep charcoal. Architectural feel.
  - *Color palette:* cool neutrals — slate, fog, snow, ink. Active-state accent stays a tonal step from the rest (no bright color v1).
  - *Lighting (two toggleable presets):* HDRI environment via drei (`studio` preset) AND single overhead + soft ambient. User flips between them in the settings drawer.
  - *Typography:* Geist (Vercel's default UI sans).
  - *Motion (three toggleable presets):* Quick & crisp (150ms ease-out, snappy bounce), Considered & smooth (280ms ease-out, gentle cinematic), Cinematic (500ms+, dramatic reveals). Designer-tunable; default = Considered.
- **Multiple camera modes, user-toggleable.** Supported: fixed top-down, fixed isometric (3/4), free orbit (Drei `OrbitControls`), subtle mouse parallax. Default mode pending designer call. Scripted GSAP cinematic moves on key beats (piece handed, piece placed, win) run on top of any base mode.
- **Piece tray rendering:** 3D view places pieces in-scene on a rack beside the board. 2D view (M4) renders the tray as a DOM grid of SVG pieces alongside the board. Both views consume the same `piece` state from boardgame.io — only the visual encoding differs.
- **Animation library = GSAP everywhere.** GSAP drives both DOM HUD timelines and R3F mesh state via `useGSAP` + tweening transform/material properties. Single vocabulary; designer-familiar timelines. No react-spring, no Theatre.js v1.
- **Animation catalog v1:**
  - Piece pick on rack (lift + glow on hover)
  - Piece hand-off (piece travels across screen to recipient)
  - Ghost preview opacity/elevation on hover-over-cell
  - Piece placement drop (arc + squash + bounce on land)
  - Confirm pulse on button + piece pending confirm
  - Win-line reveal (line trace + piece glow cascade + optional camera move)
  - Restart sweep (board clears, rack repopulates)
  - Camera mode crossfade (top-down ↔ iso ↔ orbit transitions)
  - Theme switch crossfade (materials/colors blend)
  - Clock low-time pulse
- **Deferred animations (M3+):** game-intro reveal sequence; dedicated GSAP timeline for Quarto-button pulse (v1 ships a lightweight CSS pulse for the E4 must-call cue).
- **Sound v1 = minimal UI SFX via WebAudio synth (no asset files).**
  - Port the `audioContext.ts` pattern from `color-taylor/src/utils/audioContext.ts`: singleton `AudioContext`, master gain → compressor → destination.
  - Build `lib/sfx/quartoSfx.ts` with named one-shot generators driven by oscillator + filter + envelope. Initial set: piece-pick blip, piece-place click, confirm click, hand-off rising tone, Quarto-call assertive tone, win fanfare chord.
  - No persistent voices. Each event spawns short-lived nodes.
  - Mute toggle in HUD/settings drawer. Audio off by default until user opt-in (browser autoplay policy + portfolio courtesy).
  - Designer-tunable parameters (frequency, duration, envelope) per event live in a typed config alongside the theme — sound becomes a theme axis post-v1.
- **Persistence v1 = settings + active game state in `localStorage`.**
  - Settings persisted: chosen camera mode, theme, clock preset, confirm-toggle, sound on/off.
  - Game state persisted: boardgame.io's local storage adapter writes the active match. Refresh resumes the game in progress.
  - No history of past games v1. No cloud sync v1.
- **AI difficulty UI = single "Random" option, no placeholders.** Picker is a flat list — grows naturally when new bot tiers ship. No "Coming soon" stubs.
- **Game-over reveal sequence (in-place, no route change):**
  1. *Freeze.* Game state locks; ghost previews and input disabled.
  2. *Win-line trace.* GSAP-animated glowing line traces the 4 winning cells.
  3. *Piece glow cascade.* The 4 winning pieces light sequentially in the shared-attribute color/material.
  4. *Non-winning dim.* Remaining pieces fade to low opacity / desaturate; winning line stays bright.
  5. *Camera move.* Scripted GSAP tween — slow push-in over the winning line or pull-up to overhead.
  6. *Win banner.* DOM HUD overlay: "Player N wins" + matching attribute description (e.g. "4 tall pieces") + "Play again" + "Settings" buttons.
  7. *SFX.* Win fanfare via the WebAudio synth module.
  8. *Missed-call (no banner).* If a player completed a winning line but did not press "Quarto!", play continues silently — opponent may now exploit. No "you had it" hint post-game; tournament behavior.
  9. *Draw.* All 16 pieces placed, no win line → "Draw" banner + "Play again".
  10. *Restart.* "Play again" → fade out → restart-sweep animation → fresh match.
- *Build priority:* freeze, line trace, banner, draw, restart are must-have v1; cascade, dim, camera move, SFX are polish in the same milestone.
- **HUD layout (route `/`):**
  - *Top bar:* turn label + stage (center). Settings drawer toggle (right). Branding placeholder (left).
  - *Sides of board:* two clocks (top + bottom of board, narrative-chess pattern). Visible only when clock enabled.
  - *Bottom HUD:* current handed piece (dominant focal point), confirm button, Quarto-call button (appears + pulses only when a win is on the board).
  - *Settings drawer:* shadcn `Sheet`, right-side slide-in. Contents — opponent picker (Hot-seat / AI/Random), camera mode toggle (top-down / iso / orbit / parallax), **lighting mode toggle (theme-defined presets)**, **motion preset toggle (Quick / Smooth / Cinematic)**, theme picker (dev-flagged until 2+ themes), sound mute toggle, clock preset, confirm-step toggle, **Reset/Restart button (lives here, not in top bar)**.
  - Restart action requires confirmation modal — fat-finger guard consistent with the confirm-step ethos.
- **Piece identity = 4-bit bitmask** (`0b0000`–`0b1111`) over attributes: height, color, shape, top-fill. No piece IDs or names. Visual form is a pure function of bitmask + theme.
- **2D piece rendering = isometric SVG projection of the same form, not a different visual language.** All four attributes remain legible from an isometric angle: top face shape (round/square) and fill (solid/hollow) read from above, height and color read from the side. Theme layer defines the form once; both 3D mesh and 2D iso SVG derive from it.
- **Rendering layer is replaceable.** Game state must be renderer-agnostic — same game state must be drivable from 3D R3F (v1) or 2D DOM/SVG (M4) without changes to the `Game` definition.
- **Two written-knowledge surfaces:** formal specs in `docs/`, project state/decisions/research in `wiki/`. Cross-project rules in Claude memory only.
- **TypeScript everywhere.** No JavaScript in source. Config files (`next.config.ts`, `vercel.ts`, `tailwind.config.ts`, `eslint.config.ts`) are TS-first wherever the tool supports it. JS only when forced by a tool.
- **Project layout:** top-level (no `src/`), App Router, layout broken out by role not feature. See §8 *File organization* below.

## 6. Milestones

- **M0 — Scaffold.** Next.js + Bun + Tailwind + shadcn baseline. boardgame.io installed. `bun dev` boots `/` with empty R3F canvas + HUD shell + settings drawer. `/playground` route stubbed. Husky/lint-staged + ESLint + Prettier wired. Vitest + Playwright configs in place (no tests yet). Local-only — no CI, no remote, no Vercel.
- **M1 — Core game (hot-seat).** Game definition complete: piece set, board, turn/select stages, win check. Minimum-viable UI. Hot-seat playable end-to-end.
- **M2 — AI bot (random) + Theme layer.** Web Worker harness. Random-move bot integrated as second player. `Theme` type defined, `generic` theme implemented, `/playground` route scaffolded.
- **M3 — Polish + menu loop.** GSAP transitions, R3F board interaction polish, desktop layout, accessibility pass. Introduce menu → game → game-over → menu shell once core feel is locked.
- **M4 — 2D fallback view + mobile.** Parallel 2D DOM/SVG rendering of same game state. Toggleable. Drives a11y + small-screen story. Touch controls + responsive layout land here.
- **M5 — Backlog.** Heuristic/minimax AI tiers, online multiplayer, stats, sound theming, physics (`@react-three/rapier`), 3D-native UI via `@react-three/uikit`, math helpers (`maath`) if patterns repeat.

## 7. File organization

```
/
├── app/
│   ├── layout.tsx              # root, font, theme provider
│   ├── page.tsx                # game route ("/")
│   ├── playground/page.tsx     # theme + piece tester (R2)
│   └── globals.css             # tailwind base
├── components/
│   ├── board/                  # 3D board, cells, in-scene pieces
│   ├── hud/                    # DOM HUD: top bar, bottom strip, drawer
│   ├── pieces/                 # 3D piece mesh + 2D SVG (M4)
│   ├── canvas/                 # R3F <Canvas> wrapper, camera rig, lighting
│   ├── theme-picker.tsx
│   └── ui/                     # shadcn-generated primitives
├── lib/
│   ├── game/                   # boardgame.io game definition, pieces, win check
│   ├── ai/                     # bots + worker bridge
│   ├── theme/                  # types + registry + generic theme
│   ├── sfx/                    # WebAudio synth + one-shot generators
│   ├── clock/                  # ported from narrative-chess-v2
│   ├── persistence/            # local-storage settings + game state
│   └── a11y/                   # live region announcer
├── hooks/                      # cross-component logic (use-ai-worker, use-clock, etc.)
├── workers/                    # Web Worker entries (ai.worker.ts)
├── public/
├── docs/                       # formal specs (this file lives here)
├── wiki/                       # Obsidian project knowledge
├── tests/                      # vitest unit + integration
├── e2e/                        # playwright
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vercel.ts                   # config (per platform knowledge update)
└── bunfig.toml
```

- Game logic in `lib/game/`, renderer-agnostic. UI imports state from `lib/game/*`; UI never duplicates state.
- AI in `lib/ai/`; bots are plain TS modules. Worker bridge in `workers/`.
- Themes in `lib/theme/` as typed TS modules. Registry + types separate; adding a theme = one new file + registry insert.
- `components/` categorized by role (board / hud / pieces / canvas / ui). Not by feature.
- `hooks/` for cross-component logic; non-hook utilities stay in `lib/`.
- `tests/` (vitest) + `e2e/` (playwright). Two test surfaces, not co-located.
- UI-only state (drawer open, picker selection) in zustand store. Game state stays in boardgame.io.

### Tests, lint, CI

- **Tests:** Vitest (unit + integration on `lib/*` and hooks) + React Testing Library (HUD components) + Playwright (e2e: place piece, win flow, hot-seat ↔ AI swap, theme swap, persistence resume). Tests in `tests/`, e2e in `e2e/`.
- **Lint / format:** ESLint + Prettier. Next.js preset + `@react-three/eslint-plugin` for R3F rules.
- **Pre-commit:** Husky + lint-staged. Apply the Windows worktree shebang + LF gitattribute fixes from the existing global memory note `tools/husky-windows-worktree.md` at install time.
- **CI:** Vercel deploys + GitHub Actions matrix on PR (lint + test + typecheck). E2E in CI deferred to M3 — run locally until then.

## 8. Open questions

Open for v1 commit:

- *None foundational.* All major design + architecture branches resolved during the grilling session.

Open for the next session (visual iteration phase):

- Default camera mode out of the four toggleable modes (top-down / iso / orbit / parallax).
- Bright-color accent vs strictly tonal accent in the generic theme.
- Concrete win-fanfare sound — chord, duration, voicing.
- E4 Quarto-call button placement details (bottom HUD position + size).
- First themed skin direction (after `generic`) — wood, neon, paper, etc.
- GitHub repo visibility (private at first; public-on-portfolio later TBD).
- Custom domain selection at Vercel cutover time.

Resolved (recorded in `wiki/notes/decision-*.md`): rules + variants, opponent scope, AI strategy v1, rendering hybrid, device priority, audience lens, theme architecture, camera modes, piece tray, piece bitmask identity, app shape, turn micro-interaction, ghost preview, clock pattern, a11y baseline, animation library + catalog, sound, persistence, AI difficulty UI, game-over reveal, HUD layout, R3F deps, project structure + TS-everywhere, tests + lint + CI, generic theme baseline, license MIT.
