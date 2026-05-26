'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from './context';
import { useUiStore } from '@/lib/state/ui-store';

// Threads the user's persisted theme/lighting/motion selections into
// ThemeProvider. Sits at the client boundary so the server layout stays static.
export function ReactiveThemeProvider({ children }: { children: ReactNode }) {
  const themeName = useUiStore((s) => s.themeName);
  const lightingPresetName = useUiStore((s) => s.lightingPresetName);
  const motionPresetName = useUiStore((s) => s.motionPresetName);

  return (
    <ThemeProvider
      themeName={themeName}
      lightingPresetName={lightingPresetName ?? undefined}
      motionPresetName={motionPresetName ?? undefined}
    >
      {children}
    </ThemeProvider>
  );
}
