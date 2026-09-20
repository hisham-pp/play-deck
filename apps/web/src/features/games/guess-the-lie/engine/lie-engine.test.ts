import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LiePlayer } from '../types/guess-the-lie.types';
import { generateBotAnswer, generateBotVote } from './lie-bot';
import {
  advanceRound,
  calculateRoundScores,
  createInitialLieState,
  recordVote,
  registerAnswer,
} from './lie-engine';
import { LIE_PROMPTS } from './lie-prompts';

describe('Guess the Lie — Engine Tests', () => {
  const prompt = LIE_PROMPTS[0]!;

  const samplePlayers: LiePlayer[] = [
    {
      id: 'p1',
      displayName: 'Alice',
      avatar: '🎭',
      role: 'truth_teller',
      score: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
    {
      id: 'p2',
      displayName: 'Bob',
      avatar: '🕵️',
      role: 'truth_teller',
      score: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
    {
      id: 'p3',
      displayName: 'Charlie (Bot)',
      avatar: '🤖',
      isBot: true,
      botPersona: 'convincing',
      role: 'truth_teller',
      score: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
  ];

  describe('Game Initialization & Roles', () => {
    it('creates initial state with exactly one Liar and remaining Truth-tellers', () => {
      const state = createInitialLieState({
        players: samplePlayers,
        prompt,
      });

      assert.strictEqual(state.phase, 'briefing');
      assert.strictEqual(state.currentRound, 1);
      assert.strictEqual(state.currentPrompt.id, prompt.id);

      const liars = state.players.filter((p) => p.role === 'liar');
      const truthTellers = state.players.filter((p) => p.role === 'truth_teller');

      assert.strictEqual(liars.length, 1);
      assert.strictEqual(truthTellers.length, 2);
      assert.strictEqual(state.liarId, liars[0]!.id);
    });
  });

  describe('Answer Registration', () => {
    it('accurately flags answer as isLie only when author is the liar', () => {
      const state = createInitialLieState({
        players: samplePlayers,
        prompt,
      });

      const liarPlayer = state.players.find((p) => p.id === state.liarId)!;
      const truthPlayer = state.players.find((p) => p.id !== state.liarId)!;

      const state1 = registerAnswer(state, liarPlayer, 'A fabricated island capital');
      const state2 = registerAnswer(state1, truthPlayer, 'Reykjavik');

      assert.strictEqual(state2.answers.length, 2);
      const lieAns = state2.answers.find((a) => a.authorId === liarPlayer.id);
      const truthAns = state2.answers.find((a) => a.authorId === truthPlayer.id);

      assert.strictEqual(lieAns?.isLie, true);
      assert.strictEqual(truthAns?.isLie, false);
      assert.strictEqual(state2.players.find((p) => p.id === liarPlayer.id)?.hasSubmitted, true);
    });
  });

  describe('Voting and Scoring', () => {
    it('calculates correct points for truth-tellers and fooled bonuses for liar', () => {
      let state = createInitialLieState({
        players: samplePlayers,
        prompt,
      });

      // Let p1 be liar, p2 and p3 be truth-tellers
      const liar = state.players[0]!;
      const truth1 = state.players[1]!;
      const truth2 = state.players[2]!;

      state = registerAnswer(state, liar, 'Fake Lie Answer');
      state = registerAnswer(state, truth1, 'True Answer 1');
      state = registerAnswer(state, truth2, 'True Answer 2');

      const lieAnsId = `ans-${liar.id}`;
      const truthAnsId1 = `ans-${truth1.id}`;

      // truth1 guesses correctly: votes for lieAnsId
      // truth2 is fooled: votes for truthAnsId1
      state = recordVote(state, truth1.id, lieAnsId);
      state = recordVote(state, truth2.id, truthAnsId1);

      const { updatedPlayers, roundResult } = calculateRoundScores(state);

      assert.strictEqual(roundResult.liarId, liar.id);
      assert.strictEqual(roundResult.lieAnswerId, lieAnsId);
      assert.deepStrictEqual(roundResult.correctGuesserIds, [truth1.id]);
      assert.deepStrictEqual(roundResult.fooledGuesserIds, [truth2.id]);

      // truth1 got 100 pts (correct guess) + 25 pts (suspicious truth bonus from truth2's vote) = 125 pts
      const pTruth1 = updatedPlayers.find((p) => p.id === truth1.id);
      assert.strictEqual(pTruth1?.score, 125);

      // truth2 was fooled (0 pts)
      const pTruth2 = updatedPlayers.find((p) => p.id === truth2.id);
      assert.strictEqual(pTruth2?.score, 0);

      // Liar got 50 pts (1 player fooled)
      const pLiar = updatedPlayers.find((p) => p.id === liar.id);
      assert.strictEqual(pLiar?.score, 50);
    });

    it('awards majority fooled bonus if liar fools more than 50% of guessers', () => {
      let state = createInitialLieState({
        players: samplePlayers,
        prompt,
      });

      const liar = state.players[0]!;
      const truth1 = state.players[1]!;
      const truth2 = state.players[2]!;

      state = registerAnswer(state, liar, 'Great Fake');
      state = registerAnswer(state, truth1, 'Truth 1');
      state = registerAnswer(state, truth2, 'Truth 2');

      // Both guessers are fooled
      state = recordVote(state, truth1.id, `ans-${truth2.id}`);
      state = recordVote(state, truth2.id, `ans-${truth1.id}`);

      const { updatedPlayers, roundResult } = calculateRoundScores(state);

      assert.strictEqual(roundResult.fooledGuesserIds.length, 2);
      assert.strictEqual(roundResult.liarFooledBonus, 150);

      // 2 * 50 + 150 bonus = 250
      const pLiar = updatedPlayers.find((p) => p.id === liar.id);
      assert.strictEqual(pLiar?.score, 250);
    });
  });

  describe('Round Progression & Liar Rotation', () => {
    it('rotates liar to the next player and resets answers', () => {
      const state = createInitialLieState({
        players: samplePlayers,
        prompt,
      });

      const initialLiarId = state.liarId;
      const nextPrompt = LIE_PROMPTS[1]!;
      const nextState = advanceRound(state, nextPrompt);

      assert.strictEqual(nextState.currentRound, 2);
      assert.notStrictEqual(nextState.liarId, initialLiarId);
      assert.strictEqual(nextState.answers.length, 0);
      assert.strictEqual(nextState.roundResult, null);
    });
  });

  describe('Bot Automation', () => {
    it('generates non-empty bot answer matching persona', () => {
      const bot = samplePlayers[2]!;
      const ans = generateBotAnswer(bot, prompt);
      assert.ok(ans.length > 0);
    });

    it('bot never votes for its own answer', () => {
      const bot = samplePlayers[2]!;
      const answers = [
        {
          id: 'ans-p1',
          authorId: 'p1',
          authorName: 'Alice',
          authorAvatar: '🎭',
          text: 'Ans 1',
          isLie: false,
          votesReceived: [],
        },
        {
          id: 'ans-p3',
          authorId: bot.id,
          authorName: bot.displayName,
          authorAvatar: bot.avatar,
          text: 'Bot Ans',
          isLie: true,
          votesReceived: [],
        },
      ];

      const vote = generateBotVote(bot, answers);
      assert.strictEqual(vote, 'ans-p1');
    });
  });
});
