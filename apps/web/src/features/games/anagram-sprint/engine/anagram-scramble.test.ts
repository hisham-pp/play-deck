import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRandom, reshuffle, scrambleWord, shuffle } from './anagram-scramble';
import { anagramKey } from './anagram-word-bank';

describe('Anagram Sprint — scrambling', () => {
  it('keeps every letter of the word', () => {
    const scrambled = scrambleWord('treasure', createRandom(42));
    assert.equal(anagramKey(scrambled), anagramKey('treasure'));
  });

  it('never hands the word straight back', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      assert.notEqual(scrambleWord('garden', createRandom(seed)), 'garden');
    }
  });

  it('leaves a word with a single distinct letter alone', () => {
    assert.equal(scrambleWord('aaa', createRandom(7)), 'aaa');
  });

  it('reshuffles away from the arrangement already on screen', () => {
    const random = createRandom(11);
    const first = scrambleWord('lantern', random);
    const second = reshuffle('lantern', first, random);
    assert.notEqual(second, first);
    assert.notEqual(second, 'lantern');
    assert.equal(anagramKey(second), anagramKey('lantern'));
  });

  it('is identical for the same seed, which is what keeps peers in step', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], createRandom(2026));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], createRandom(2026));
    assert.deepEqual(a, b);
  });

  it('differs between seeds', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], createRandom(1));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], createRandom(2));
    assert.notDeepEqual(a, b);
  });
});
