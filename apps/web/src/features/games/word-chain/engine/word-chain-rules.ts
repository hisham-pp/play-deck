import type {
  WordChainCategory,
  WordChainRejection,
  WordChainRules,
  WordChainVariant,
} from '../types/word-chain.types';
import { isInCategory } from './word-chain-categories';
import {
  ESCALATION_FLOOR_SECONDS,
  ESCALATION_STEP_SECONDS,
  LENGTH_REQUIREMENT_CAP,
  MIN_WORD_LENGTH,
  VARIANT_CATEGORY_LOCK,
  VARIANT_ESCALATING_TIMER,
  VARIANT_LAST_TWO_LETTERS,
  VARIANT_LENGTH_REQUIREMENT,
} from './word-chain-constants';

export type ChainValidation =
  | { readonly ok: true; readonly word: string }
  | { readonly ok: false; readonly reason: WordChainRejection };

export interface ChainValidationInput {
  readonly word: string;
  readonly requiredPrefix: string;
  readonly usedWords: ReadonlySet<string>;
  /** The floor imposed by the rules themselves, before any variant raises it. */
  readonly baseMinLength: number;
  /** The floor for this particular lap — never below `baseMinLength`. */
  readonly minLength: number;
  readonly category: WordChainCategory | null;
  readonly isKnownWord: (word: string) => boolean;
}

/** Trims, lower-cases and drops anything that is not a letter. */
export function normalizeWord(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** How many letters of the previous word the next one must begin with. */
export function prefixLength(variant: WordChainVariant): number {
  return variant === VARIANT_LAST_TWO_LETTERS ? 2 : 1;
}

/**
 * The prefix the next word must start with. A one-letter word under the
 * two-letter variant can only ever hand over the single letter it has.
 */
export function requiredPrefixFor(word: string, variant: WordChainVariant): string {
  const normalized = normalizeWord(word);
  if (!normalized) return '';
  const size = Math.min(prefixLength(variant), normalized.length);
  return normalized.slice(normalized.length - size);
}

/** Completed laps of the table, used by the variants that ramp up over time. */
export function lapNumber(turnCount: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return Math.floor(turnCount / playerCount);
}

/** Seconds on the clock for the upcoming turn. */
export function turnSecondsFor(rules: WordChainRules, lap: number): number {
  if (rules.variant !== VARIANT_ESCALATING_TIMER) return rules.startingSeconds;
  const reduced = rules.startingSeconds - lap * ESCALATION_STEP_SECONDS;
  return Math.max(ESCALATION_FLOOR_SECONDS, reduced);
}

/** Minimum word length for the upcoming turn. */
export function minLengthFor(rules: WordChainRules, lap: number): number {
  const base = Math.max(MIN_WORD_LENGTH, rules.minWordLength);
  if (rules.variant !== VARIANT_LENGTH_REQUIREMENT) return base;
  return Math.min(LENGTH_REQUIREMENT_CAP, base + lap);
}

export function activeCategory(rules: WordChainRules): WordChainCategory | null {
  return rules.variant === VARIANT_CATEGORY_LOCK ? rules.category : null;
}

/**
 * Checks run cheapest-first so the player gets the most actionable complaint:
 * length and prefix are visible on screen, the dictionary lookup is not.
 */
export function validateChainWord(input: ChainValidationInput): ChainValidation {
  const word = normalizeWord(input.word);

  if (word.length < input.baseMinLength) return { ok: false, reason: 'too-short' };
  if (word.length < input.minLength) return { ok: false, reason: 'too-short-for-round' };
  if (input.requiredPrefix && !word.startsWith(input.requiredPrefix)) {
    return { ok: false, reason: 'wrong-start' };
  }
  if (input.usedWords.has(word)) return { ok: false, reason: 'repeated' };
  if (input.category && !isInCategory(word, input.category)) {
    return { ok: false, reason: 'wrong-category' };
  }
  if (!input.isKnownWord(word)) return { ok: false, reason: 'not-a-word' };

  return { ok: true, word };
}
