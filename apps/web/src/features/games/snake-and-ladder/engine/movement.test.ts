import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isHeldAtStart, resolveTurn, resolveWalk } from './movement';
import { DEFAULT_RULE_SETTINGS, FINAL_SQUARE } from './snake-ladder-constants';

const exact = DEFAULT_RULE_SETTINGS;
const bounce = { ...DEFAULT_RULE_SETTINGS, requireExactRollToFinish: false };
const sixToStart = { ...DEFAULT_RULE_SETTINGS, requireSixToStart: true };

describe('resolveWalk', () => {
  it('walks the dice out from the current square', () => {
    assert.deepEqual(resolveWalk(10, 4, exact), { walkTo: 14, overshot: false });
  });

  it('enters the board from the start pocket', () => {
    assert.deepEqual(resolveWalk(0, 3, exact), { walkTo: 3, overshot: false });
  });

  it('forfeits an overshoot when an exact roll is required', () => {
    assert.deepEqual(resolveWalk(97, 5, exact), { walkTo: 97, overshot: true });
  });

  it('bounces back off 100 when exact finishing is off', () => {
    assert.deepEqual(resolveWalk(97, 5, bounce), { walkTo: 98, overshot: false });
  });

  it('lands exactly on 100 either way', () => {
    assert.deepEqual(resolveWalk(97, 3, exact), { walkTo: FINAL_SQUARE, overshot: false });
    assert.deepEqual(resolveWalk(97, 3, bounce), { walkTo: FINAL_SQUARE, overshot: false });
  });
});

describe('isHeldAtStart', () => {
  it('holds a token in the pocket until a six when the rule is on', () => {
    assert.equal(isHeldAtStart(0, 3, sixToStart), true);
    assert.equal(isHeldAtStart(0, 6, sixToStart), false);
  });

  it('never holds a token once it is on the board', () => {
    assert.equal(isHeldAtStart(7, 3, sixToStart), false);
  });

  it('is inert when the rule is off', () => {
    assert.equal(isHeldAtStart(0, 3, exact), false);
  });
});

describe('resolveTurn', () => {
  it('climbs a ladder landed on', () => {
    const result = resolveTurn(5, 4, exact);
    assert.equal(result.walkTo, 9);
    assert.deepEqual(result.jump, { kind: 'ladder', from: 9, to: 31 });
    assert.equal(result.to, 31);
  });

  it('slides down a snake landed on', () => {
    const result = resolveTurn(12, 4, exact);
    assert.equal(result.walkTo, 16);
    assert.deepEqual(result.jump, { kind: 'snake', from: 16, to: 6 });
    assert.equal(result.to, 6);
  });

  it('wins by landing exactly on 100', () => {
    const result = resolveTurn(96, 4, exact);
    assert.equal(result.to, FINAL_SQUARE);
    assert.equal(result.won, true);
  });

  it('wins via the ladder that ends on 100', () => {
    const result = resolveTurn(78, 2, exact);
    assert.deepEqual(result.jump, { kind: 'ladder', from: 80, to: 100 });
    assert.equal(result.won, true);
  });

  it('leaves the token put on an overshoot and takes no jump', () => {
    const result = resolveTurn(98, 4, exact);
    assert.equal(result.to, 98);
    assert.equal(result.overshot, true);
    assert.equal(result.jump, null);
    assert.equal(result.won, false);
  });

  it('reports a token held back by the six-to-start rule', () => {
    const result = resolveTurn(0, 2, sixToStart);
    assert.equal(result.blockedAtStart, true);
    assert.equal(result.to, 0);
  });

  it('applies a jump found on a bounce-back square', () => {
    // 99 + 3 bounces to 98, which is a snake head down to 78.
    const result = resolveTurn(99, 3, bounce);
    assert.equal(result.walkTo, 98);
    assert.equal(result.to, 78);
  });
});
