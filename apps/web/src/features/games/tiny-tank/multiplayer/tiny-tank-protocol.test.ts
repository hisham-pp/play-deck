import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isTinyTankMessage } from './tiny-tank-protocol';

describe('tiny-tank-protocol', () => {
  it('validates genuine Tiny Tank wire messages', () => {
    const validJoin = {
      type: 'TINY_TANK_JOIN',
      payload: { playerId: 'p1', playerName: 'Cadet', color: '#06b6d4' },
    };
    assert.equal(isTinyTankMessage(validJoin), true);

    const validFire = {
      type: 'TINY_TANK_FIRE',
      payload: {
        playerId: 'p1',
        weapon: 'cannon',
        position: { x: 100, y: 100 },
        angle: 1.57,
      },
    };
    assert.equal(isTinyTankMessage(validFire), true);
  });

  it('rejects invalid or malformed messages', () => {
    assert.equal(isTinyTankMessage(null), false);
    assert.equal(isTinyTankMessage(undefined), false);
    assert.equal(isTinyTankMessage('TINY_TANK_JOIN'), false);
    assert.equal(isTinyTankMessage({ type: 'MAGNET_MAYHEM_PULL' }), false);
    assert.equal(isTinyTankMessage({ type: 'TINY_TANK_JOIN', payload: null }), false);
  });
});
