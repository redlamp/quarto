---
tags:
  - domain/architecture
  - domain/devops
  - status/adopted
  - scope/m0
  - origin/grill-2026-05-25
---

# Decision: Project Structure + Tooling

**Context.** Drives the M0 scaffold. Decisions on layout, language, test runners, lint, hooks, CI.

**Choice.**

- **TypeScript everywhere.** No `.js` in source. Config files TS-first wherever supported (`next.config.ts`, `vercel.ts`, `tailwind.config.ts`, `eslint.config.ts`).
- **Top-level layout** (no `src/`). App Router. See `docs/PRD.md` §7 for tree.
- **Components by role**, not by feature (`board/`, `hud/`, `pieces/`, `canvas/`, `ui/`).
- **Game logic in `lib/game/`**, renderer-agnostic. AI in `lib/ai/`. Themes in `lib/theme/`. Clock in `lib/clock/`. Sound in `lib/sfx/`. Persistence in `lib/persistence/`. A11y helpers in `lib/a11y/`.
- **UI-only state** (drawer open, picker selection) in a zustand store. Game state stays in boardgame.io.
- **Tests:** Vitest (units + integration on `lib/*` + hooks) + React Testing Library (HUD) + Playwright (e2e). Tests in `tests/`, e2e in `e2e/`.
- **Lint / format:** ESLint + Prettier. Next.js preset + `@react-three/eslint-plugin`.
- **Pre-commit:** Husky + lint-staged. Apply the Windows worktree fixes from global memory note `tools/husky-windows-worktree.md`.
- **CI:** Vercel deploys + GitHub Actions matrix on PR (lint + test + typecheck). E2E in CI deferred to M3.

**Why.**
- TS-everywhere is non-negotiable for portfolio rigor.
- Role-based component layout reduces cross-imports and keeps the surface small.
- Two test surfaces (vitest + playwright) cover game logic correctness and feature correctness separately.
- Husky on Windows worktrees is a known foot-gun — the existing memory note saves a debugging session.

**Date.** 2026-05-25.

Linked from [[decisions]].
