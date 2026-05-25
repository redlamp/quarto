'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { findWin } from '@/lib/game/win';
import { describe } from '@/lib/game/pieces';
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

  return (
    <div className="absolute right-0 bottom-0 left-0 z-10 flex items-end justify-center gap-4 px-6 py-6">
      <div className="bg-surface-muted flex h-20 w-20 flex-col items-center justify-center rounded-md font-mono text-[10px] leading-tight text-slate-700">
        {stage === 'place' && handedLabel ? (
          <span className="text-center">{handedLabel.split(' ').join('\n')}</span>
        ) : stage === 'pick' && handoffLabel ? (
          <span className="text-center">{handoffLabel.split(' ').join('\n')}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </div>

      {canConfirmPlace && (
        <>
          <Button variant="outline" onClick={moves.clearPendingPlace}>
            Cancel
          </Button>
          <Button onClick={moves.confirmPlace}>Confirm place</Button>
        </>
      )}
      {canConfirmHandoff && (
        <>
          <Button variant="outline" onClick={moves.clearPendingHandoff}>
            Cancel
          </Button>
          <Button onClick={moves.confirmHandoff}>Confirm pass</Button>
        </>
      )}

      <Button
        variant={canCallQuarto ? 'default' : 'outline'}
        disabled={!canCallQuarto}
        onClick={moves.callQuarto}
        className={canCallQuarto ? 'animate-pulse' : ''}
      >
        Quarto!
      </Button>
    </div>
  );
}
