import type { Game, Move } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Piece } from './pieces';
import {
  buildVariant,
  piecesOf,
  type SharedTrait,
  type VariantConfig,
  type VariantDef,
} from './variants';
import { findWin, isBoardFull, type Cell } from './win';

export type PlayerID = '0' | '1';

export interface QuartoWinner {
  player: PlayerID;
  line: readonly number[];
  shared: readonly SharedTrait[];
}

export interface QuartoState {
  variant: VariantConfig;
  board: Cell[];
  available: Piece[];
  handedPiece: Piece | null;
  pendingPlace: number | null;
  pendingHandoff: Piece | null;
  winner: QuartoWinner | null;
  draw: boolean;
  // Player who ran out of time (their opponent wins). Null unless a flag fell.
  timeoutLoser: PlayerID | null;
  // Flag fell before either player committed a move — voided, no result.
  aborted: boolean;
}

export const STAGES = {
  place: 'place',
  pick: 'pick',
} as const;

interface MoveCtx {
  G: QuartoState;
  ctx: { currentPlayer: string };
  events: {
    setStage: (stage: string) => void;
    endTurn: () => void;
    endGame: () => void;
  };
}

export function createQuartoGame(variant: VariantDef): Game<QuartoState> {
  const cellCount = variant.boardSize * variant.boardSize;

  const initialState = (): QuartoState => ({
    variant: variant.config,
    board: Array.from({ length: cellCount }, () => null),
    available: piecesOf(variant).slice(),
    handedPiece: null,
    pendingPlace: null,
    pendingHandoff: null,
    winner: null,
    draw: false,
    timeoutLoser: null,
    aborted: false,
  });

  const selectCell: Move<QuartoState> = ({ G }, cell: number) => {
    if (G.winner !== null || G.draw) return INVALID_MOVE;
    if (G.handedPiece === null) return INVALID_MOVE;
    if (cell < 0 || cell >= cellCount) return INVALID_MOVE;
    if (G.board[cell] !== null) return INVALID_MOVE;
    G.pendingPlace = cell;
  };

  const clearPendingPlace: Move<QuartoState> = ({ G }) => {
    G.pendingPlace = null;
  };

  const confirmPlace: Move<QuartoState> = (ctx) => {
    const { G, events } = ctx as unknown as MoveCtx;
    if (G.winner !== null || G.draw) return INVALID_MOVE;
    if (G.handedPiece === null) return INVALID_MOVE;
    if (G.pendingPlace === null) return INVALID_MOVE;
    const cell = G.pendingPlace;
    if (G.board[cell] !== null) return INVALID_MOVE;
    G.board[cell] = G.handedPiece;
    G.handedPiece = null;
    G.pendingPlace = null;
    // Draw when no win is on the board and the game can't continue — board
    // full, or the rack is exhausted (trio runs 8 pieces on 9 cells).
    if (findWin(G.board, variant) === null && (isBoardFull(G.board) || G.available.length === 0)) {
      G.draw = true;
      events.endGame();
      return;
    }
    events.setStage(STAGES.pick);
  };

  const selectHandoff: Move<QuartoState> = ({ G }, piece: Piece) => {
    if (G.winner !== null || G.draw) return INVALID_MOVE;
    if (!G.available.includes(piece)) return INVALID_MOVE;
    G.pendingHandoff = piece;
  };

  const clearPendingHandoff: Move<QuartoState> = ({ G }) => {
    G.pendingHandoff = null;
  };

  const confirmHandoff: Move<QuartoState> = (ctx) => {
    const { G, events } = ctx as unknown as MoveCtx;
    if (G.winner !== null || G.draw) return INVALID_MOVE;
    if (G.pendingHandoff === null) return INVALID_MOVE;
    const piece = G.pendingHandoff;
    const idx = G.available.indexOf(piece);
    if (idx < 0) return INVALID_MOVE;
    G.available.splice(idx, 1);
    G.handedPiece = piece;
    G.pendingHandoff = null;
    events.endTurn();
  };

  const callQuarto: Move<QuartoState> = (ctx) => {
    const { G, ctx: gameCtx, events } = ctx as unknown as MoveCtx;
    if (G.winner !== null || G.draw) return INVALID_MOVE;
    const win = findWin(G.board, variant);
    if (win === null) return INVALID_MOVE;
    G.winner = {
      player: gameCtx.currentPlayer as PlayerID,
      line: win.cells,
      shared: win.shared,
    };
    events.endGame();
  };

  const flagFall: Move<QuartoState> = (ctx) => {
    const { G, ctx: gameCtx, events } = ctx as unknown as MoveCtx;
    if (G.winner !== null || G.draw || G.timeoutLoser !== null || G.aborted) return INVALID_MOVE;
    const anyProgress =
      G.handedPiece !== null ||
      G.available.length < variant.pieceCount ||
      G.board.some((c) => c !== null);
    // Running out before either side commits a move voids the game (PRD: first-
    // move timeout = abort). Otherwise the player on the clock loses.
    if (!anyProgress) G.aborted = true;
    else G.timeoutLoser = gameCtx.currentPlayer as PlayerID;
    events.endGame();
  };

  return {
    name: `quarto-${variant.id}`,
    setup: initialState,
    turn: {
      activePlayers: { currentPlayer: STAGES.pick },
      stages: {
        [STAGES.place]: {
          moves: { selectCell, clearPendingPlace, confirmPlace, callQuarto, flagFall },
        },
        [STAGES.pick]: {
          moves: { selectHandoff, clearPendingHandoff, confirmHandoff, callQuarto, flagFall },
        },
      },
      onBegin: ({ G, events }) => {
        // First turn of the game: player 0 has nothing to place — start in pick.
        // Subsequent turns: start in place (player received a handed piece).
        if (G.handedPiece === null) {
          events.setActivePlayers?.({ currentPlayer: STAGES.pick });
        } else {
          events.setActivePlayers?.({ currentPlayer: STAGES.place });
        }
      },
    },
    endIf: ({ G }) => {
      if (G.winner !== null) return { winner: G.winner.player };
      if (G.timeoutLoser !== null) return { winner: G.timeoutLoser === '0' ? '1' : '0' };
      if (G.aborted) return { aborted: true };
      if (G.draw) return { draw: true };
    },
    minPlayers: 2,
    maxPlayers: 2,
  };
}

// Canonical 4×4 game — default variant.
export const Quarto: Game<QuartoState> = createQuartoGame(buildVariant(4));
