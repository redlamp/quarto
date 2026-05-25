---
tags:
  - domain/architecture
  - status/verified
  - origin/grill-2026-05-25
---

# Research: boardgame.io

Turn-based game state management library. Built-in stages, undo, AI bot framework, optional multiplayer server.

**Why on the radar.** Quarto's two-stage turn (place piece → pick opponent's piece) maps cleanly to boardgame.io's `stages` system. AI interface is library-standard. Saves writing netcode if/when online multiplayer ships.

**Source.** [github.com/boardgameio/boardgame.io](https://github.com/boardgameio/boardgame.io)

**Adopted in.** [[decision-adopt-boardgame-io]]
