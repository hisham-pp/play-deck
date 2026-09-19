import type {
  AnagramCategory,
  AnagramDifficulty,
  AnagramWord,
} from '../types/anagram-sprint.types';
import { CORE_BANK } from './anagram-bank-core';
import { THEMED_BANK } from './anagram-bank-themed';

/** The sorted letters of a word — every anagram of it shares this key. */
export function anagramKey(word: string): string {
  return word.toLowerCase().split('').sort().join('');
}

function dedupe(entries: readonly AnagramWord[]): AnagramWord[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.word)) return false;
    seen.add(entry.word);
    return true;
  });
}

export const ANAGRAM_BANK: AnagramWord[] = dedupe([...CORE_BANK, ...THEMED_BANK]);

/**
 * Every bank word that rearranges to the same letters. "Listen" and "silent"
 * both clear a round built from either, so nobody loses a race on a technicality.
 */
const SOLUTIONS_BY_KEY: Map<string, string[]> = ANAGRAM_BANK.reduce((index, entry) => {
  const key = anagramKey(entry.word);
  index.set(key, [...(index.get(key) ?? []), entry.word]);
  return index;
}, new Map<string, string[]>());

export function solutionsFor(word: string): string[] {
  return SOLUTIONS_BY_KEY.get(anagramKey(word)) ?? [word.toLowerCase()];
}

export function wordsIn(category: AnagramCategory | null): AnagramWord[] {
  if (!category) return ANAGRAM_BANK;
  const matches = ANAGRAM_BANK.filter((entry) => entry.category === category);
  // A category with nothing at a needed difficulty would stall the round plan,
  // so an empty bank falls back to the whole list rather than dealing nothing.
  return matches.length > 0 ? matches : ANAGRAM_BANK;
}

export function wordsAt(
  category: AnagramCategory | null,
  difficulty: AnagramDifficulty,
): AnagramWord[] {
  const pool = wordsIn(category);
  const matches = pool.filter((entry) => entry.difficulty === difficulty);
  return matches.length > 0 ? matches : pool;
}

/** Categories the setup screen can offer, in the order they are shown. */
export const AVAILABLE_CATEGORIES: AnagramCategory[] = [
  'common',
  'advanced',
  'animals',
  'food',
  'science',
  'travel',
  'sports',
];
