import assert from 'node:assert';
import { describe, it } from 'node:test';

import type { WrongAnswersPlayer } from '../types/wrong-answers.types';
import { generateBotAnswer, generateBotVote } from './wrong-answers-bot';
import {
  advanceToNextRound,
  castVote,
  createInitialState,
  MOST_VOTED_BONUS,
  STREAK_BONUS,
  submitAnswer,
  tallyVotesAndScore,
  VOTE_POINTS,
} from './wrong-answers-engine';
import { WRONG_ANSWERS_PROMPTS } from './wrong-answers-prompts';

function makeMockPlayers(): WrongAnswersPlayer[] {
  return [
    {
      id: 'p1',
      displayName: 'Alice',
      avatar: '👩',
      isHost: true,
      isBot: false,
      score: 0,
      streak: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
    {
      id: 'p2',
      displayName: 'Bob',
      avatar: '🧔',
      isHost: false,
      isBot: false,
      score: 0,
      streak: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
    {
      id: 'bot1',
      displayName: 'Punny Pete',
      avatar: '🃏',
      isHost: false,
      isBot: true,
      botStyle: 'punny',
      score: 0,
      streak: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    },
  ];
}

describe('Wrong Answers Only — Engine Tests', () => {
  describe('Game Initialization', () => {
    it('initializes game in answering phase with configured rounds', () => {
      const players = makeMockPlayers();
      const state = createInitialState(players, { totalRounds: 4 });

      assert.strictEqual(state.phase, 'answering');
      assert.strictEqual(state.currentRound, 1);
      assert.strictEqual(state.totalRounds, 4);
      assert.strictEqual(state.answers.length, 0);
      assert.strictEqual(state.players.length, 3);
      assert.ok(state.currentQuestion.prompt.length > 0);
    });
  });

  describe('Answer Submissions', () => {
    it('accepts answers and marks player as submitted', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);

      state = submitAnswer(state, 'p1', 'Never Ask Snakes Anything');
      assert.strictEqual(state.answers.length, 1);
      assert.strictEqual(state.answers[0]!.authorId, 'p1');
      assert.strictEqual(state.answers[0]!.text, 'Never Ask Snakes Anything');
      assert.strictEqual(state.players.find((p) => p.id === 'p1')?.hasSubmitted, true);

      // Updating answer replaces previous text rather than duplicating
      state = submitAnswer(state, 'p1', 'No Aliens Stay Awake');
      assert.strictEqual(state.answers.length, 1);
      assert.strictEqual(state.answers[0]!.text, 'No Aliens Stay Awake');
    });

    it('rejects blank answers', () => {
      const players = makeMockPlayers();
      const state = createInitialState(players);
      const after = submitAnswer(state, 'p1', '    ');
      assert.strictEqual(after.answers.length, 0);
    });
  });

  describe('Voting Rules', () => {
    it('prevents players from voting for their own answer', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);
      state = submitAnswer(state, 'p1', 'Fake 1');
      state = submitAnswer(state, 'p2', 'Fake 2');

      const ansP1 = state.answers.find((a) => a.authorId === 'p1')!.id;
      const afterSelfVote = castVote(state, 'p1', ansP1);

      // Vote should not have been counted
      assert.strictEqual(afterSelfVote.players.find((p) => p.id === 'p1')?.votedAnswerId, null);
      assert.strictEqual(afterSelfVote.answers.find((a) => a.id === ansP1)?.voteCount, 0);
    });

    it('allows voting for opponent answers and allows switching votes', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);
      state = submitAnswer(state, 'p1', 'Fake 1');
      state = submitAnswer(state, 'p2', 'Fake 2');
      state = submitAnswer(state, 'bot1', 'Fake 3');

      const ansP2 = state.answers.find((a) => a.authorId === 'p2')!.id;
      const ansBot = state.answers.find((a) => a.authorId === 'bot1')!.id;

      // P1 votes for P2
      state = castVote(state, 'p1', ansP2);
      assert.strictEqual(state.answers.find((a) => a.id === ansP2)?.voteCount, 1);
      assert.strictEqual(state.players.find((p) => p.id === 'p1')?.votedAnswerId, ansP2);

      // P1 changes vote to bot
      state = castVote(state, 'p1', ansBot);
      assert.strictEqual(state.answers.find((a) => a.id === ansP2)?.voteCount, 0);
      assert.strictEqual(state.answers.find((a) => a.id === ansBot)?.voteCount, 1);
      assert.strictEqual(state.players.find((p) => p.id === 'p1')?.votedAnswerId, ansBot);
    });
  });

  describe('Scoring & Crowd Favorite Streaks', () => {
    it('awards 1 pt per vote and 3 bonus pts for most-voted answer', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);
      state = submitAnswer(state, 'p1', 'Hilarious Answer');
      state = submitAnswer(state, 'p2', 'Okay Answer');
      state = submitAnswer(state, 'bot1', 'Boring Answer');

      const ansP1 = state.answers.find((a) => a.authorId === 'p1')!.id;
      const ansP2 = state.answers.find((a) => a.authorId === 'p2')!.id;

      // P2 and bot vote for P1
      state = castVote(state, 'p2', ansP1);
      state = castVote(state, 'bot1', ansP1);
      // P1 votes for P2
      state = castVote(state, 'p1', ansP2);

      state = tallyVotesAndScore(state);

      assert.strictEqual(state.phase, 'reveal');
      const p1 = state.players.find((p) => p.id === 'p1')!;
      const p2 = state.players.find((p) => p.id === 'p2')!;

      // P1 received 2 votes (= 2 pts) + most-voted bonus (3 pts) = 5 pts
      assert.strictEqual(p1.score, 2 * VOTE_POINTS + MOST_VOTED_BONUS);
      assert.strictEqual(p1.streak, 1);

      // P2 received 1 vote (= 1 pt) + 0 bonus = 1 pt
      assert.strictEqual(p2.score, 1 * VOTE_POINTS);
      assert.strictEqual(p2.streak, 0);
    });

    it('awards streak bonus for back-to-back most-voted wins', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players, { totalRounds: 3 });

      // Round 1
      state = submitAnswer(state, 'p1', 'Ans 1');
      state = submitAnswer(state, 'p2', 'Ans 2');
      const ans1 = state.answers.find((a) => a.authorId === 'p1')!.id;
      state = castVote(state, 'p2', ans1);
      state = tallyVotesAndScore(state);

      const p1R1 = state.players.find((p) => p.id === 'p1')!;
      assert.strictEqual(p1R1.streak, 1);

      // Round 2
      state = advanceToNextRound(state);
      assert.strictEqual(state.currentRound, 2);
      state = submitAnswer(state, 'p1', 'Ans 1 Round 2');
      state = submitAnswer(state, 'p2', 'Ans 2 Round 2');
      const ans1R2 = state.answers.find((a) => a.authorId === 'p1')!.id;
      state = castVote(state, 'p2', ans1R2);
      state = tallyVotesAndScore(state);

      const p1R2 = state.players.find((p) => p.id === 'p1')!;
      assert.strictEqual(p1R2.streak, 2);
      // R1: 1 vote + 3 bonus = 4 pts
      // R2: 1 vote + 3 bonus + 2 streak bonus = 6 pts
      // Total: 10 pts
      assert.strictEqual(p1R2.score, 4 + (1 + MOST_VOTED_BONUS + STREAK_BONUS));
      assert.ok(p1R2.awardsReceived.includes('On Fire'));
    });
  });

  describe('Bot Automation', () => {
    it('generates style-matching answers', () => {
      const question = WRONG_ANSWERS_PROMPTS[0]!;
      const absurdAns = generateBotAnswer(question, 'absurd');
      assert.strictEqual(absurdAns, question.botAnswers.absurd);
    });

    it('never casts bot vote for own answer', () => {
      const botPlayer: WrongAnswersPlayer = {
        id: 'bot1',
        displayName: 'Punny Pete',
        avatar: '🃏',
        isHost: false,
        isBot: true,
        botStyle: 'punny',
        score: 0,
        streak: 0,
        hasSubmitted: true,
        votedAnswerId: null,
        awardsReceived: [],
      };

      const answers = [
        {
          id: 'ans-bot1',
          authorId: 'bot1',
          authorName: 'Punny Pete',
          authorAvatar: '🃏',
          text: 'My Own Answer',
          voteCount: 0,
          voterIds: [],
        },
        {
          id: 'ans-human',
          authorId: 'human',
          authorName: 'Alice',
          authorAvatar: '👩',
          text: 'Human Answer',
          voteCount: 0,
          voterIds: [],
        },
      ];

      const votedId = generateBotVote(botPlayer, answers);
      assert.strictEqual(votedId, 'ans-human');
    });
  });
});
