'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { findWin } from '@/lib/game/win';
import { describe } from '@/lib/game/pieces';
import { useSfx } from '@/hooks/use-sfx';
import type { QuartoState } from '@/lib/game/definition';

interface BottomHudProps {
  state: {
    G: QuartoState;
    ctx: {
      activePlayers?: Record<string, string> | null;
      currentPlayer: string;
      gameover?: unknown;
    };
  } | null;
  moves: {
    confirmPlace: () => void;
    confirmHandoff: () => void;
    clearPendingPlace: () => void;
    clearPendingHandoff: () => void;
    callQuarto: () => void;
  };
}

export function BottomHud({ state, moves }: BottomHudProps) {
  const playSfx = useSfx();
  const G = state?.G;
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const winAvailable = useMemo(() => (G ? findWin(G.board) !== null : false), [G]);
  const isGameOver = !!state?.ctx.gameover;
  const hasPendingPlace = G?.pendingPlace !== null && G?.pendingPlace !== undefined;
  const hasPendingHandoff = G?.pendingHandoff !== null && G?.pendingHandoff !== undefined;
  const canConfirmPlace = stage === 'place' && hasPendingPlace && !isGameOver;
  const canConfirmHandoff = stage === 'pick' && hasPendingHandoff && !isGameOver;
  const canCallQuarto = winAvailable && !isGameOver;

  const handedLabel =
    G?.handedPiece !== null && G?.handedPiece !== undefined ? describe(G.handedPiece) : null;
  const handoffLabel =
    G?.pendingHandoff !== null && G?.pendingHandoff !== undefined
      ? describe(G.pendingHandoff)
      : null;

  const activeLabel = stage === 'place' ? handedLabel : stage === 'pick' ? handoffLabel : null;
  const attrLines = activeLabel ? activeLabel.split(' ') : null;

  return (
    <div className="absolute right-0 bottom-0 left-0 z-10 flex items-end justify-center gap-4 px-6 py-6">
      <div className="flex h-24 w-24 flex-col items-center justify-center gap-0.5 rounded-md bg-[var(--color-surface-muted)] font-mono text-xs leading-tight text-[var(--color-ink)] capitalize">
        {attrLines ? (
          attrLines.map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))
        ) : (
          <span className="text-[var(--color-fog)]">—</span>
        )}
      </div>

      {canConfirmPlace && (
        <>
          <Button variant="outline" onClick={moves.clearPendingPlace}>
            Cancel
          </Button>
          <Button onClick={moves.confirmPlace} className="confirm-pulse">
            Confirm place
          </Button>
        </>
      )}
      {canConfirmHandoff && (
        <>
          <Button variant="outline" onClick={moves.clearPendingHandoff}>
            Cancel
          </Button>
          <Button onClick={moves.confirmHandoff} className="confirm-pulse">
            Confirm pass
          </Button>
        </>
      )}

      <Button
        variant={canCallQuarto ? 'default' : 'outline'}
        disabled={!canCallQuarto}
        onClick={() => {
          playSfx('quarto-call');
          moves.callQuarto();
        }}
        className={canCallQuarto ? 'animate-pulse' : ''}
      >
        Quarto!
      </Button>
    </div>
  );
}
