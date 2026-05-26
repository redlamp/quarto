import { create } from 'zustand';

interface DragState {
  active: boolean;
  start: () => void;
  end: () => void;
}

// Tiny non-persisted store for the drag-to-confirm interaction. Lifted out
// of the persisted ui-store so the value resets on reload.
export const useDragStore = create<DragState>((set) => ({
  active: false,
  start: () => set({ active: true }),
  end: () => set({ active: false }),
}));
