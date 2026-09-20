import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  ContributionCard,
  SaboteurPlayer,
  SectorMission,
} from '../types/secret-saboteur.types';
import {
  assignRoles,
  checkWinCondition,
  generateHand,
  resolveRound,
  resolveTrialVote,
  SECTOR_MISSIONS,
} from './saboteur-engine';

function createDummyPlayer(id: string, overrides: Partial<SaboteurPlayer> = {}): SaboteurPlayer {
  return {
    id,
    name: `Operative ${id}`,
    avatar: '👤',
    color: '#06b6d4',
    isBot: false,
    role: 'worker',
    hand: [],
    selectedCard: null,
    hasLockedIn: false,
    isDetained: false,
    suspicionScore: 0,
    votesAgainst: 0,
    ...overrides,
  };
}

const DUMMY_SECTOR: SectorMission = SECTOR_MISSIONS[0];

describe('saboteur-engine', () => {
  describe('SECTOR_MISSIONS', () => {
    it('has at least 4 sector missions', () => {
      assert.ok(SECTOR_MISSIONS.length >= 4);
    });

    it('each mission has required fields', () => {
      for (const s of SECTOR_MISSIONS) {
        assert.ok(typeof s.id === 'string');
        assert.ok(typeof s.name === 'string');
        assert.ok(typeof s.description === 'string');
      }
    });
  });

  describe('generateHand', () => {
    it('generates 5 cards for a worker', () => {
      const hand = generateHand(false);
      assert.strictEqual(hand.length, 5);
    });

    it('generates 5 cards for a saboteur', () => {
      const hand = generateHand(true);
      assert.strictEqual(hand.length, 5);
    });

    it('worker hand has no sabotage cards', () => {
      const hand = generateHand(false);
      assert.ok(hand.every((c) => !c.isSabotage));
    });

    it('saboteur hand has sabotage cards', () => {
      const hand = generateHand(true);
      assert.ok(hand.some((c) => c.isSabotage));
    });
  });

  describe('assignRoles', () => {
    it('assigns exactly one saboteur from a list of players', () => {
      const ids = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const { saboteurId } = assignRoles(ids, false);
      assert.ok(ids.includes(saboteurId));
    });

    it('assigns no inspector when includeInspector is false', () => {
      const ids = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const { inspectorId } = assignRoles(ids, false);
      assert.strictEqual(inspectorId, null);
    });

    it('assigns an inspector when includeInspector is true and 5+ players', () => {
      const ids = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const { saboteurId, inspectorId } = assignRoles(ids, true);
      assert.ok(inspectorId !== null);
      assert.notStrictEqual(saboteurId, inspectorId);
    });
  });

  describe('resolveRound', () => {
    function makeCard(powerDelta: number, isSabotage = false): ContributionCard {
      return {
        id: `card-${powerDelta}`,
        title: `Card ${powerDelta}`,
        type: isSabotage ? 'fault' : 'repair',
        powerDelta,
        isSabotage,
        description: '',
        icon: '⚡',
      };
    }

    it('increases reactor progress with positive contributions', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2')];
      const contributions = [
        { playerId: 'p1', card: makeCard(20) },
        { playerId: 'p2', card: makeCard(15) },
      ];

      const result = resolveRound({
        roundNumber: 1,
        sector: DUMMY_SECTOR,
        players,
        contributions,
        reactorProgress: 30,
        meltdownStrikes: 0,
      });

      assert.strictEqual(result.newProgress, 65);
      assert.strictEqual(result.meltdownAdded, false);
    });

    it('adds a meltdown strike when net delta is negative', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2')];
      const contributions = [
        { playerId: 'p1', card: makeCard(10) },
        { playerId: 'p2', card: makeCard(-25, true) },
      ];

      const result = resolveRound({
        roundNumber: 1,
        sector: DUMMY_SECTOR,
        players,
        contributions,
        reactorProgress: 30,
        meltdownStrikes: 0,
      });

      assert.strictEqual(result.meltdownAdded, true);
      assert.strictEqual(result.newStrikes, 1);
    });

    it('caps reactor progress at 100', () => {
      const players = [createDummyPlayer('p1')];
      const contributions = [{ playerId: 'p1', card: makeCard(20) }];

      const result = resolveRound({
        roundNumber: 1,
        sector: DUMMY_SECTOR,
        players,
        contributions,
        reactorProgress: 90,
        meltdownStrikes: 0,
      });

      assert.strictEqual(result.newProgress, 100);
    });

    it('returns shuffled contributions anonymously', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2'), createDummyPlayer('p3')];
      const contributions = [
        { playerId: 'p1', card: makeCard(20) },
        { playerId: 'p2', card: makeCard(-15, true) },
        { playerId: 'p3', card: makeCard(10) },
      ];

      const result = resolveRound({
        roundNumber: 1,
        sector: DUMMY_SECTOR,
        players,
        contributions,
        reactorProgress: 40,
        meltdownStrikes: 0,
      });

      assert.strictEqual(result.shuffledContributions.length, 3);
      // No playerId on shuffled cards
      assert.ok(result.shuffledContributions.every((c) => !('playerId' in c)));
    });
  });

  describe('resolveTrialVote', () => {
    it('detains player with majority votes (>= 2)', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2'), createDummyPlayer('p3')];
      const votes = { p1: 'p2', p3: 'p2' };
      const result = resolveTrialVote(players, votes);
      assert.strictEqual(result.detainedPlayerId, 'p2');
    });

    it('does not detain anyone on a tie', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2'), createDummyPlayer('p3')];
      const votes = { p1: 'p2', p3: 'p1' };
      const result = resolveTrialVote(players, votes);
      assert.strictEqual(result.detainedPlayerId, null);
    });

    it('does not detain with only 1 vote', () => {
      const players = [createDummyPlayer('p1'), createDummyPlayer('p2')];
      const votes = { p1: 'p2' };
      const result = resolveTrialVote(players, votes);
      assert.strictEqual(result.detainedPlayerId, null);
    });
  });

  describe('checkWinCondition', () => {
    const BASE_STATE = {
      phase: 'round_summary' as const,
      currentRound: 3,
      totalRounds: 6,
      activeSector: DUMMY_SECTOR,
      players: [],
      history: [],
      chat: [],
      winner: null as null,
      winReason: '',
    };

    it('returns crew winner when reactor progress >= 100', () => {
      const result = checkWinCondition({
        ...BASE_STATE,
        reactorProgress: 100,
        meltdownStrikes: 1,
      });
      assert.strictEqual(result.winner, 'crew');
    });

    it('returns saboteur winner when meltdown strikes >= 3', () => {
      const result = checkWinCondition({
        ...BASE_STATE,
        reactorProgress: 60,
        meltdownStrikes: 3,
      });
      assert.strictEqual(result.winner, 'saboteur');
    });

    it('returns null when game is still in progress', () => {
      const result = checkWinCondition({
        ...BASE_STATE,
        reactorProgress: 50,
        meltdownStrikes: 1,
      });
      assert.strictEqual(result.winner, null);
    });
  });
});
