'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client } from 'boardgame.io/client';
import { createQuartoGame, type QuartoState } from '@/lib/game/definition';
import { buildVariant, type VariantConfig } from '@/lib/game/variants';
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

function createClient(config: VariantConfig): ClientType {
  const variant = buildVariant(config.boardSize, config.traitIds);
  const c = Client({ game: createQuartoGame(variant), numPlayers: 2, debug: false });
  c.start();
  return c;
}

export function useQuartoClient(config: VariantConfig): QuartoClient {
  const key = buildVariant(config.boardSize, config.traitIds).id;
  const [client, setClient] = useState<ClientType>(() => createClient(config));
  const [state, setState] = useState<ClientState | null>(() => client.getState() ?? null);
  const lastKey = useRef(key);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Board size or trait selection switch = new game definition, so the client
  // is rebuilt from scratch (fresh board, fresh rack).
  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    setClient((prev) => {
      prev.stop?.();
      return createClient(configRef.current);
    });
  }, [key]);

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
      return createClient(configRef.current);
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
