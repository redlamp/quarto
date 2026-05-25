import { create } from 'zustand';

interface UiState {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawer: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  setDrawer: (open) => set({ drawerOpen: open }),
}));
