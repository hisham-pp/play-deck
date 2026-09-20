import assert from 'node:assert';
import { describe, it } from 'node:test';

import type { TelephonePlayer } from '../types/telephone-drawing.types';
import { generateBotDrawing, generateBotMutationVote } from './telephone-bot';
import {
  advanceReveal,
  castMutationVote,
  CROWD_FAVORITE_BONUS,
  createInitialState,
  getStepTypeForIndex,
  submitDescriptionStep,
  submitDrawingStep,
  tallyFinalScores,
  VOTE_POINTS,
} from './telephone-engine';

function makeMockPlayers(): TelephonePlayer[] {
  return [
    {
      id: 'p1',
      displayName: 'Alice',
      avatar: '👩',
      isHost: true,
      isBot: false,
      score: 0,
      votedStepIndex: null,
      awardsReceived: [],
    },
    {
      id: 'p2',
      displayName: 'Bob',
      avatar: '🧔',
      isHost: false,
      isBot: false,
      score: 0,
      votedStepIndex: null,
      awardsReceived: [],
    },
    {
      id: 'p3',
      displayName: 'Charlie',
      avatar: '🎨',
      isHost: false,
      isBot: false,
      score: 0,
      votedStepIndex: null,
      awardsReceived: [],
    },
    {
      id: 'bot1',
      displayName: 'Doodle Dan',
      avatar: '✏️',
      isHost: false,
      isBot: true,
      botStyle: 'doodler',
      score: 0,
      votedStepIndex: null,
      awardsReceived: [],
    },
  ];
}

