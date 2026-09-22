import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { StoryPlayer } from '../types/one-word-story.types';
import { generateBotVotes, generateBotWord } from './story-bot';
import {
  addWordToStory,
  calculateFinalPlayerScores,
  compileFullStoryText,
  createInitialStoryState,
  tallyStoryAwards,
  validateWord,
} from './story-engine';
import { STORY_PROMPTS } from './story-prompts';

describe('One Word Story — Engine Tests', () => {
  const prompt = STORY_PROMPTS[0]!;
  const players: StoryPlayer[] = [
    {
      id: 'p1',
      displayName: 'Alice',
      avatar: '👑',
      score: 0,
      wordsContributed: 0,
      awardsReceived: [],
    },
    {
      id: 'p2',
      displayName: 'Bob (Bot)',
      avatar: '🤖',
      isBot: true,
      botPersonality: 'chaotic',
      score: 0,
      wordsContributed: 0,
      awardsReceived: [],
    },
    {
      id: 'p3',
      displayName: 'Clara (Bot)',
      avatar: '📜',
      isBot: true,
      botPersonality: 'poet',
      score: 0,
      wordsContributed: 0,
      awardsReceived: [],
    },
  ];

  describe('Word Validation', () => {
    it('rejects empty input', () => {
      const res = validateWord('   ');
      assert.strictEqual(res.isValid, false);
      assert.match(res.error ?? '', /empty/i);
    });

    it('rejects multi-word inputs', () => {
      const res = validateWord('two words');
      assert.strictEqual(res.isValid, false);
      assert.match(res.error ?? '', /single word/i);
    });

    it('rejects words longer than 25 characters', () => {
      const res = validateWord('supercalifragilisticexpialidocious');
      assert.strictEqual(res.isValid, false);
      assert.match(res.error ?? '', /25 character/i);
    });

    it('accepts valid single word with punctuation attached', () => {
      const res = validateWord('Dragon!');
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.cleanedWord, 'Dragon!');
    });
  });

  describe('Story Progression & Turns', () => {
    it('initializes state with storytelling phase and first player active', () => {
      const state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2', 'p3'],
        maxWords: 5,
      });

      assert.strictEqual(state.phase, 'storytelling');
      assert.strictEqual(state.activePlayerId, 'p1');
      assert.strictEqual(state.words.length, 0);
      assert.strictEqual(state.turnIndex, 0);
    });

    it('advances turn to next player when word is added', () => {
      let state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2', 'p3'],
        maxWords: 3,
      });

      state = addWordToStory(state, 'whispered', players[0]!);
      assert.strictEqual(state.words.length, 1);
      assert.strictEqual(state.activePlayerId, 'p2');
      assert.strictEqual(state.turnIndex, 1);

      state = addWordToStory(state, 'darkly,', players[1]!);
      assert.strictEqual(state.words.length, 2);
      assert.strictEqual(state.activePlayerId, 'p3');
    });

    it('transitions to readback when maxWords is reached', () => {
      let state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2'],
        maxWords: 2,
      });

      state = addWordToStory(state, 'Hello', players[0]!);
      assert.strictEqual(state.phase, 'storytelling');

      state = addWordToStory(state, 'World.', players[1]!);
      assert.strictEqual(state.phase, 'readback');
      assert.strictEqual(state.words.length, 2);
    });
  });

  describe('Story Compilation', () => {
    it('formats starter phrase and words with proper spacing', () => {
      let state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2'],
        maxWords: 5,
      });

      state = addWordToStory(state, 'lights', players[0]!);
      state = addWordToStory(state, 'flickered.', players[1]!);

      const fullText = compileFullStoryText(prompt, state.words);
      assert.ok(fullText.startsWith(prompt.starterPhrase));
      assert.ok(fullText.includes('lights flickered.'));
    });
  });

  describe('Awards & Scoring', () => {
    it('tallies awards correctly based on votes', () => {
      let state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2'],
        maxWords: 3,
      });

      state = addWordToStory(state, 'banana', players[0]!);
      state = addWordToStory(state, 'EXPLODED!', players[1]!);

      const bananaId = state.words[0]!.id;
      const explodeId = state.words[1]!.id;

      const votes = [
        { voterId: 'p2', wordId: bananaId, awardType: 'funniest' as const },
        { voterId: 'p1', wordId: explodeId, awardType: 'wildest' as const },
        { voterId: 'p2', wordId: explodeId, awardType: 'best_twist' as const },
      ];

      const awards = tallyStoryAwards(state.words, votes);
      assert.strictEqual(awards.length, 3);

      const funniestAward = awards.find((a) => a.awardType === 'funniest');
      assert.strictEqual(funniestAward?.word, 'banana');

      const wildestAward = awards.find((a) => a.awardType === 'wildest');
      assert.strictEqual(wildestAward?.word, 'EXPLODED!');

      const updatedPlayers = calculateFinalPlayerScores(players, state.words, awards, votes);
      const bob = updatedPlayers.find((p) => p.id === 'p2');
      assert.ok(bob && bob.score > 0);
    });
  });

  describe('Bot Generation', () => {
    it('generates a valid single word from bot', () => {
      const state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2'],
        maxWords: 5,
      });

      const botWord = generateBotWord(players[1]!, state);
      assert.ok(typeof botWord === 'string' && botWord.length > 0);
      assert.strictEqual(validateWord(botWord).isValid, true);
    });

    it('generates votes for words not authored by itself', () => {
      let state = createInitialStoryState({
        prompt,
        playerIds: ['p1', 'p2'],
        maxWords: 3,
      });

      state = addWordToStory(state, 'magic', players[0]!);
      state = addWordToStory(state, 'chaos', players[1]!);

      const botVotes = generateBotVotes(players[1]!, state.words);
      assert.strictEqual(botVotes.length, 3);
      // Bob should vote for player 1's word if available
      assert.strictEqual(botVotes[0]!.wordId, state.words[0]!.id);
    });
  });
});
