import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { LudoPlayer } from '../types/ludo.types';
import { createInitialLudoState } from './ludo-state';
import { advanceTurn, grantExtraTurn, nextActiveSeatIndex, registerRoll } from './turns';

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

describe('Ludo Turn Progression Tests', () => {
  describe('1. Consecutive sixes', () => {
    it('increments the streak on each six and resets on a non-six', () => {
      const state = createInitialLudoState(makePlayers(4));
      const r1 = registerRoll(state, 0, 6);
      assert.strictEqual(r1.state.players[0].consecutiveSixes, 1);
      assert.strictEqual(r1.forcedPass, false);

      const r2 = registerRoll(r1.state, 0, 6);
      assert.strictEqual(r2.state.players[0].consecutiveSixes, 2);
      assert.strictEqual(r2.forcedPass, false);

      const r3 = registerRoll(r2.state, 0, 6);
      // default maxConsecutiveSixes = 3
      assert.strictEqual(r3.forcedPass, true);
      assert.strictEqual(r3.state.players[0].consecutiveSixes, 0);

      const r4 = registerRoll(state, 0, 4);
      assert.strictEqual(r4.state.players[0].consecutiveSixes, 0);
      assert.strictEqual(r4.forcedPass, false);
    });
  });

  describe('2. Seat advancement skips finished players', () => {
    it('finds the next unfinished seat, wrapping around', () => {
      let state = createInitialLudoState(makePlayers(4));
      state = {
        ...state,
        players: state.players.map((p) => (p.seatIndex === 1 ? { ...p, finished: true } : p)),
      };
      assert.strictEqual(nextActiveSeatIndex(state, 0), 2);
      assert.strictEqual(nextActiveSeatIndex(state, 3), 0);
    });
  });

  describe('3. advanceTurn / grantExtraTurn', () => {
    it('advanceTurn moves to the next seat and resets dice/phase', () => {
      const state = createInitialLudoState(makePlayers(4));
      const next = advanceTurn(state, 0);
      assert.strictEqual(next.currentTurnSeatIndex, 1);
      assert.strictEqual(next.dice.value, null);
      assert.strictEqual(next.turnPhase, 'awaiting-roll');
    });

    it('grantExtraTurn keeps the same seat', () => {
      const state = createInitialLudoState(makePlayers(4));
      const next = grantExtraTurn(state, 0);
      assert.strictEqual(next.currentTurnSeatIndex, 0);
      assert.strictEqual(next.turnPhase, 'awaiting-roll');
    });
  });
});