describe('Telephone Drawing — Engine Tests', () => {
  describe('Game Initialization & Step Sequencing', () => {
    it('initializes game in turn phase with 4 steps', () => {
      const players = makeMockPlayers();
      const state = createInitialState(players, 'A cat drinking coffee');

      assert.strictEqual(state.phase, 'turn');
      assert.strictEqual(state.initialPhrase, 'A cat drinking coffee');
      assert.strictEqual(state.currentStepIndex, 0);
      assert.strictEqual(state.totalSteps, 4);
      assert.strictEqual(state.activePlayerId, 'p1');
      assert.strictEqual(getStepTypeForIndex(0), 'draw');
      assert.strictEqual(getStepTypeForIndex(1), 'describe');
    });

    it('advances alternating chain through draw and describe', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players, 'A cat drinking coffee');

      // Step 0: P1 draws
      state = submitDrawingStep(state, 'p1', 'data:image/svg+xml;utf8,<svg></svg>');
      assert.strictEqual(state.currentStepIndex, 1);
      assert.strictEqual(state.activePlayerId, 'p2');
      assert.strictEqual(state.steps.length, 1);
      assert.strictEqual(state.steps[0]!.type, 'draw');

      // Step 1: P2 describes
      state = submitDescriptionStep(state, 'p2', 'A very cute kitten with tea');
      assert.strictEqual(state.currentStepIndex, 2);
      assert.strictEqual(state.activePlayerId, 'p3');
      assert.strictEqual(state.steps.length, 2);
      assert.strictEqual(state.steps[1]!.type, 'describe');
      assert.strictEqual(state.steps[1]!.description, 'A very cute kitten with tea');
    });

    it('completes chain and transitions to reveal on final step', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players, 'Secret phrase');

      // Step 0: P1 draws
      state = submitDrawingStep(state, 'p1', 'draw0');
      // Step 1: P2 describes
      state = submitDescriptionStep(state, 'p2', 'desc1');
      // Step 2: P3 draws
      state = submitDrawingStep(state, 'p3', 'draw2');
      // Step 3: Bot1 describes (final step)
      state = submitDescriptionStep(state, 'bot1', 'desc3');

      assert.strictEqual(state.steps.length, 4);
      assert.strictEqual(state.phase, 'reveal');
      assert.strictEqual(state.revealIndex, 0);
    });
  });

  describe('Reveal Slideshow & Mutation Voting', () => {
    it('steps through reveal slides until voting stage', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);
      state = submitDrawingStep(state, 'p1', 'd1');
      state = submitDescriptionStep(state, 'p2', 'd2');
      state = submitDrawingStep(state, 'p3', 'd3');
      state = submitDescriptionStep(state, 'bot1', 'd4');

      assert.strictEqual(state.phase, 'reveal');
      assert.strictEqual(state.revealIndex, 0);

      state = advanceReveal(state);
      assert.strictEqual(state.revealIndex, 1);
      state = advanceReveal(state);
      assert.strictEqual(state.revealIndex, 2);
      state = advanceReveal(state);
      assert.strictEqual(state.revealIndex, 3);
      state = advanceReveal(state);
      assert.strictEqual(state.revealIndex, 4);

      // Past last step transitions to voting
      state = advanceReveal(state);
      assert.strictEqual(state.phase, 'voting');
    });

    it('prevents players from voting for their own step', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players);
      state = submitDrawingStep(state, 'p1', 'd1');
      state = submitDescriptionStep(state, 'p2', 'd2');
      state = submitDrawingStep(state, 'p3', 'd3');
      state = submitDescriptionStep(state, 'bot1', 'd4');
      state.phase = 'voting';

      // P1 tries to vote for Step 0 (authored by P1)
      const afterSelfVote = castMutationVote(state, 'p1', 0);
      assert.strictEqual(afterSelfVote.players.find((p) => p.id === 'p1')?.votedStepIndex, null);
      assert.strictEqual(afterSelfVote.steps[0]?.votesReceived, 0);

      // P1 votes for Step 1 (authored by P2)
      const afterValidVote = castMutationVote(state, 'p1', 1);
      assert.strictEqual(afterValidVote.players.find((p) => p.id === 'p1')?.votedStepIndex, 1);
      assert.strictEqual(afterValidVote.steps[1]?.votesReceived, 1);
    });
  });

  describe('Scoring & Awards', () => {
    it('tallies vote points and awards Crowd Favorite bonus', () => {
      const players = makeMockPlayers();
      let state = createInitialState(players, 'Giraffe coffee');
      state = submitDrawingStep(state, 'p1', 'd1');
      state = submitDescriptionStep(state, 'p2', 'd2');
      state = submitDrawingStep(state, 'p3', 'd3');
      state = submitDescriptionStep(state, 'bot1', 'Giraffe having a hot coffee');
      state.phase = 'voting';

      // P1 and P3 vote for Step 1 (authored by P2)
      state = castMutationVote(state, 'p1', 1);
      state = castMutationVote(state, 'p3', 1);
      // P2 votes for Step 2 (authored by P3)
      state = castMutationVote(state, 'p2', 2);

      state = tallyFinalScores(state);
      assert.strictEqual(state.phase, 'game-over');

      const p2 = state.players.find((p) => p.id === 'p2')!;
      // P2 received 2 votes (= 200 pts) + Crowd Favorite (200 pts) = 400 pts
      assert.strictEqual(p2.score, 2 * VOTE_POINTS + CROWD_FAVORITE_BONUS);
      assert.ok(p2.awardsReceived.includes('Funniest Mutation'));
    });
  });

  describe('Bot Automation', () => {
    it('generates non-empty SVG sketch data URL', () => {
      const sketch = generateBotDrawing('doodler', 'cat');
      assert.ok(sketch.startsWith('data:image/svg+xml;utf8,'));
      assert.ok(sketch.length > 50);
    });

    it('bot never votes for its own step', () => {
      const bot = makeMockPlayers()[3]!;
      const steps = [
        {
          stepIndex: 0,
          type: 'draw' as const,
          authorId: 'p1',
          authorName: 'Alice',
          authorAvatar: '👩',
          votesReceived: 0,
          voterIds: [],
        },
        {
          stepIndex: 1,
          type: 'describe' as const,
          authorId: 'bot1',
          authorName: 'Doodle Dan',
          authorAvatar: '✏️',
          votesReceived: 0,
          voterIds: [],
        },
      ];

      const votedIndex = generateBotMutationVote(bot, steps);
      assert.strictEqual(votedIndex, 0);
    });
  });
});
