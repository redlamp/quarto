'use client';

import { useCallback } from 'react';
import { useUiStore } from '@/lib/state/ui-store';
import { playSfx, type SfxName } from '@/lib/sfx/quartoSfx';

// Returns a stable play() callback that respects the user's sound-enabled
// setting. Off by default until the user opts in via the settings drawer.
export function useSfx(): (name: SfxName) => void {
  const enabled = useUiStore((s) => s.soundEnabled);
  return useCallback(
    (name: SfxName) => {
      if (!enabled) return;
      playSfx(name);
    },
    [enabled],
  );
}
