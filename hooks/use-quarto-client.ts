'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Client } from 'boardgame.io/client';
import { Quarto, type QuartoState } from '@/lib/game/definition';
import type { Piece } from '@/lib/game/pieces';

interface QuartoMoves {
  selectCell: (cell: number) => void;
  clearPendingPlace: () => void;
  confirmPlace: () => void;
  selectHandoff: (piece: Piece) => void;
  clearPendingHandoff: () => void;
  confirmHandoff: () => void;
  callQuarto: () => void;
}

type ClientType = ReturnType<typeof Client<QuartoState>>;
type ClientState = NonNullable<ReturnType<ClientType['getState']>>;

export interface QuartoClient {
  state: ClientState | null;
  moves: QuartoMoves;
  restart: () => void;
}

function createClient(): ClientType {
  const c = Client({ game: Quarto, numPlayers: 2 });
  c.start();
  return c;
}

export function useQuartoClient(): QuartoClient {
  const [client, setClient] = useState<ClientType>(() => createClient());
  const [state, setState] = useState<ClientState | null>(() => client.getState() ?? null);

  useEffect(() => {
    const unsubscribe = client.subscribe(() => {
      setState(client.getState() ?? null);
    });
    return () => unsubscribe?.();
  }, [client]);

  const restart = useCallback(() => {
    setClient((prev) => {
      prev.stop?.();
      return createClient();
    });
  }, []);

  const moves = useMemo<QuartoMoves>(() => {
    const m = client.moves as Record<string, (...args: unknown[]) => void>;
    return {
      selectCell: (cell) => m.selectCell?.(cell),
      clearPendingPlace: () => m.clearPendingPlace?.(),
      confirmPlace: () => m.confirmPlace?.(),
      selectHandoff: (piece) => m.selectHandoff?.(piece),
      clearPendingHandoff: () => m.clearPendingHandoff?.(),
      confirmHandoff: () => m.confirmHandoff?.(),
      callQuarto: () => m.callQuarto?.(),
    };
  }, [client]);

  return { state, moves, restart };
}
