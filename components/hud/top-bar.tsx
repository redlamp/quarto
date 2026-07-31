'use client';

import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VARIANTS } from '@/lib/game/variants';
import { useUiStore } from '@/lib/state/ui-store';
import type { QuartoState } from '@/lib/game/definition';

interface TopBarProps {
  state: {
    G: QuartoState;
    ctx: {
      activePlayers?: Record<string, string> | null;
      currentPlayer: string;
      gameover?: unknown;
    };
  } | null;
}

function turnLabel(state: TopBarProps['state']): string {
  if (!state) return '';
  if (state.ctx.gameover) return 'Game over';
  const stage = state.ctx.activePlayers?.[state.ctx.currentPlayer];
  const player = `Player ${Number(state.ctx.currentPlayer) + 1}`;
  if (stage === 'place') return `${player} — place piece`;
  if (stage === 'pick') return `${player} — pick piece for opponent`;
  return player;
}

export function TopBar({ state }: TopBarProps) {
  const openDrawer = useUiStore((s) => s.openDrawer);
  const variantId = useUiStore((s) => s.variantId);
  const setVariantId = useUiStore((s) => s.setVariantId);
  return (
    <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="font-mono text-sm tracking-tight text-[var(--color-ink)]">Quarto</div>
        {/* Variant menu — switching starts a fresh game on the new board. */}
        <Select value={variantId} onValueChange={setVariantId}>
          <SelectTrigger
            aria-label="Variant"
            className="h-8 w-44 bg-[var(--color-surface)]/40 text-xs backdrop-blur-md"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VARIANTS.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        aria-live="polite"
        className="rounded-full bg-[var(--color-surface)]/40 px-4 py-1.5 text-sm text-[var(--color-ink)] backdrop-blur-md"
      >
        {turnLabel(state)}
      </div>
      <Button variant="ghost" size="icon" aria-label="Open settings" onClick={openDrawer}>
        <SettingsIcon className="h-5 w-5" />
      </Button>
    </header>
  );
}
