import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_RULES,
  VARIANT_ESCALATING_TIMER,
  VARIANT_LAST_TWO_LETTERS,
  VARIANT_LENGTH_REQUIREMENT,
} from './word-chain-constants';
import {
  lapNumber,
  minLengthFor,
  normalizeWord,
  requiredPrefixFor,
  turnSecondsFor,
  validateChainWord,
} from './word-chain-rules';

const KNOWN = new Set(['tiger', 'rabbit', 'trout', 'ox', 'eagle', 'egret']);
const isKnownWord = (word: string) => KNOWN.has(word);

function validate(word: string, overrides: Partial<Parameters<typeof validateChainWord>[0]> = {}) {
  return validateChainWord({
    word,
    requiredPrefix: 't',
    usedWords: new Set<string>(),
    baseMinLength: 3,
    minLength: 3,
    category: null,
    isKnownWord,
    ...overrides,
  });
}

describe('normalizeWord', () => {
  it('lower-cases, trims and strips non-letters', () => {
    assert.equal(normalizeWord('  Ti-ger! '), 'tiger');
  });
});

describe('requiredPrefixFor', () => {
  it('takes the last letter by default', () => {
    assert.equal(requiredPrefixFor('tiger', DEFAULT_RULES.variant), 'r');
  });

  it('takes the last two letters under the two-letter variant', () => {
    assert.equal(requiredPrefixFor('tiger', VARIANT_LAST_TWO_LETTERS), 'er');
  });

  it('never asks for more letters than the word has', () => {
    assert.equal(requiredPrefixFor('a', VARIANT_LAST_TWO_LETTERS), 'a');
  });

  it('returns an empty prefix for an empty word', () => {
    assert.equal(requiredPrefixFor('   ', DEFAULT_RULES.variant), '');
  });
});

describe('validateChainWord', () => {
  it('accepts a valid word', () => {
    assert.deepEqual(validate('Tiger'), { ok: true, word: 'tiger' });
  });

  it('rejects words below the base minimum', () => {
    assert.deepEqual(validate('ox'), { ok: false, reason: 'too-short' });
  });

  it('separates the round floor from the base floor', () => {
    assert.deepEqual(validate('trout', { minLength: 6 }), {
      ok: false,
      reason: 'too-short-for-round',
    });
  });

  it('rejects a word that ignores the required prefix', () => {
    assert.deepEqual(validate('rabbit'), { ok: false, reason: 'wrong-start' });
  });

  it('rejects a repeat', () => {
    assert.deepEqual(validate('tiger', { usedWords: new Set(['tiger']) }), {
      ok: false,
      reason: 'repeated',
    });
  });

  it('rejects a word outside the locked category', () => {
    assert.deepEqual(validate('trout', { category: 'places' }), {
      ok: false,
      reason: 'wrong-category',
    });
  });

  it('accepts a word inside the locked category', () => {
    assert.deepEqual(validate('trout', { category: 'animals' }), { ok: true, word: 'trout' });
  });

  it('rejects a word the dictionary does not know', () => {
    assert.deepEqual(validate('tigerish'), { ok: false, reason: 'not-a-word' });
  });

  it('reports the prefix problem before the dictionary one', () => {
    assert.deepEqual(validate('qqqqq'), { ok: false, reason: 'wrong-start' });
  });
});

describe('lap-driven variants', () => {
  it('counts a lap per full pass of the table', () => {
    assert.equal(lapNumber(0, 4), 0);
    assert.equal(lapNumber(3, 4), 0);
    assert.equal(lapNumber(4, 4), 1);
    assert.equal(lapNumber(9, 4), 2);
  });

  it('keeps the clock fixed unless the escalating variant is on', () => {
    assert.equal(turnSecondsFor(DEFAULT_RULES, 5), DEFAULT_RULES.startingSeconds);
  });

  it('shortens the clock by a second per lap and stops at the floor', () => {
    const rules = { ...DEFAULT_RULES, variant: VARIANT_ESCALATING_TIMER, startingSeconds: 10 };
    assert.equal(turnSecondsFor(rules, 0), 10);
    assert.equal(turnSecondsFor(rules, 3), 7);
    assert.equal(turnSecondsFor(rules, 50), 4);
  });

  it('grows the minimum length per lap up to the cap', () => {
    const rules = { ...DEFAULT_RULES, variant: VARIANT_LENGTH_REQUIREMENT };
    assert.equal(minLengthFor(rules, 0), 3);
    assert.equal(minLengthFor(rules, 2), 5);
    assert.equal(minLengthFor(rules, 40), 8);
  });
});
