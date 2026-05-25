'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { BoardGrid } from '@/components/board/board-grid';
import { PieceRack } from '@/components/board/piece-rack';
import { findWin } from '@/lib/game/win';
import { useTheme } from '@/lib/theme/context';
import type { QuartoState } from '@/lib/game/definition';
import type { Piece } from '@/lib/game/pieces';

interface ClientLike {
  G: QuartoState;
  ctx: { activePlayers?: Record<string, string> | null; currentPlayer: string };
}

interface BoardCanvasProps {
  state: ClientLike | null;
  moves: {
    selectCell: (cell: number) => void;
    selectHandoff: (piece: Piece) => void;
  };
}

export function BoardCanvas({ state, moves }: BoardCanvasProps) {
  const { lightingPreset } = useTheme();
  const board = useMemo(() => state?.G.board ?? [], [state?.G.board]);
  const available = state?.G.available ?? [];
  const pendingPlace = state?.G.pendingPlace ?? null;
  const pendingHandoff = state?.G.pendingHandoff ?? null;
  const handedPiece = state?.G.handedPiece ?? null;
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const canPlace = stage === 'place' && handedPiece !== null;
  const canPick = stage === 'pick';

  const winner = state?.G.winner;
  const winLine = useMemo(() => {
    return winner?.line ?? findWin(board)?.cells ?? null;
  }, [board, winner]);

  return (
    <Canvas camera={{ position: [0, 6.5, 6], fov: 38 }} shadows>
      <Suspense fallback={null}>
        <ambientLight intensity={lightingPreset.ambient} />
        <directionalLight
          position={lightingPreset.directionalPosition}
          intensity={lightingPreset.directional}
          castShadow
        />
        {lightingPreset.environment && <Environment preset={lightingPreset.environment} />}
        <BoardGrid
          cells={board}
          pendingPlace={pendingPlace}
          ghostPiece={handedPiece}
          winLine={winLine}
          canPlace={canPlace}
          onSelectCell={moves.selectCell}
        />
        <PieceRack
          available={available}
          pendingHandoff={pendingHandoff}
          canPick={canPick}
          onSelectPiece={moves.selectHandoff}
        />
      </Suspense>
    </Canvas>
  );
}
