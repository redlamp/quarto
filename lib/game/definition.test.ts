import { describe, it, expect } from 'vitest';
import { Client } from 'boardgame.io/client';
import { Quarto } from './definition';

function newClient() {
  const client = Client({ game: Quarto, numPlayers: 2 });
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
});
