'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { findWin } from '@/lib/game/win';
import { ATTR, ATTR_NAMES, describe } from '@/lib/game/pieces';
import { useSfx } from '@/hooks/use-sfx';
import { useHoverStore } from '@/lib/state/hover-store';
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
  const hoveredPiece = useHoverStore((s) => s.piece);
  const G = state?.G;
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const winInfo = useMemo(() => (G ? findWin(G.board) : null), [G]);
  const winAvailable = winInfo !== null;
  const sharedMask = G?.winner?.sharedMask ?? winInfo?.sharedMask ?? 0;
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

  const hoverLabel = hoveredPiece !== null ? describe(hoveredPiece) : null;
  const stageLabel = stage === 'place' ? handedLabel : stage === 'pick' ? handoffLabel : null;
  const activeLabel = hoverLabel ?? stageLabel;
  const attrLines = activeLabel ? activeLabel.split(' ') : null;

  return (
    <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-col items-center gap-3 px-6 py-6">
      <div className="flex items-center gap-4">
        {canConfirmPlace && (
          <>
            <Button size="lg" variant="outline" onClick={moves.clearPendingPlace}>
              Cancel
            </Button>
            <Button size="lg" onClick={moves.confirmPlace} className="confirm-pulse">
              Confirm place
            </Button>
          </>
        )}
        {canConfirmHandoff && (
          <>
            <Button size="lg" variant="outline" onClick={moves.clearPendingHandoff}>
              Cancel
            </Button>
            <Button size="lg" onClick={moves.confirmHandoff} className="confirm-pulse">
              Confirm pass
            </Button>
          </>
        )}

        {canCallQuarto ? (
          <button
            type="button"
            onClick={() => {
              playSfx('quarto-call');
              moves.callQuarto();
            }}
            className="quarto-glow rounded-xl border-2 border-white/60 bg-[#c9a866] px-10 py-5 text-xl font-bold tracking-widest text-[#1e2128] uppercase shadow-2xl"
          >
            Quarto!
          </button>
        ) : (
          <Button size="lg" variant="outline" disabled>
            Quarto!
          </Button>
        )}
      </div>

      {/* Faux-3D plate: top-light gradient + inset highlight/shadow + ring,
          so the bar reads as a brushed grey surface catching overhead light.
          Attrs that match the current winning line's sharedMask glow. */}
      <div
        className="grid w-full max-w-md grid-cols-4 gap-2 rounded-lg bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 px-4 py-4 font-mono text-lg text-slate-900 capitalize ring-1 ring-slate-500/30"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        {attrLines ? (
          attrLines.map((part, i) => {
            const attr = ATTR_NAMES[i];
            const isShared = attr !== undefined && (sharedMask & ATTR[attr]) !== 0;
            return (
              <span
                key={part}
                className={
                  isShared
                    ? 'rounded-md bg-amber-300 px-2 py-1 text-center font-bold text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_0_1px_rgba(180,120,30,0.5)]'
                    : 'text-center'
                }
              >
                {part}
              </span>
            );
          })
        ) : (
          <span className="col-span-4 text-center text-slate-500">—</span>
        )}
      </div>
    </div>
  );
}
