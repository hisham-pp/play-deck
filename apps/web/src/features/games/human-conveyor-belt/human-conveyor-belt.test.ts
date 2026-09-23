import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HUMAN_CONVEYOR_BELT_LAYOUTS, HUMAN_CONVEYOR_BELT_OBJECTS } from './game-config';
import { createRouteScore, nextPhaseIndex, scoreForDrop } from './game-logic';

describe('Human Conveyor Belt game shell', () => {
  it('registers a playable conveyor layout and object mix', () => {
    assert.ok(HUMAN_CONVEYOR_BELT_LAYOUTS.length >= 4, 'layout set should include multiple phases');
    assert.equal(HUMAN_CONVEYOR_BELT_LAYOUTS[0].name, 'Launch lane');
    assert.ok(
      HUMAN_CONVEYOR_BELT_OBJECTS.length >= 4,
      'object mix should include multiple payload types',
    );
    assert.equal(HUMAN_CONVEYOR_BELT_OBJECTS[0].type, 'Crate');
  });

  it('scores successful deliveries and advances the route', () => {
    const score = createRouteScore({ target: 24, streak: 2, objectValue: 12 });

    assert.equal(score, 24 + 2 * 2 + 12);
    assert.equal(nextPhaseIndex(2, 4), 3);
    assert.equal(scoreForDrop(10, 4), 6);
  });
});
