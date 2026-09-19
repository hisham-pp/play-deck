import type {
  AnagramDifficulty,
  AnagramRoundPlan,
  AnagramRules,
  AnagramWord,
} from '../types/anagram-sprint.types';
import {
  BLITZ_SECONDS_SCALE,
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  MIN_ROUND_SECONDS,
  MODE_BLITZ,
  SECONDS_BY_DIFFICULTY,
} from './anagram-constants';
import { createRandom, scrambleWord, shuffle } from './anagram-scramble';
import { wordsAt } from './anagram-word-bank';

/** Share of the match spent at each rung before the difficulty steps up. */
const EASY_SHARE = 0.3;
const MEDIUM_SHARE = 0.7;

/** The rung round `index` of `total` is played at. */
export function difficultyForRound(index: number, total: number): AnagramDifficulty {
  const progress = total <= 1 ? 1 : index / (total - 1);
  if (progress < EASY_SHARE) return DIFFICULTY_EASY;
  if (progress < MEDIUM_SHARE) return DIFFICULTY_MEDIUM;
  return DIFFICULTY_HARD;
}

export function secondsForRound(difficulty: AnagramDifficulty, rules: AnagramRules): number {
  const base = SECONDS_BY_DIFFICULTY[difficulty];
  const scaled = rules.mode === MODE_BLITZ ? base * BLITZ_SECONDS_SCALE : base;
  return Math.max(MIN_ROUND_SECONDS, Math.round(scaled));
}

/**
 * Deals without replacement so a word never repeats inside a match. When a
 * difficulty rung runs dry the pool is reshuffled and reopened, which only
 * happens in long survival runs.
 */
function createDealer(rules: AnagramRules, random: () => number) {
  const pools = new Map<AnagramDifficulty, AnagramWord[]>();

  function refill(difficulty: AnagramDifficulty): AnagramWord[] {
    const pool = shuffle(wordsAt(rules.category, difficulty), random);
    pools.set(difficulty, pool);
    return pool;
  }

  return (difficulty: AnagramDifficulty): AnagramWord => {
    const pool = pools.get(difficulty) ?? refill(difficulty);
    const next = pool.pop() ?? refill(difficulty).pop();
    // `wordsAt` never returns an empty list, so this only guards the types.
    return next ?? wordsAt(rules.category, difficulty)[0];
  };
}

/**
 * The whole match, built up front from the seed. Sharing one number is enough
 * for every seat in a room to see the same letters in the same order, which is
 * what makes the race fair without a referee.
 */
export function buildRoundPlan(rules: AnagramRules, seed: number): AnagramRoundPlan[] {
  const random = createRandom(seed);
  const deal = createDealer(rules, random);

  return Array.from({ length: rules.totalRounds }, (_, index) => {
    const difficulty = difficultyForRound(index, rules.totalRounds);
    const entry = deal(difficulty);
    return {
      index,
      entry,
      scrambled: scrambleWord(entry.word, random),
      seconds: secondsForRound(difficulty, rules),
    };
  });
}
