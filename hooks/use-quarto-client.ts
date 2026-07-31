'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client } from 'boardgame.io/client';
import { createQuartoGame, type QuartoState } from '@/lib/game/definition';
import { getVariant } from '@/lib/game/variants';
import type { Piece } from '@/lib/game/pieces';

interface QuartoMoves {
  selectCell: (cell: number) => void;
  clearPendingPlace: () => void;
  confirmPlace: () => void;
  selectHandoff: (piece: Piece) => void;
  clearPendingHandoff: () => void;
  confirmHandoff: () => void;
  callQuarto: () => void;
  flagFall: () => void;
}

type ClientType = ReturnType<typeof Client<QuartoState>>;
type ClientState = NonNullable<ReturnType<ClientType['getState']>>;

export interface QuartoClient {
  state: ClientState | null;
  moves: QuartoMoves;
  restart: () => void;
}

function createClient(variantId: string): ClientType {
  const c = Client({ game: createQuartoGame(getVariant(variantId)), numPlayers: 2, debug: false });
  c.start();
  return c;
}

export function useQuartoClient(variantId: string): QuartoClient {
  const [client, setClient] = useState<ClientType>(() => createClient(variantId));
  const [state, setState] = useState<ClientState | null>(() => client.getState() ?? null);
  const lastVariantId = useRef(variantId);

  // Variant switch = new game definition, so the client is rebuilt from
  // scratch (fresh board, fresh rack).
  useEffect(() => {
    if (lastVariantId.current === variantId) return;
    lastVariantId.current = variantId;
    setClient((prev) => {
      prev.stop?.();
      return createClient(variantId);
    });
  }, [variantId]);

  useEffect(() => {
    // boardgame.io invokes the callback immediately on subscribe for local
    // games, so a rebuilt client pushes its fresh state right away.
    const unsubscribe = client.subscribe(() => {
      setState(client.getState() ?? null);
    });
    return () => unsubscribe?.();
  }, [client]);

  const restart = useCallback(() => {
    setClient((prev) => {
      prev.stop?.();
      return createClient(lastVariantId.current);
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
      flagFall: () => m.flagFall?.(),
    };
  }, [client]);

  return { state, moves, restart };
}
