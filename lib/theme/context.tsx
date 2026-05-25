'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { defaultTheme, getTheme } from './registry';
import type { LightingPreset, MotionPreset, Theme } from './types';

interface ThemeContextValue {
  theme: Theme;
  lightingPreset: LightingPreset;
  motionPreset: MotionPreset;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  themeName?: string;
  lightingPresetName?: string;
  motionPresetName?: string;
}

export function ThemeProvider({
  children,
  themeName,
  lightingPresetName,
  motionPresetName,
}: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    const theme = themeName ? getTheme(themeName) : defaultTheme;
    const lighting =
      theme.lighting[lightingPresetName ?? theme.defaultLightingPreset] ??
      theme.lighting[theme.defaultLightingPreset]!;
    const motion =
      theme.motion[motionPresetName ?? theme.defaultMotionPreset] ??
      theme.motion[theme.defaultMotionPreset]!;
    return { theme, lightingPreset: lighting, motionPreset: motion };
  }, [themeName, lightingPresetName, motionPresetName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    // Fallback for non-wrapped contexts (tests, /playground stub, etc.).
    return {
      theme: defaultTheme,
      lightingPreset: defaultTheme.lighting[defaultTheme.defaultLightingPreset]!,
      motionPreset: defaultTheme.motion[defaultTheme.defaultMotionPreset]!,
    };
  }
  return value;
}
