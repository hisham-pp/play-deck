import type { AnagramRejection } from '../types/anagram-sprint.types';
import { anagramKey, solutionsFor } from './anagram-word-bank';

export interface AnagramCheck {
  ok: boolean;
  word: string;
  reason?: AnagramRejection;
}

/** Trims, lower-cases and drops anything that is not a letter. */
export function normalizeAnswer(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * A guess clears the round when it is a real solution for those letters. The
 * dealt answer always counts, and so does any other bank word built from the
 * same letters — "listen" should never lose to "silent" on a technicality.
 *
 * A guess that merely rearranges the letters into something that is not a
 * known word is rejected as a wrong attempt; a guess built from the wrong
 * letters entirely is rejected without spending one, since it is a typo rather
 * than a try.
 */
export function checkAnswer(raw: string, answer: string): AnagramCheck {
  const word = normalizeAnswer(raw);
  if (!word) return { ok: false, word, reason: 'wrong-letters' };

  if (anagramKey(word) !== anagramKey(answer)) {
    return { ok: false, word, reason: 'wrong-letters' };
  }

  const solutions = solutionsFor(answer);
  if (!solutions.includes(word)) {
    return { ok: false, word, reason: 'not-a-solution' };
  }

  return { ok: true, word };
}

/** Whether a wrong guess should cost one of the seat's capped attempts. */
export function costsAnAttempt(reason: AnagramRejection | undefined): boolean {
  return reason === 'not-a-solution';
}

/** The clue shown when hints are on: category, length and opening letter. */
export function hintFor(answer: string, hint: string): string {
  return `${hint} · ${answer.length} letters · starts with "${answer[0]?.toUpperCase() ?? ''}"`;
}
