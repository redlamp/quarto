'use client';

import { useEffect, useRef } from 'react';
import type { Piece } from '@/lib/game/pieces';
import type { QuartoState } from '@/lib/game/definition';
import type { BotInput, BotMove } from '@/lib/ai/types';
import { decideRandom } from '@/lib/ai/random';

interface ClientLike {
  G: QuartoState;
  ctx: {
    activePlayers?: Record<string, string> | null;
    currentPlayer: string;
    gameover?: unknown;
  };
}

interface OpponentMoves {
  selectCell: (cell: number) => void;
  confirmPlace: () => void;
  selectHandoff: (piece: Piece) => void;
  confirmHandoff: () => void;
  callQuarto: () => void;
}

interface UseAiOpponentOptions {
  state: ClientLike | null;
  moves: OpponentMoves;
  enabled: boolean;
  aiPlayerID?: string;
  thinkMs?: number;
}

interface WorkerRequest {
  id: number;
  input: BotInput;
}

interface WorkerResponse {
  id: number;
  move: BotMove;
}

function createWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  try {
    return new Worker(new URL('../workers/ai.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

export function useAiOpponent({
  state,
  moves,
  enabled,
  aiPlayerID = '1',
  thinkMs = 600,
}: UseAiOpponentOptions): void {
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef<number | null>(null);
  const requestSeqRef = useRef(0);
  const inFlightRef = useRef(false);

  // Spin up worker once (or fall back to inline compute).
  useEffect(() => {
    workerRef.current = createWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Apply move on response.
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    const handleMessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.id !== pendingIdRef.current) return;
      applyMove(e.data.move, moves);
      inFlightRef.current = false;
      pendingIdRef.current = null;
    };
    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, [moves]);

  // Watch state — when it's AI's turn, dispatch.
  useEffect(() => {
    if (!enabled) return;
    if (!state) return;
    if (state.ctx.gameover) return;
    if (state.ctx.currentPlayer !== aiPlayerID) return;
    if (inFlightRef.current) return;

    const stage = state.ctx.activePlayers?.[aiPlayerID];
    if (stage !== 'pick' && stage !== 'place') return;

    const input: BotInput = { G: deepClone(state.G), stage };
    const id = ++requestSeqRef.current;
    pendingIdRef.current = id;
    inFlightRef.current = true;

    const dispatch = () => {
      // Worker path
      if (workerRef.current) {
        const req: WorkerRequest = { id, input };
        workerRef.current.postMessage(req);
      } else {
        // Fallback inline.
        const move = decideRandom(input);
        applyMove(move, moves);
        inFlightRef.current = false;
        pendingIdRef.current = null;
      }
    };

    const handle = window.setTimeout(dispatch, thinkMs);
    return () => {
      window.clearTimeout(handle);
      inFlightRef.current = false;
      pendingIdRef.current = null;
    };
  }, [enabled, state, moves, aiPlayerID, thinkMs]);
}

function applyMove(move: BotMove, moves: OpponentMoves): void {
  if (move.kind === 'callQuarto') {
    moves.callQuarto();
    return;
  }
  if (move.kind === 'place') {
    moves.selectCell(move.cell);
    moves.confirmPlace();
    return;
  }
  if (move.kind === 'pick') {
    moves.selectHandoff(move.piece);
    moves.confirmHandoff();
    return;
  }
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}
