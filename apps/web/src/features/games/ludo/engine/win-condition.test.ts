import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createInitialLudoState } from './ludo-state';
import { checkGameCompletion, checkPlayerFinished } from './win-condition';
import type { LudoPlayer } from '../types/ludo.types';

function makePlayers(count: number): LudoPlayer[] {
  const colors: LudoPlayer['color'][] = ['red', 'green', 'yellow', 'blue', 'purple', 'cyan'];
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    displayName: `Player ${i}`,
    type: 'human' as const,
    color: colors[i],
    seatIndex: i,
    status: 'ready' as const,
    ready: true,
  }));
}

function withAllPiecesHome(state: ReturnType<typeof createInitialLudoState>, seatIndex: number) {
  return {
    ...state,
    players: state.players.map((p) =>
      p.seatIndex === seatIndex
        ? { ...p, pieces: p.pieces.map((piece) => ({ ...piece, location: 'home' as const, steps: 59 })) }
        : p,
    ),
  };
}

describe('Ludo Win Condition Tests', () => {
  describe('1. Single player finishing', () => {
    it('marks a player finished once all 4 pieces reach home', () => {
      let state = createInitialLudoState(makePlayers(4));
      state = withAllPiecesHome(state, 0);
      state = checkPlayerFinished(state, 0);

      assert.strictEqual(state.players[0].finished, true);
      assert.strictEqual(state.players[0].finishRank, 1);
      assert.deepStrictEqual(state.winnerOrder, ['player-0']);
    });

    it('does not mark a player finished with pieces still in play', () => {
      const state = createInitialLudoState(makePlayers(4));
      const next = checkPlayerFinished(state, 0);
      assert.strictEqual(next.players[0].finished, false);
      assert.strictEqual(next, state);
    });
  });

  describe('2. Full ranking order across player counts', () => {
    for (const count of [3, 4, 6]) {
      it(`ranks all ${count} players as they finish one by one`, () => {
        let state = createInitialLudoState(makePlayers(count));
        for (let seat = 0; seat < count - 1; seat++) {
          state = withAllPiecesHome(state, seat);
          state = checkPlayerFinished(state, seat);
          state = checkGameCompletion(state);
        }
        // Game completes once only one player remains (default rule).
        assert.strictEqual(state.status, 'completed');
        assert.strictEqual(state.winnerOrder.length, count);
        assert.strictEqual(new Set(state.winnerOrder).size, count);
        const last = state.players.find((p) => p.finishRank === count);
        assert.ok(last);
      });
    }
  });

  describe('3. Game completion', () => {
    it('stays in progress while 2+ players remain unfinished', () => {
      let state = createInitialLudoState(makePlayers(4));
      state = withAllPiecesHome(state, 0);
      state = checkPlayerFinished(state, 0);
      state = checkGameCompletion(state);
      assert.notStrictEqual(state.status, 'completed');
    });

    it('completes immediately in a 2-player game once one player finishes', () => {
      let state = createInitialLudoState(makePlayers(2));
      state = withAllPiecesHome(state, 0);
      state = checkPlayerFinished(state, 0);
      state = checkGameCompletion(state);
      assert.strictEqual(state.status, 'completed');
      assert.deepStrictEqual(state.winnerOrder, ['player-0', 'player-1']);
    });
  });
});
