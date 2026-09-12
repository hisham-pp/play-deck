import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createInitialLudoState } from './ludo-state';
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

describe('Ludo Initial State Tests', () => {
  describe('1. Player counts', () => {
    for (const count of [2, 3, 4, 5, 6]) {
      it(`builds a valid state for ${count} players`, () => {
        const state = createInitialLudoState(makePlayers(count));
        assert.strictEqual(state.players.length, count);
        assert.strictEqual(state.status, 'waiting');
        assert.strictEqual(state.currentTurnSeatIndex, 0);
        assert.strictEqual(state.dice.value, null);
        assert.strictEqual(state.winnerOrder.length, 0);
        assert.strictEqual(state.actionLog.length, 0);
      });
    }
  });

  describe('2. Piece initialization', () => {
    it('gives every player exactly 4 pieces, all starting in base', () => {
      const state = createInitialLudoState(makePlayers(4));
      for (const player of state.players) {
        assert.strictEqual(player.pieces.length, 4);
        for (const piece of player.pieces) {
          assert.strictEqual(piece.location, 'base');
          assert.strictEqual(piece.steps, 0);
        }
        assert.strictEqual(player.finished, false);
        assert.strictEqual(player.finishRank, null);
        assert.strictEqual(player.consecutiveSixes, 0);
      }
    });
  });

  describe('3. Layout selection', () => {
    it('selects classic4 for <=4 players and extended6 for >=5', () => {
      assert.strictEqual(createInitialLudoState(makePlayers(4)).layout, 'classic4');
      assert.strictEqual(createInitialLudoState(makePlayers(5)).layout, 'extended6');
      assert.strictEqual(createInitialLudoState(makePlayers(6)).layout, 'extended6');
    });
  });

  describe('4. Serialization', () => {
    it('round-trips through JSON without losing data', () => {
      const state = createInitialLudoState(makePlayers(4));
      const roundTripped = JSON.parse(JSON.stringify(state));
      assert.deepStrictEqual(roundTripped, state);
    });
  });
});
