import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MissionObjective, TrustPlayer } from '../types/trust-or-betray.types';
import {
  calculateTrustLevel,
  getStreakMultiplier,
  MISSION_POOL,
  resolveExileTrial,
  resolveRoundOutcomes,
  updatePlayerTrust,
} from './trust-engine';

function createDummyPlayer(id: string, overrides: Partial<TrustPlayer> = {}): TrustPlayer {
  return {
    id,
    name: `Operative ${id}`,
    avatar: '👤',
    color: '#06b6d4',
    isBot: false,
    score: 100,
    currentChoice: null,
    hasLockedIn: false,
    trustRating: 50,
    trustLevel: 'neutral',
    cooperationCount: 1,
    betrayalCount: 1,
    isExiled: false,
    exileRoundsRemaining: 0,
    votesAgainst: 0,
    ...overrides,
  };
}

const mockMission: MissionObjective = {
  id: 'test-mission',
  name: 'Test Vault',
  category: 'Test',
  description: 'Test mission description',
  basePot: 300,
  bonusMultiplier: 1.0,
};

describe('trust-engine', () => {
  describe('streak multipliers', () => {
    it('calculates correct multiplier based on streak count', () => {
      assert.strictEqual(getStreakMultiplier(0), 1.0);
      assert.strictEqual(getStreakMultiplier(1), 1.25);
      assert.strictEqual(getStreakMultiplier(2), 1.5);
      assert.strictEqual(getStreakMultiplier(5), 2.0);
    });
  });

  describe('trust ratings and levels', () => {
    it('maps ratings to correct trust levels', () => {
      assert.strictEqual(calculateTrustLevel(90), 'devoted');
      assert.strictEqual(calculateTrustLevel(70), 'loyal');
      assert.strictEqual(calculateTrustLevel(50), 'neutral');
      assert.strictEqual(calculateTrustLevel(30), 'shaky');
      assert.strictEqual(calculateTrustLevel(10), 'traitor');
    });

    it('updates player trust accurately from cooperation and betrayal counts', () => {
      const player = createDummyPlayer('p1', { cooperationCount: 3, betrayalCount: 1 });
      const trust = updatePlayerTrust(player);
      assert.strictEqual(trust.rating, 75);
      assert.strictEqual(trust.level, 'loyal');
    });
  });

  describe('resolveRoundOutcomes', () => {
    it('splits pot evenly and increments streak when all cooperate', () => {
      const p1 = createDummyPlayer('p1');
      const p2 = createDummyPlayer('p2');
      const p3 = createDummyPlayer('p3');

      const result = resolveRoundOutcomes({
        roundNumber: 1,
        mission: mockMission,
        players: [p1, p2, p3],
        choices: { p1: 'cooperate', p2: 'cooperate', p3: 'cooperate' },
        cooperationStreak: 0,
      });

      assert.strictEqual(result.outcome, 'all_cooperate');
      assert.strictEqual(result.newStreak, 1);
      assert.strictEqual(result.scoreDeltas.p1, 100);
      assert.strictEqual(result.scoreDeltas.p2, 100);
      assert.strictEqual(result.scoreDeltas.p3, 100);
    });

    it('gives full pot + 50pt bonus to lone saboteur when solo betrayal occurs', () => {
      const p1 = createDummyPlayer('p1');
      const p2 = createDummyPlayer('p2');
      const p3 = createDummyPlayer('p3');

      const result = resolveRoundOutcomes({
        roundNumber: 1,
        mission: mockMission,
        players: [p1, p2, p3],
        choices: { p1: 'betray', p2: 'cooperate', p3: 'cooperate' },
        cooperationStreak: 2,
      });

      assert.strictEqual(result.outcome, 'solo_betray');
      assert.strictEqual(result.newStreak, 0);
      assert.strictEqual(result.scoreDeltas.p1, 350); // 300 base pot + 50 bonus
      assert.strictEqual(result.scoreDeltas.p2, 0);
      assert.strictEqual(result.scoreDeltas.p3, 0);
    });

    it('annihilates pot and awards 0 points on multiple betrayal collision', () => {
      const p1 = createDummyPlayer('p1');
      const p2 = createDummyPlayer('p2');
      const p3 = createDummyPlayer('p3');

      const result = resolveRoundOutcomes({
        roundNumber: 1,
        mission: mockMission,
        players: [p1, p2, p3],
        choices: { p1: 'betray', p2: 'betray', p3: 'cooperate' },
        cooperationStreak: 3,
      });

      assert.strictEqual(result.outcome, 'failed_betray');
      assert.strictEqual(result.newStreak, 0);
      assert.strictEqual(result.scoreDeltas.p1, 0);
      assert.strictEqual(result.scoreDeltas.p2, 0);
      assert.strictEqual(result.scoreDeltas.p3, 0);
    });

    it('triggers mutual ruin when all players betray', () => {
      const p1 = createDummyPlayer('p1');
      const p2 = createDummyPlayer('p2');

      const result = resolveRoundOutcomes({
        roundNumber: 1,
        mission: mockMission,
        players: [p1, p2],
        choices: { p1: 'betray', p2: 'betray' },
        cooperationStreak: 1,
      });

      assert.strictEqual(result.outcome, 'mutual_ruin');
      assert.strictEqual(result.newStreak, 0);
      assert.strictEqual(result.scoreDeltas.p1, 0);
      assert.strictEqual(result.scoreDeltas.p2, 0);
    });
  });

  describe('resolveExileTrial', () => {
    it('exiles player who receives majority vote', () => {
      const p1 = createDummyPlayer('p1', { score: 200 });
      const p2 = createDummyPlayer('p2', { score: 200 });
      const p3 = createDummyPlayer('p3', { score: 200 });

      const trial = resolveExileTrial([p1, p2, p3], {
        p1: 'p3',
        p2: 'p3',
        p3: 'p1',
      });

      assert.strictEqual(trial.exiledPlayerId, 'p3');
      const exiledPlayer = trial.updatedPlayers.find((p) => p.id === 'p3');
      assert.strictEqual(exiledPlayer?.isExiled, true);
      assert.strictEqual(exiledPlayer?.score, 120); // 200 - 80 penalty
    });

    it('does not exile anyone on a tie', () => {
      const p1 = createDummyPlayer('p1');
      const p2 = createDummyPlayer('p2');

      const trial = resolveExileTrial([p1, p2], {
        p1: 'p2',
        p2: 'p1',
      });

      assert.strictEqual(trial.exiledPlayerId, null);
    });
  });

  describe('MISSION_POOL', () => {
    it('has at least 5 distinct missions', () => {
      assert.ok(MISSION_POOL.length >= 5);
      MISSION_POOL.forEach((m) => {
        assert.ok(m.id.length > 0);
        assert.ok(m.name.length > 0);
        assert.ok(m.basePot > 0);
      });
    });
  });
});
