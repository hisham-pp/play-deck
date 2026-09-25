import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  castLine,
  chooseFishForCast,
  completeCatch,
  createInitialFishingState,
  FISHING_LOCATIONS,
  hookFish,
  MATCH_EVENTS,
  setReeling,
  stepFishingMatch,
} from './fishing-competition-engine';

describe('Fishing Competition Engine', () => {
  describe('Match Initialization', () => {
    it('initializes match with custom location, players, and duration', () => {
      const state = createInitialFishingState({
        locationId: 'river',
        playerCount: 3,
        matchDuration: 60,
      });

      assert.equal(state.location.id, 'river');
      assert.equal(state.players.length, 3);
      assert.equal(state.players[0].isBot, false);
      assert.equal(state.players[1].isBot, true);
      assert.equal(state.timeRemainingSeconds, 60);
      assert.equal(state.isGameOver, false);
      assert.equal(state.players[0].status, 'idle');
    });

    it('defaults to Lake with 4 players and 90 seconds', () => {
      const state = createInitialFishingState();
      assert.equal(state.location.id, 'lake');
      assert.equal(state.players.length, 4);
      assert.equal(state.matchDurationSeconds, 90);
    });
  });

  describe('Casting & Fish Selection', () => {
    it('selects fish that belong to the active location pool', () => {
      const oceanLoc = FISHING_LOCATIONS.ocean;
      for (let i = 0; i < 20; i++) {
        const fish = chooseFishForCast(oceanLoc, MATCH_EVENTS[0], 75);
        assert.ok(fish.locations.includes('ocean'));
      }
    });

    it('executes line cast and transitions to waiting_for_bite', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];

      const res = castLine(state, p1.id, 85);
      assert.equal(res.success, true);
      assert.equal(p1.status, 'waiting_for_bite');
      assert.equal(p1.castPower, 85);
      assert.ok(p1.targetFish !== null);
      assert.ok(p1.biteTimer > 0);

      // Cannot cast again while line is active
      const secondCast = castLine(state, p1.id, 90);
      assert.equal(secondCast.success, false);
    });
  });

  describe('Bite, Hooking & Reeling Mechanics', () => {
    it('requires bite_active status to hook fish', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];

      castLine(state, p1.id, 50);
      assert.equal(p1.status, 'waiting_for_bite');

      // Hooking prematurely fails
      const earlyHook = hookFish(p1);
      assert.equal(earlyHook.success, false);

      // Advance timer until bite triggers
      p1.status = 'bite_active';
      const validHook = hookFish(p1);
      assert.equal(validHook.success, true);
      assert.equal(p1.status, 'reeling');
      assert.equal(p1.reelDistance, 100);
      assert.equal(p1.lineTension, 50);
    });

    it('updates reelDistance and lineTension during reeling', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];
      castLine(state, p1.id, 60);
      p1.status = 'reeling';

      // Start reeling
      setReeling(p1, true);
      assert.equal(p1.isReeling, true);

      // Step physics
      stepFishingMatch(state, 0.5);
      assert.ok(p1.reelDistance < 100, 'Reel distance should decrease');
      assert.ok(p1.lineTension > 50, 'Line tension should increase when reeling');
    });

    it('successfully completes catch when reel distance reaches 0', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];
      castLine(state, p1.id, 80);
      p1.status = 'reeling';
      p1.reelDistance = 2;
      setReeling(p1, true);

      stepFishingMatch(state, 0.2);
      assert.equal(p1.status, 'celebrating_catch');
      assert.equal(p1.catches.length, 1);
      assert.ok(p1.score > 0);
    });

    it('applies double points when double_score event is active', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];
      const fixedFish = {
        id: 'test-fish',
        name: 'Test Trout',
        rarity: 'common' as const,
        baseWeightKg: 1.0,
        weightVariance: 0,
        basePoints: 200,
        icon: '🐟',
        fightSpeed: 1.0,
        biteDelaySeconds: [2, 4] as [number, number],
        locations: ['lake' as const],
      };

      state.activeEvent = MATCH_EVENTS[0]; // normal
      const normalCatch = completeCatch(state, p1, fixedFish);

      state.activeEvent = {
        id: 'double_score',
        name: 'Double Points Frenzy',
        description: '2x',
        durationSeconds: 20,
      };
      const doubleCatch = completeCatch(state, p1, fixedFish);
      assert.equal(doubleCatch.points, normalCatch.points * 2);
    });

    it('transitions back to idle after celebratory catch delay', () => {
      const state = createInitialFishingState();
      const p1 = state.players[0];
      p1.status = 'celebrating_catch';
      p1.resetTimer = 2.0;

      stepFishingMatch(state, 2.1);
      assert.equal(p1.status, 'idle');
    });
  });

  describe('Match Timing & Game Over', () => {
    it('concludes match when time expires', () => {
      const state = createInitialFishingState({ matchDuration: 10 });
      assert.equal(state.isGameOver, false);

      stepFishingMatch(state, 11);
      assert.equal(state.isGameOver, true);
      assert.equal(state.timeRemainingSeconds, 0);
    });
  });
});
