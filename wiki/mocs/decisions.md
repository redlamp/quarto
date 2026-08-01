# Decisions

Atomic decision notes for the Quarto project. Each note captures one decision: context, options, choice, why, date.

## Adopted

### Architecture

- [[decision-adopt-boardgame-io]]
- [[decision-ai-strategy-v1-random-in-worker]]
- [[decision-hybrid-3d-2d-rendering]]
- [[decision-trait-catalog-binary]]
- [[decision-clock-pattern-from-narrative-chess]]
- [[decision-r3f-ecosystem-deps]]
- [[decision-project-structure-and-tooling]]

### Rules + interactions

- [[decision-must-call-quarto-with-e4-hint]]
- [[decision-confirm-step-and-ghost-preview]]

### Visual

- [[decision-portfolio-audience-and-desktop-first]]
- [[decision-theme-architecture-typed-modules]]
- [[decision-camera-modes-toggleable]]
- [[decision-no-menu-app-shape]]
- [[decision-gsap-everywhere-with-catalog]]
- [[decision-game-over-in-place-reveal]]
- [[decision-hud-layout]]
- [[decision-generic-theme-baseline]]

### A11y

- [[decision-wcag-aa-baseline]]

### Audio

- [[decision-sound-webaudio-synth]]

### Persistence

- [[decision-persistence-localstorage]]

### License

- [[decision-license-mit]]

## Deferred

- [[backlog-drag-to-confirm]] — drag piece to board cell / pedestal = confirms. Attempted M3, deferred.

## Superseded

- [[decision-piece-bitmask-identity]] — generalized to mixed-radix trait vectors by [[decision-variant-lineup]] (2026-07-31).
- [[decision-variant-lineup]] — mixed-arity traits dropped for the binary trait catalog + per-board trait selection in [[decision-trait-catalog-binary]] (2026-08-01).
