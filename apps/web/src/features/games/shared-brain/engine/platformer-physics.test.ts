import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CourseElement } from '../types/shared-brain.types';
import { createInitialCharacter, stepPlatformerPhysics } from './platformer-physics';

describe('Shared Brain Platformer Physics', () => {
  const groundPlatform: CourseElement = {
    id: 'floor-1',
    type: 'platform',
    x: 0,
    y: 300,
    width: 800,
    height: 40,
  };

  it('creates initial character with default attributes at spawn', () => {
    const char = createInitialCharacter({ x: 100, y: 200 });
    assert.equal(char.position.x, 100);
    assert.equal(char.position.y, 200);
    assert.equal(char.isGrounded, false);
    assert.equal(char.tokensCollected, 0);
  });

  it('accelerates horizontally upon navigator move inputs', () => {
    const char = createInitialCharacter({ x: 100, y: 258 });
    const res = stepPlatformerPhysics(
      char,
      [groundPlatform],
      { moveLeft: false, moveRight: true, jumpPressed: false, interactPressed: false },
      0.1,
    );

    assert.ok(res.char.velocity.x > 0);
    assert.ok(res.char.position.x > 100);
    assert.equal(res.char.facing, 'right');
  });

  it('lands on ground platform and resets vertical velocity', () => {
    let char = createInitialCharacter({ x: 100, y: 240 });
    // Step forward 0.2s so gravity pulls it onto the platform at y=300 - height(42) = 258
    for (let i = 0; i < 5; i++) {
      const res = stepPlatformerPhysics(
        char,
        [groundPlatform],
        { moveLeft: false, moveRight: false, jumpPressed: false, interactPressed: false },
        0.05,
      );
      char = res.char;
    }

    assert.equal(char.isGrounded, true);
    assert.equal(char.velocity.y, 0);
    assert.equal(char.position.y, 300 - char.height);
  });

  it('executes jump when grounded and sets upward jump velocity', () => {
    const char = createInitialCharacter({ x: 100, y: 300 - 42 });
    char.isGrounded = true;

    const res = stepPlatformerPhysics(
      char,
      [groundPlatform],
      { moveLeft: false, moveRight: false, jumpPressed: true, interactPressed: false },
      0.02,
    );

    assert.equal(res.event.type, 'jump');
    assert.ok(res.char.velocity.y < -400);
  });

  it('collects tokens on overlap and removes them from active elements', () => {
    const token: CourseElement = {
      id: 'token-1',
      type: 'token',
      x: 120,
      y: 250,
      width: 20,
      height: 20,
      value: 10,
    };

    const char = createInitialCharacter({ x: 110, y: 245 });
    const res = stepPlatformerPhysics(
      char,
      [groundPlatform, token],
      { moveLeft: false, moveRight: false, jumpPressed: false, interactPressed: false },
      0.02,
    );

    assert.equal(res.event.type, 'token');
    assert.equal(res.char.tokensCollected, 10);
    const updatedToken = res.modifiedElements.find((e) => e.id === 'token-1');
    assert.equal(updatedToken?.active, false);
  });

  it('interacts with switch levers to toggle linked doors', () => {
    const door: CourseElement = {
      id: 'door-1',
      type: 'door',
      x: 400,
      y: 200,
      width: 20,
      height: 100,
      active: true, // solid
    };

    const lever: CourseElement = {
      id: 'lever-1',
      type: 'switch-lever',
      x: 100,
      y: 250,
      width: 30,
      height: 30,
      linkedDoorId: 'door-1',
      active: false,
    };

    const char = createInitialCharacter({ x: 100, y: 250 });
    const res = stepPlatformerPhysics(
      char,
      [groundPlatform, door, lever],
      { moveLeft: false, moveRight: false, jumpPressed: false, interactPressed: true },
      0.02,
    );

    assert.equal(res.event.type, 'lever');
    const updatedDoor = res.modifiedElements.find((e) => e.id === 'door-1');
    assert.equal(updatedDoor?.active, false); // Door opened!
  });
});
