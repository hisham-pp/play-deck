import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateStarRating, calculateTotalScore, getGolfScoreTerm } from './scoring';

describe('Gravity Golf Scoring', () => {
  it('identifies Hole in One on par > 1', () => {
    const term = getGolfScoreTerm(1, 3);
    assert.equal(term.label, 'Hole in One!');
  });

  it('identifies Eagle on 2-under-par', () => {
    const term = getGolfScoreTerm(2, 4);
    assert.equal(term.label, 'Eagle');
  });

  it('identifies Birdie on 1-under-par', () => {
    const term = getGolfScoreTerm(2, 3);
    assert.equal(term.label, 'Birdie');
  });

  it('identifies Par on matching strokes', () => {
    const term = getGolfScoreTerm(2, 2);
    assert.equal(term.label, 'Par');
  });

  it('identifies Bogey on 1-over-par', () => {
    const term = getGolfScoreTerm(3, 2);
    assert.equal(term.label, 'Bogey');
  });

  it('awards 3 stars for at or under par', () => {
    assert.equal(calculateStarRating(1, 2), 3);
    assert.equal(calculateStarRating(2, 2), 3);
  });

  it('awards 2 stars for 1 over par', () => {
    assert.equal(calculateStarRating(3, 2), 2);
  });

  it('calculates aggregated total score across holes', () => {
    const scores = {
      1: { holeNumber: 1, strokes: 1, par: 2, status: 'completed' as const, scoreDifference: -1 },
      2: { holeNumber: 2, strokes: 2, par: 2, status: 'completed' as const, scoreDifference: 0 },
    };
    const summary = calculateTotalScore(scores);
    assert.equal(summary.totalStrokes, 3);
    assert.equal(summary.totalParDiff, -1);
    assert.equal(summary.completedHoles, 2);
    assert.equal(summary.starsEarned, 6); // 3 + 3
  });
});
