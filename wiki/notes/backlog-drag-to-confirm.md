---
tags:
  - domain/visual
  - status/open
  - scope/m3
  - origin/session-2026-05-25
---

# Backlog: Drag-to-Confirm Interaction

**Status.** Attempted in M3 polish iteration. **Does not work** in the current build — filed for a future pass.

**Goal.** Alternative to the click-to-confirm flow: a player can drag an available piece from the rack onto a board cell (place) or onto the opponent's pedestal (give). Drop on a valid target commits the action. Drop elsewhere lowers/cancels the piece.

**Constraints.**

- Must not conflict with `OrbitControls` — when a drag starts on a piece, OrbitControls should be disabled until pointer-up.
- Should respect the locked confirm-step rule: drag-and-drop is the confirm gesture; release on target = commit, release off target = no-op (selection remains active).
- Visual feedback during drag — piece follows cursor projection on the board plane; valid drop targets glow with the selection color.

**Sketch of implementation.**

1. Track a `dragState` (zustand or local) with `{ piece, kind: 'pick' | 'place', dropTarget }`.
2. `PieceMesh` accepts `onDragStart` — fires on `onPointerDown` if interaction is allowed.
3. Canvas-level `onPointerMove` raycasts into the scene, sets `dropTarget` if intersecting a valid cell / pedestal.
4. `OrbitControls.enabled = dragState === null`.
5. `onPointerUp` evaluates `dropTarget`; dispatches `confirmPlace` / `confirmHandoff` if valid, else clears drag state (selection may stay raised — design call).

**Why deferred.** Selection-toggle + button confirm flow is fully working; drag is a nice-to-have, not a blocker. Implementing it cleanly inside R3F + drei + Html overlays needs more time than the current iteration window.

**Resume here when picking this up.**

Linked from [[quarto-v1]].
