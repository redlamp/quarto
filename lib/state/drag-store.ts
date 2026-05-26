import { create } from 'zustand';
import type { Piece } from '@/lib/game/pieces';

export type DragKind = 'place' | 'pick';

export interface CursorWorld {
  x: number;
  z: number;
}

interface DragState {
  active: boolean;
  piece: Piece | null;
  kind: DragKind | null;
  source: CursorWorld | null;
  cursorWorld: CursorWorld | null;
  hasMoved: boolean;
  start: (piece: Piece, kind: DragKind, source: CursorWorld) => void;
  setCursor: (cursor: CursorWorld) => void;
  end: () => void;
}

const MOVE_THRESHOLD = 0.2;

// Non-persisted store for the in-flight drag interaction. Tracks both the
// source slot (where the drag started) and the current cursor projection on
// the board plane, plus whether the cursor has moved enough to count as a
// drag (vs. a click).
export const useDragStore = create<DragState>((set) => ({
  active: false,
  piece: null,
  kind: null,
  source: null,
  cursorWorld: null,
  hasMoved: false,
  start: (piece, kind, source) =>
    set({ active: true, piece, kind, source, cursorWorld: source, hasMoved: false }),
  setCursor: (cursor) =>
    set((s) => {
      if (!s.source) return { cursorWorld: cursor };
      const dx = cursor.x - s.source.x;
      const dz = cursor.z - s.source.z;
      const moved = s.hasMoved || dx * dx + dz * dz > MOVE_THRESHOLD * MOVE_THRESHOLD;
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
    }),
}));
