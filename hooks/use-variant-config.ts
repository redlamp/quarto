'use client';

import { DEFAULT_TRAITS, type VariantConfig } from '@/lib/game/variants';
import { useUiStore } from '@/lib/state/ui-store';

// Active variant config from persisted UI settings: current board size plus
// its trait selection (falling back to the size's default set).
export function useVariantConfig(): VariantConfig {
  const boardSize = useUiStore((s) => s.boardSize);
  const traitsBySize = useUiStore((s) => s.traitsBySize);
  const traitIds =
    traitsBySize[String(boardSize)] ?? DEFAULT_TRAITS[boardSize] ?? DEFAULT_TRAITS[4]!;
  return { boardSize, traitIds };
}
