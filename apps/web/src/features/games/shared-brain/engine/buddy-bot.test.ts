import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CourseElement } from '../types/shared-brain.types';
import { updateBuddyBot } from './buddy-bot';
import { createInitialCharacter } from './platformer-physics';

describe('Shared Brain Buddy Bot', () => {
  const platform: CourseElement = {
    id: 'plat-1',
    type: 'platform',
    x: 0,
    y: 300,
    width: 200,
    height: 50,
  };

  it('triggers jump when human steers toward an edge and ground runs out', () => {
    const char = createInitialCharacter({ x: 180, y: 300 - 42 });
    char.isGrounded = true;
    char.facing = 'right';

    // Human is walking right towards edge of platform at x=200
    const botInput = updateBuddyBot('motor', char, [platform], { moveRight: true }, 0);
    assert.equal(botInput.jumpPressed, true);
    assert.equal(botInput.moveRight, true);
  });

  it('interacts with switch levers when overlapping', () => {
    const lever: CourseElement = {
      id: 'lever-1',
      type: 'switch-lever',
      x: 100,
      y: 250,
      width: 30,
      height: 30,
      active: false,
    };

    const char = createInitialCharacter({ x: 100, y: 250 });
    const botInput = updateBuddyBot('motor', char, [platform, lever], {}, 0);
    assert.equal(botInput.interactPressed, true);
  });

  it('walks right when acting as navigator', () => {
    const char = createInitialCharacter({ x: 50, y: 300 - 42 });
    char.isGrounded = true;

    const botInput = updateBuddyBot('navigator', char, [platform], {}, 0);
    assert.equal(botInput.moveRight, true);
  });
});
