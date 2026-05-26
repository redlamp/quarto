import { create } from 'zustand';
import type { Piece } from '@/lib/game/pieces';

export type DragKind = 'place' | 'pick';

export interface CursorWorld {
  x: number;
  z: number;
}

export interface PressScreen {
  x: number;
  y: number;
}

interface DragState {
  active: boolean;
  piece: Piece | null;
  kind: DragKind | null;
  source: CursorWorld | null;
  cursorWorld: CursorWorld | null;
  hasMoved: boolean;
  pressAt: number;
  pressScreen: PressScreen | null;
  start: (piece: Piece, kind: DragKind, source: CursorWorld, screen: PressScreen) => void;
  setCursor: (cursor: CursorWorld) => void;
  end: () => void;
}

const MOVE_THRESHOLD_WORLD = 0.25;

// Non-persisted store for the in-flight drag interaction. Tracks both the
// source slot and the live cursor world projection, plus the press timestamp
// + screen origin so the DragController can distinguish a click from a drag.
export const useDragStore = create<DragState>((set) => ({
  active: false,
  piece: null,
  kind: null,
  source: null,
  cursorWorld: null,
  hasMoved: false,
  pressAt: 0,
  pressScreen: null,
  start: (piece, kind, source, screen) =>
    set({
      active: true,
      piece,
      kind,
      source,
      cursorWorld: source,
      hasMoved: false,
      pressAt: Date.now(),
      pressScreen: screen,
    }),
  setCursor: (cursor) =>
    set((s) => {
      if (!s.source) return { cursorWorld: cursor };
      const dx = cursor.x - s.source.x;
      const dz = cursor.z - s.source.z;
      const moved = s.hasMoved || dx * dx + dz * dz > MOVE_THRESHOLD_WORLD * MOVE_THRESHOLD_WORLD;
      return { cursorWorld: cursor, hasMoved: moved };
    }),
  end: () =>
    set({
      active: false,
      piece: null,
      kind: null,
      source: null,
      cursorWorld: null,
      hasMoved: false,
      pressAt: 0,
      pressScreen: null,
    }),
}));
