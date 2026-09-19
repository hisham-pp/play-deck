import type {
  HangmanBankWord,
  HangmanCategory,
  HangmanDifficulty,
  HangmanRejection,
} from '../types/hangman-duel.types';
import { CORE_BANK } from './hangman-bank-core';
import { THEMED_BANK } from './hangman-bank-themed';
import {
  ALPHABET,
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  MAX_WORD_LENGTH,
  MIN_WORD_LENGTH,
  RARE_LETTERS,
} from './hangman-constants';

export const ALL_WORDS: readonly HangmanBankWord[] = [...CORE_BANK, ...THEMED_BANK];

export function filterWords(
  category?: HangmanCategory | null,
  difficulty?: HangmanDifficulty | null,
): HangmanBankWord[] {
  return ALL_WORDS.filter((item) => {
    if (category && item.category !== category) return false;
    if (difficulty && item.difficulty !== difficulty) return false;
    return true;
  });
}

export function getRandomWord(
  category?: HangmanCategory | null,
  difficulty?: HangmanDifficulty | null,
  rng: () => number = Math.random,
): HangmanBankWord {
  const matches = filterWords(category, difficulty);
  const pool = matches.length > 0 ? matches : ALL_WORDS;
  const index = Math.floor(rng() * pool.length);
  return pool[index] ?? pool[0]!;
}

export function validateCustomWord(rawWord: string): {
  valid: boolean;
  sanitized: string;
  rejection: HangmanRejection | null;
} {
  const sanitized = rawWord.trim().toLowerCase();

  if (sanitized.length < MIN_WORD_LENGTH) {
    return { valid: false, sanitized, rejection: 'too-short' };
  }

  if (sanitized.length > MAX_WORD_LENGTH) {
    return { valid: false, sanitized, rejection: 'too-long' };
  }

  for (const char of sanitized) {
    if (!ALPHABET.includes(char)) {
      return { valid: false, sanitized, rejection: 'letters-only' };
    }
  }

  return { valid: true, sanitized, rejection: null };
}

export function estimateWordDifficulty(word: string): HangmanDifficulty {
  const clean = word.toLowerCase();
  let rareCount = 0;
  for (const char of clean) {
    if (RARE_LETTERS.includes(char)) {
      rareCount++;
    }
  }

  if (clean.length <= 5 && rareCount === 0) {
    return DIFFICULTY_EASY;
  }
  if (clean.length >= 9 || rareCount >= 2) {
    return DIFFICULTY_HARD;
  }
  return DIFFICULTY_MEDIUM;
}
