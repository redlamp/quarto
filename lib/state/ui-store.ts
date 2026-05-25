import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OpponentMode = 'hot-seat' | 'ai-random';
export type UiTheme = 'light' | 'dark';

interface UiState {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawer: (open: boolean) => void;

  // Persisted settings
  opponent: OpponentMode;
  setOpponent: (mode: OpponentMode) => void;

  themeName: string;
  setThemeName: (name: string) => void;

  lightingPresetName: string | null;
  setLightingPresetName: (name: string) => void;

  motionPresetName: string | null;
  setMotionPresetName: (name: string) => void;

  soundEnabled: boolean;
  setSoundEnabled: (on: boolean) => void;

  confirmEnabled: boolean;
  setConfirmEnabled: (on: boolean) => void;

  uiTheme: UiTheme;
  setUiTheme: (t: UiTheme) => void;
  toggleUiTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      setDrawer: (open) => set({ drawerOpen: open }),

      opponent: 'hot-seat',
      setOpponent: (mode) => set({ opponent: mode }),

      themeName: 'generic',
      setThemeName: (name) => set({ themeName: name }),

      lightingPresetName: null,
      setLightingPresetName: (name) => set({ lightingPresetName: name }),

      motionPresetName: null,
      setMotionPresetName: (name) => set({ motionPresetName: name }),

      soundEnabled: false,
      setSoundEnabled: (on) => set({ soundEnabled: on }),

      confirmEnabled: true,
      setConfirmEnabled: (on) => set({ confirmEnabled: on }),

      uiTheme: 'light',
      setUiTheme: (t) => set({ uiTheme: t }),
      toggleUiTheme: () => set((s) => ({ uiTheme: s.uiTheme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'quarto-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        opponent: s.opponent,
        themeName: s.themeName,
        lightingPresetName: s.lightingPresetName,
        motionPresetName: s.motionPresetName,
        soundEnabled: s.soundEnabled,
        confirmEnabled: s.confirmEnabled,
        uiTheme: s.uiTheme,
      }),
    },
  ),
);
