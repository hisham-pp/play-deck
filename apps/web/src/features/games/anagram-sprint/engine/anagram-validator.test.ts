import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkAnswer, costsAnAttempt, hintFor, normalizeAnswer } from './anagram-validator';
import { ANAGRAM_BANK, anagramKey, solutionsFor } from './anagram-word-bank';

describe('Anagram Sprint — answer validation', () => {
  it('accepts the dealt answer', () => {
    assert.equal(checkAnswer('garden', 'garden').ok, true);
  });

  it('ignores case, spaces and punctuation', () => {
    assert.equal(normalizeAnswer('  Gar-den!  '), 'garden');
    assert.equal(checkAnswer(' GARDEN ', 'garden').ok, true);
  });

  it('rejects a guess built from the wrong letters', () => {
    const result = checkAnswer('gardens', 'garden');
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'wrong-letters');
  });

  it('does not spend an attempt on a wrong-letter typo', () => {
    assert.equal(costsAnAttempt('wrong-letters'), false);
    assert.equal(costsAnAttempt('not-a-solution'), true);
  });

  it('rejects a rearrangement that is not a word', () => {
    const result = checkAnswer('nedrag', 'garden');
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'not-a-solution');
  });

  it('rejects an empty guess', () => {
    assert.equal(checkAnswer('   ', 'garden').ok, false);
  });

  it('accepts any other bank word made of the same letters', () => {
    const shared = ANAGRAM_BANK.find((entry) => solutionsFor(entry.word).length > 1);
    if (!shared) return;
    for (const alternative of solutionsFor(shared.word)) {
      assert.equal(checkAnswer(alternative, shared.word).ok, true);
    }
  });

  it('builds a hint from the clue, the length and the opening letter', () => {
    assert.equal(
      hintFor('garden', 'Where the tomatoes grow'),
      'Where the tomatoes grow · 6 letters · starts with "G"',
    );
  });
});

describe('Anagram Sprint — word bank', () => {
  it('has no duplicate words', () => {
    const words = ANAGRAM_BANK.map((entry) => entry.word);
    assert.equal(new Set(words).size, words.length);
  });

  it('ships only lower-case letters, so the scramble is safe to display', () => {
    for (const entry of ANAGRAM_BANK) {
      assert.match(entry.word, /^[a-z]{4,}$/, `${entry.word} is not a plain lower-case word`);
      assert.ok(entry.hint.length > 0, `${entry.word} has no hint`);
    }
  });

  it('indexes every word under its own letters', () => {
    for (const entry of ANAGRAM_BANK) {
      assert.ok(solutionsFor(entry.word).includes(entry.word));
      assert.equal(anagramKey(entry.word).length, entry.word.length);
    }
  });
});
