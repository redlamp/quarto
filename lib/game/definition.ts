import type { Game, Move } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { ALL_PIECES, type Piece } from './pieces';
import { findWin, isBoardFull, type Cell, type LineIndices } from './win';

export type PlayerID = '0' | '1';

export interface QuartoWinner {
  player: PlayerID;
  line: LineIndices;
  sharedMask: number;
}

export interface QuartoState {
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

const initialState = (): QuartoState => ({
  board: Array.from({ length: 16 }, () => null),
  available: ALL_PIECES.slice(),
  handedPiece: null,
  pendingPlace: null,
  pendingHandoff: null,
  winner: null,
  draw: false,
  timeoutLoser: null,
  aborted: false,
});

interface MoveCtx {
  G: QuartoState;
  ctx: { currentPlayer: string };
  events: {
    setStage: (stage: string) => void;
    endTurn: () => void;
    endGame: () => void;
  };
}

const selectCell: Move<QuartoState> = ({ G }, cell: number) => {
  if (G.winner !== null || G.draw) return INVALID_MOVE;
  if (G.handedPiece === null) return INVALID_MOVE;
  if (cell < 0 || cell >= 16) return INVALID_MOVE;
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
  // Draw if board full and nobody calls Quarto by end of pick phase.
  if (isBoardFull(G.board) && findWin(G.board) === null) {
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
  const win = findWin(G.board);
  if (win === null) return INVALID_MOVE;
  G.winner = {
    player: gameCtx.currentPlayer as PlayerID,
    line: win.cells,
    sharedMask: win.sharedMask,
  };
  events.endGame();
};

const flagFall: Move<QuartoState> = (ctx) => {
  const { G, ctx: gameCtx, events } = ctx as unknown as MoveCtx;
  if (G.winner !== null || G.draw || G.timeoutLoser !== null || G.aborted) return INVALID_MOVE;
  const anyProgress =
    G.handedPiece !== null || G.available.length < 16 || G.board.some((c) => c !== null);
  // Running out before either side commits a move voids the game (PRD: first-
  // move timeout = abort). Otherwise the player on the clock loses.
  if (!anyProgress) G.aborted = true;
  else G.timeoutLoser = gameCtx.currentPlayer as PlayerID;
  events.endGame();
};

export const Quarto: Game<QuartoState> = {
  name: 'quarto',
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
