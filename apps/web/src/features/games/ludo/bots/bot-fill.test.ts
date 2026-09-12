import assert from 'node:assert';
import { describe, it } from 'node:test';
import { LudoEngine } from '../engine/ludo-engine';
import type { LudoPlayer } from '../types/ludo.types';
import { addBotToFirstEmptySeat, fillEmptySeatsWithBots } from './bot-fill';

function human(seatIndex: number, color: LudoPlayer['color']): LudoPlayer {
  return {
    id: `human-${seatIndex}`,
    displayName: `Human ${seatIndex}`,
    type: 'human',
    color,
    seatIndex,
    status: 'ready',
    ready: true,
  };
}

describe('Ludo Bot Fill Tests', () => {
  describe('1. Filling empty seats', () => {
    for (const seatCount of [2, 3, 4, 6]) {
      it(`fills every empty seat for a ${seatCount}-seat game`, () => {
        const seats: (LudoPlayer | null)[] = Array.from({ length: seatCount }, () => null);
        const filled = fillEmptySeatsWithBots(seats);
        assert.strictEqual(filled.length, seatCount);
        assert.ok(filled.every((p) => p.type === 'bot'));
        assert.strictEqual(new Set(filled.map((p) => p.color)).size, seatCount);
      });
    }

    it('leaves occupied seats untouched and only fills empty ones', () => {
      const seats: (LudoPlayer | null)[] = [human(0, 'red'), null, human(2, 'yellow'), null];
      const filled = fillEmptySeatsWithBots(seats);
      assert.strictEqual(filled[0].type, 'human');
      assert.strictEqual(filled[1].type, 'bot');
      assert.strictEqual(filled[2].type, 'human');
      assert.strictEqual(filled[3].type, 'bot');
    });
  });

  describe('2. Adding a single bot', () => {
    it('fills only the first empty seat', () => {
      const seats: (LudoPlayer | null)[] = [human(0, 'red'), null, null, null];
      const next = addBotToFirstEmptySeat(seats);
      assert.strictEqual(next[1]?.type, 'bot');
      assert.strictEqual(next[2], null);
      assert.strictEqual(next[3], null);
    });

    it('returns the array unchanged when every seat is full', () => {
      const seats: (LudoPlayer | null)[] = [human(0, 'red'), human(1, 'green')];
      const next = addBotToFirstEmptySeat(seats);
      assert.strictEqual(next, seats);
    });
  });

  describe('3. Mixed human/bot games play correctly through the engine', () => {
    it('starts and plays a turn in a 4-seat game with 2 humans and 2 bots', () => {
      const seats: (LudoPlayer | null)[] = [human(0, 'red'), null, human(2, 'yellow'), null];
      const players = fillEmptySeatsWithBots(seats);
      const engine = new LudoEngine(players);
      engine.startGame(players[0].id);
      engine.rollDice(players[0].id, 6);
      assert.strictEqual(engine.getState().turnPhase, 'awaiting-move');
    });
  });
});
