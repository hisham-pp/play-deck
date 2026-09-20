import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MissionObjective, RoundResult, TrustPlayer } from '../types/trust-or-betray.types';
import { decideBotChoice, decideBotTrialVote, generateBotChatMessage } from './trust-bot';

function createDummyPlayer(id: string, overrides: Partial<TrustPlayer> = {}): TrustPlayer {
  return {
    id,
    name: `Bot ${id}`,
    avatar: '🤖',
    color: '#06b6d4',
    isBot: true,
    archetype: 'saint',
    score: 100,
    currentChoice: null,
    hasLockedIn: false,
    trustRating: 50,
    trustLevel: 'neutral',
    cooperationCount: 0,
    betrayalCount: 0,
    isExiled: false,
    exileRoundsRemaining: 0,
    votesAgainst: 0,
    ...overrides,
  };
}

const mockMission: MissionObjective = {
  id: 'test-mission',
  name: 'Test Mission',
  category: 'Test',
  description: 'Test mission',
  basePot: 300,
  bonusMultiplier: 1.0,
};

describe('trust-bot', () => {
  describe('decideBotChoice', () => {
    it('saint archetype cooperates consistently in peaceful history', () => {
      const saintBot = createDummyPlayer('bot-saint', { archetype: 'saint' });
      const choices = Array.from({ length: 10 }).map(() =>
        decideBotChoice({
          bot: saintBot,
          allPlayers: [saintBot],
          currentRound: 1,
          mission: mockMission,
          cooperationStreak: 1,
          history: [],
        }),
      );
      assert.ok(choices.every((c) => c === 'cooperate'));
    });

    it('grudgebearer retaliates when an opponent betrayed in the last round', () => {
      const grudgeBot = createDummyPlayer('bot-grudge', { archetype: 'grudgebearer' });
      const lastRound: RoundResult = {
        roundNumber: 1,
        mission: mockMission,
        pot: 300,
        outcome: 'solo_betray',
        choices: { 'bot-grudge': 'cooperate', 'traitor-1': 'betray' },
        scoreDeltas: { 'bot-grudge': 0, 'traitor-1': 350 },
      };

      const choices = Array.from({ length: 30 }).map(() =>
        decideBotChoice({
          bot: grudgeBot,
          allPlayers: [grudgeBot],
          currentRound: 2,
          mission: mockMission,
          cooperationStreak: 0,
          history: [lastRound],
        }),
      );
      // High chance of betrayal retaliation
      assert.ok(choices.some((c) => c === 'betray'));
    });

    it('returns either cooperate or betray for all archetypes', () => {
      const archetypes = ['saint', 'opportunist', 'grudgebearer', 'wildcard'] as const;
      archetypes.forEach((arch) => {
        const bot = createDummyPlayer(`bot-${arch}`, { archetype: arch });
        const choice = decideBotChoice({
          bot,
          allPlayers: [bot],
          currentRound: 1,
          mission: mockMission,
          cooperationStreak: 0,
          history: [],
        });
        assert.ok(choice === 'cooperate' || choice === 'betray');
      });
    });
  });

  describe('decideBotTrialVote', () => {
    it('returns null if there are no other eligible candidates', () => {
      const bot = createDummyPlayer('bot-1');
      const vote = decideBotTrialVote(bot, [bot], []);
      assert.strictEqual(vote, null);
    });

    it('grudgebearer votes for the player who betrayed in the last round', () => {
      const grudgeBot = createDummyPlayer('bot-grudge', { archetype: 'grudgebearer' });
      const suspect = createDummyPlayer('suspect-1', { betrayalCount: 2 });
      const innocent = createDummyPlayer('innocent-1', { betrayalCount: 0 });

      const lastRound: RoundResult = {
        roundNumber: 2,
        mission: mockMission,
        pot: 300,
        outcome: 'solo_betray',
        choices: { 'suspect-1': 'betray', 'innocent-1': 'cooperate' },
        scoreDeltas: { 'suspect-1': 350, 'innocent-1': 0 },
      };

      const vote = decideBotTrialVote(grudgeBot, [grudgeBot, suspect, innocent], [lastRound]);
      assert.strictEqual(vote, 'suspect-1');
    });
  });

  describe('generateBotChatMessage', () => {
    it('generates a non-empty formatted message', () => {
      const bot = createDummyPlayer('bot-1', { name: 'Bot Bravo', archetype: 'opportunist' });
      const msg = generateBotChatMessage(bot);

      assert.strictEqual(msg.senderId, 'bot-1');
      assert.strictEqual(msg.senderName, 'Bot Bravo');
      assert.ok(msg.text.length > 5);
      assert.ok(msg.timestamp.length > 0);
    });
  });
});
