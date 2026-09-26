import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateRoundOutcome, nextRoundNumber, resolvePlayerChoice } from './game-logic';

describe('Trust or Betray game shell', () => {
  it('rewards cooperative play and punishes betrayal', () => {
    const allCooperate = calculateRoundOutcome({ coopCount: 4, betrayCount: 0, round: 1 });
    const oneBetray = calculateRoundOutcome({ coopCount: 3, betrayCount: 1, round: 2 });
    const multipleBetray = calculateRoundOutcome({ coopCount: 2, betrayCount: 2, round: 3 });

    assert.equal(allCooperate.groupReward, 120);
    assert.equal(allCooperate.betrayBonus, 0);
    assert.equal(oneBetray.groupReward, 20);
    assert.equal(oneBetray.betrayBonus, 42);
    assert.equal(multipleBetray.groupReward, 0);
    assert.equal(multipleBetray.betrayBonus, 0);
    assert.equal(nextRoundNumber(3), 4);
    assert.equal(resolvePlayerChoice('cooperate', 1, 3), 30);
    assert.equal(resolvePlayerChoice('betray', 1, 3), 48);
  });
});
