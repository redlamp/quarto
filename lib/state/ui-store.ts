import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_VARIANT_ID } from '@/lib/game/variants';

export type OpponentMode = 'hot-seat' | 'ai-random';
export type UiTheme = 'light' | 'dark';
export type CameraMode = 'top-down' | 'iso' | 'orbit' | 'parallax';
export type FocalPoint = 'board' | 'play-area' | 'active';

export const PARALLAX_DEFAULTS = { x: 1.6, y: 1.0, lerp: 0.1 } as const;

interface UiState {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawer: (open: boolean) => void;

  // Persisted settings
  variantId: string;
  setVariantId: (id: string) => void;

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

  clockPresetName: string;
  setClockPresetName: (name: string) => void;

  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;

  focalPoint: FocalPoint;
  setFocalPoint: (f: FocalPoint) => void;

  // Parallax camera tuning: cursor-driven sway magnitudes (world units) + the
  // per-frame lerp factor that smooths the follow.
  parallaxX: number;
  setParallaxX: (n: number) => void;
  parallaxY: number;
  setParallaxY: (n: number) => void;
  parallaxLerp: number;
  setParallaxLerp: (n: number) => void;
  resetParallax: () => void;

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

      variantId: DEFAULT_VARIANT_ID,
      setVariantId: (id) => set({ variantId: id }),

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

      clockPresetName: 'untimed',
      setClockPresetName: (name) => set({ clockPresetName: name }),

      cameraMode: 'orbit',
      setCameraMode: (mode) => set({ cameraMode: mode }),

      focalPoint: 'play-area',
      setFocalPoint: (f) => set({ focalPoint: f }),

      parallaxX: PARALLAX_DEFAULTS.x,
      setParallaxX: (n) => set({ parallaxX: n }),
      parallaxY: PARALLAX_DEFAULTS.y,
      setParallaxY: (n) => set({ parallaxY: n }),
      parallaxLerp: PARALLAX_DEFAULTS.lerp,
      setParallaxLerp: (n) => set({ parallaxLerp: n }),
      resetParallax: () =>
        set({
          parallaxX: PARALLAX_DEFAULTS.x,
          parallaxY: PARALLAX_DEFAULTS.y,
          parallaxLerp: PARALLAX_DEFAULTS.lerp,
        }),

      uiTheme: 'light',
      setUiTheme: (t) => set({ uiTheme: t }),
      toggleUiTheme: () => set((s) => ({ uiTheme: s.uiTheme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'quarto-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        variantId: s.variantId,
        opponent: s.opponent,
        themeName: s.themeName,
        lightingPresetName: s.lightingPresetName,
        motionPresetName: s.motionPresetName,
        soundEnabled: s.soundEnabled,
        confirmEnabled: s.confirmEnabled,
        clockPresetName: s.clockPresetName,
        cameraMode: s.cameraMode,
        focalPoint: s.focalPoint,
        parallaxX: s.parallaxX,
        parallaxY: s.parallaxY,
        parallaxLerp: s.parallaxLerp,
        uiTheme: s.uiTheme,
      }),
    },
  ),
);
