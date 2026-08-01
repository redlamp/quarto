'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { findWin } from '@/lib/game/win';
import { describePiece, getVariant } from '@/lib/game/variants';
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
  const variant = getVariant(G?.variantId);
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const winInfo = useMemo(() => (G ? findWin(G.board, variant) : null), [G, variant]);
  const winAvailable = winInfo !== null;
  const shared = G?.winner?.shared ?? winInfo?.shared;
  const sharedTraitSet = useMemo(() => new Set((shared ?? []).map((s) => s.trait)), [shared]);
  const isGameOver = !!state?.ctx.gameover;
  const hasPendingPlace = G?.pendingPlace !== null && G?.pendingPlace !== undefined;
  const hasPendingHandoff = G?.pendingHandoff !== null && G?.pendingHandoff !== undefined;
  const canConfirmPlace = stage === 'place' && hasPendingPlace && !isGameOver;
  const canConfirmHandoff = stage === 'pick' && hasPendingHandoff && !isGameOver;
  const canCallQuarto = winAvailable && !isGameOver;

  const handedLabel =
    G?.handedPiece !== null && G?.handedPiece !== undefined
      ? describePiece(variant, G.handedPiece)
      : null;
  const handoffLabel =
    G?.pendingHandoff !== null && G?.pendingHandoff !== undefined
      ? describePiece(variant, G.pendingHandoff)
      : null;

  const hoverLabel = hoveredPiece !== null ? describePiece(variant, hoveredPiece) : null;
  const stageLabel = stage === 'place' ? handedLabel : stage === 'pick' ? handoffLabel : null;
  // When a winning line exists, fall back to a piece from that line so the
  // detail panel shows the shared trait pills even with no hover/stage piece.
  const winLineLabel =
    winInfo && G && G.board[winInfo.cells[0]!] !== null
      ? describePiece(variant, G.board[winInfo.cells[0]!]!)
      : null;
  const activeLabel = hoverLabel ?? stageLabel ?? winLineLabel;
  // Value labels are single words, one per trait — same order as the traits.
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
            {variant.call}!
          </button>
        ) : (
          <Button size="lg" variant="outline" disabled>
            {variant.call}!
          </Button>
        )}
      </div>

      {/* Faux-3D plate: top-light gradient + inset highlight/shadow + ring,
          so the bar reads as a brushed grey surface catching overhead light.
          Trait values shared along the current winning line glow. */}
      <div
        className="grid w-full max-w-md gap-2 rounded-lg bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 px-4 py-4 font-mono text-lg text-slate-900 capitalize ring-1 ring-slate-500/30"
        style={{
          gridTemplateColumns: `repeat(${variant.traits.length}, minmax(0, 1fr))`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        {attrLines
          ? attrLines.map((part, i) => {
              const isShared = sharedTraitSet.has(i);
              // Both states share padding/rounding so the bar height doesn't jump.
              return (
                <span
                  key={`${variant.traits[i]?.name ?? i}-${part}`}
                  className={
                    isShared
                      ? 'rounded-md bg-amber-300 px-2 py-1 text-center font-bold text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_0_1px_rgba(180,120,30,0.5)]'
                      : 'rounded-md px-2 py-1 text-center'
                  }
                >
                  {part}
                </span>
              );
            })
          : variant.traits.map((t) => (
              <span key={t.name} className="rounded-md px-2 py-1 text-center text-slate-500">
                –
              </span>
            ))}
      </div>
    </div>
  );
}
