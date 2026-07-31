import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { createQuartoGame, Quarto } from './definition';
import { getVariant } from './variants';

function newClient(variantId?: string) {
  const game = variantId ? createQuartoGame(getVariant(variantId)) : Quarto;
  const client = Client({ game, numPlayers: 2 });
  client.start();
  const m = client.moves as Record<string, (...args: unknown[]) => void>;
  return { client, m };
}

describe('Quarto game definition', () => {
  it('starts in pick stage for player 0 with all 16 pieces available', () => {
    const { client } = newClient();
    const state = client.getState();
    expect(state?.G.available.length).toBe(16);
    expect(state?.G.handedPiece).toBeNull();
    expect(state?.ctx.currentPlayer).toBe('0');
    expect(state?.ctx.activePlayers?.['0']).toBe('pick');
    client.stop();
  });

  it('rejects confirmHandoff without a pendingHandoff', () => {
    const { client, m } = newClient();
    m.confirmHandoff?.();
    const state = client.getState();
    expect(state?.G.handedPiece).toBeNull();
    client.stop();
  });

  it('player 0 hands a piece, turn advances to player 1 in place stage', () => {
    const { client, m } = newClient();
    m.selectHandoff?.(0b0001);
    m.confirmHandoff?.();
    const state = client.getState();
    expect(state?.G.available.length).toBe(15);
    expect(state?.G.handedPiece).toBe(0b0001);
    expect(state?.ctx.currentPlayer).toBe('1');
    expect(state?.ctx.activePlayers?.['1']).toBe('place');
    client.stop();
  });

  it('place + handoff cycle alternates players', () => {
    const { client, m } = newClient();
    m.selectHandoff?.(0b0000);
    m.confirmHandoff?.();
    m.selectCell?.(5);
    m.confirmPlace?.();
    let state = client.getState();
    expect(state?.G.board[5]).toBe(0b0000);
    expect(state?.G.handedPiece).toBeNull();
    expect(state?.ctx.activePlayers?.['1']).toBe('pick');
    m.selectHandoff?.(0b0011);
    m.confirmHandoff?.();
    state = client.getState();
    expect(state?.ctx.currentPlayer).toBe('0');
    expect(state?.G.handedPiece).toBe(0b0011);
    client.stop();
  });

  it('callQuarto wins for the caller when a winning line exists', () => {
    const { client, m } = newClient();
    const handTo = (piece: number) => {
      m.selectHandoff?.(piece);
      m.confirmHandoff?.();
    };
    const placeAt = (cell: number) => {
      m.selectCell?.(cell);
      m.confirmPlace?.();
    };
    handTo(0b0001);
    placeAt(0);
    handTo(0b0011);
    placeAt(1);
    handTo(0b0101);
    placeAt(2);
    handTo(0b0111);
    placeAt(3);
    m.callQuarto?.();
    const state = client.getState();
    expect(state?.G.winner).not.toBeNull();
    expect(state?.G.winner?.player).toBe('0');
    expect(state?.G.winner?.line).toEqual([0, 1, 2, 3]);
    expect(state?.ctx.gameover).toBeDefined();
    client.stop();
  });

  it('callQuarto with no win on the board is a no-op (game continues)', () => {
    const { client, m } = newClient();
    m.selectHandoff?.(0b0000);
    m.confirmHandoff?.();
    m.selectCell?.(5);
    m.confirmPlace?.();
    m.callQuarto?.();
    const state = client.getState();
    expect(state?.G.winner).toBeNull();
    expect(state?.ctx.gameover).toBeUndefined();
    client.stop();
  });

  it('flagFall on the opening turn aborts with no result', () => {
    const { client, m } = newClient();
    m.flagFall?.();
    const state = client.getState();
    expect(state?.G.aborted).toBe(true);
    expect(state?.G.timeoutLoser).toBeNull();
    expect(state?.G.winner).toBeNull();
    expect(state?.ctx.gameover).toEqual({ aborted: true });
    client.stop();
  });

  it('flagFall after a move is a loss for the player on the clock', () => {
    const { client, m } = newClient();
    m.selectHandoff?.(0b0001);
    m.confirmHandoff?.();
    m.flagFall?.();
    const state = client.getState();
    expect(state?.G.timeoutLoser).toBe('1');
    expect(state?.G.aborted).toBe(false);
    expect(state?.ctx.gameover).toEqual({ winner: '0' });
    client.stop();
  });

  it('stamps the variant id into game state', () => {
    const { client } = newClient('hexa');
    const state = client.getState();
    expect(state?.G.variantId).toBe('hexa');
    expect(state?.G.board.length).toBe(36);
    expect(state?.G.available.length).toBe(36);
    client.stop();
  });

  it('duo variant: a 2-in-a-line sharing a trait wins', () => {
    const { client, m } = newClient('duo');
    m.selectHandoff?.(0); // round light → P1
    m.confirmHandoff?.();
    m.selectCell?.(0);
    m.confirmPlace?.();
    m.selectHandoff?.(1); // square light → P0
    m.confirmHandoff?.();
    m.selectCell?.(1);
    m.confirmPlace?.();
    m.callQuarto?.();
    const state = client.getState();
    expect(state?.G.winner?.player).toBe('0');
    expect(state?.G.winner?.line).toEqual([0, 1]);
    expect(state?.G.winner?.shared).toContainEqual({ trait: 1, value: 0 });
    client.stop();
  });

  it('trio variant: exhausting the 8-piece rack on the 9-cell board is a draw', () => {
    const { client, m } = newClient('trio');
    const play = (piece: number, cell: number) => {
      m.selectHandoff?.(piece);
      m.confirmHandoff?.();
      m.selectCell?.(cell);
      m.confirmPlace?.();
    };
    // Center (cell 4) stays empty, so only row 0, row 2, col 0, col 2 ever
    // complete — and each is arranged to share no trait value.
    play(0b000, 0);
    play(0b011, 1);
    play(0b101, 2);
    play(0b111, 3);
    play(0b100, 5);
    play(0b110, 6);
    play(0b001, 7);
    play(0b010, 8);
    const state = client.getState();
    expect(state?.G.winner).toBeNull();
    expect(state?.G.draw).toBe(true);
    expect(state?.G.available.length).toBe(0);
    expect(state?.G.board[4]).toBeNull();
    expect(state?.ctx.gameover).toEqual({ draw: true });
    client.stop();
  });
});
