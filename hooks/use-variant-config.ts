'use client';

import { DEFAULT_TRAITS, type VariantConfig } from '@/lib/game/variants';
import { useUiStore } from '@/lib/state/ui-store';

// Active variant config from persisted UI settings: current board size plus
// its trait selection (falling back to the size's default set). Board size is
// coupled to trait count — a stored list whose length no longer matches the
// board (e.g. persisted by an older build) self-heals to the defaults.
export function useVariantConfig(): VariantConfig {
  const boardSize = useUiStore((s) => s.boardSize);
  const traitsBySize = useUiStore((s) => s.traitsBySize);
  const stored = traitsBySize[String(boardSize)];
  const traitIds =
    stored && stored.length === boardSize
      ? stored
      : (DEFAULT_TRAITS[boardSize] ?? DEFAULT_TRAITS[4]!);
  return { boardSize, traitIds };
}
