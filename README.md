# Quarto

A 3D browser implementation of [Quarto](https://en.wikipedia.org/wiki/Quarto_%28board_game%29) — the abstract strategy game where you hand your opponent the next piece to place, and a row of four pieces sharing any attribute wins.

Live: [https://redlamp.github.io/quarto/](https://redlamp.github.io/quarto/)

## Stack

- **Next.js 16** (App Router, static export)
- **react-three-fiber** + **@react-three/drei** — 3D scene
- **boardgame.io** — turn engine, stages, win detection
- **Zustand** — UI + flight + hover state
- **GSAP** — camera + piece animations
- **shadcn/ui** + **Tailwind v4** — HUD primitives
- **Web Worker** — random AI opponent (off the main thread)
- **Bun** — runtime + package manager
- **Vitest** + **Playwright** — unit + e2e tests

## Running locally

```bash
bun install
bun run dev      # http://localhost:3003
```

Other scripts:

```bash
bun run typecheck    # tsc --noEmit
bun run lint         # eslint .
bun run test         # vitest
bun run e2e          # playwright test
bun run build        # static export → out/
```

## Project layout

```
app/                # Next.js App Router pages
components/
  board/            # 3D board, rack, pedestals, piece meshes
  canvas/           # Canvas wrapper + camera rig
  hud/              # Top bar, bottom HUD, settings drawer, win banner
  pieces/           # PieceMesh (geometry per attribute combination)
  ui/               # shadcn primitives (Button, Select, Switch, Sheet, …)
hooks/              # use-quarto-client, use-ai-opponent, use-clock, use-sfx, …
lib/
  ai/               # AI move policies
  clock/            # Pure chess-clock math + presets
  game/             # boardgame.io definition + pieces + win detection
  motion/           # Motion presets + reduced-motion handling
  sfx/              # WebAudio synth + quarto sound bank
  state/            # Zustand stores
  theme/            # Theme palette + lighting/motion presets
  three/            # R3F-side utilities (procedural textures, etc.)
workers/            # AI worker
docs/               # PRD
wiki/               # Decisions, daily logs, research (Obsidian vault)
```

## Game rules

- **4×4 board.** 16 unique pieces, each with four binary attributes: **height** (tall/short), **color** (dark/light), **shape** (square/round), **top** (hollow/solid).
- On your turn you (1) place the piece your opponent gave you, then (2) hand them the next one.
- Four pieces in a row/column/diagonal that share **any single attribute** wins.
- You must **call "Quarto!"** to claim a win; missing it lets play continue.
- Optional chess clock (Blitz/Rapid, Fischer increment). First-move timeout aborts.

## Features

- 3D board with multiple camera modes (top-down, isometric ortho, free orbit, parallax cursor-follow with drag re-base).
- Configurable focal point (board center / play area / active player).
- Settings drawer (shadcn): opponent, clock, camera, focal point, theme, lighting/motion presets, audio, parallax tuning.
- WebAudio one-shot SFX (no asset files; synth-only).
- AI opponent runs in a Web Worker.
- HUD detail panel highlights the trait(s) shared by a winning line.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Installs deps with Bun.
2. Builds a static export (`bun run build`, `output: 'export'`).
3. Sets `NEXT_PUBLIC_BASE_PATH=/quarto` so assets resolve under the repo path.
4. Uploads `out/` and publishes via `actions/deploy-pages`.

Local builds skip the base path (`bun run build` → assets resolve from `/`).

## Branching

`feature/* → dev → main`. Features rebase + fast-forward into `dev` to keep history linear. Direct commits to `dev` and `main` are avoided.
