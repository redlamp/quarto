import { create } from 'zustand';
import type { Piece } from '@/lib/game/pieces';

interface HoverState {
  piece: Piece | null;
  set: (p: Piece | null) => void;
}

// Tracks which piece (rack or pedestal) the pointer is currently over so the
// bottom-HUD detail viewer can show its attributes. Non-persisted.
export const useHoverStore = create<HoverState>((set) => ({
  piece: null,
  set: (p) => set({ piece: p }),
}));
