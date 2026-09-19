import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CourseDefinition } from '../types/gravity-shift.types';
import {
  createInitialCharacter,
  getGravityVector,
  GRAVITY_MAGNITUDE,
  rotateGravityClockwise,
  rotateGravityCounterClockwise,
  updateGravityCharacterPhysics,
} from './gravity-physics';

describe('gravity-physics', () => {
  describe('gravity vectors & rotations', () => {
    it('returns correct gravity vector for each direction', () => {
      assert.deepStrictEqual(getGravityVector('down'), { x: 0, y: GRAVITY_MAGNITUDE });
      assert.deepStrictEqual(getGravityVector('up'), { x: 0, y: -GRAVITY_MAGNITUDE });
      assert.deepStrictEqual(getGravityVector('left'), { x: -GRAVITY_MAGNITUDE, y: 0 });
      assert.deepStrictEqual(getGravityVector('right'), { x: GRAVITY_MAGNITUDE, y: 0 });
    });

    it('rotates clockwise correctly through all 4 directions', () => {
      assert.strictEqual(rotateGravityClockwise('down'), 'left');
      assert.strictEqual(rotateGravityClockwise('left'), 'up');
      assert.strictEqual(rotateGravityClockwise('up'), 'right');
      assert.strictEqual(rotateGravityClockwise('right'), 'down');
    });

    it('rotates counter-clockwise correctly through all 4 directions', () => {
      assert.strictEqual(rotateGravityCounterClockwise('down'), 'right');
      assert.strictEqual(rotateGravityCounterClockwise('right'), 'up');
      assert.strictEqual(rotateGravityCounterClockwise('up'), 'left');
      assert.strictEqual(rotateGravityCounterClockwise('left'), 'down');
    });
  });

  describe('character creation', () => {
    it('initializes character with expected default states', () => {
      const char = createInitialCharacter({ x: 100, y: 200 });
      assert.deepStrictEqual(char.position, { x: 100, y: 200 });
      assert.deepStrictEqual(char.velocity, { x: 0, y: 0 });
      assert.strictEqual(char.isGrounded, false);
      assert.strictEqual(char.shiftCharges, 3);
      assert.strictEqual(char.reachedFinish, false);
    });
  });

  describe('updateGravityCharacterPhysics', () => {
    const course: CourseDefinition = {
      id: 'test-course',
      name: 'Test Course',
      description: 'Testing',
      worldBounds: { width: 1000, height: 1000 },
      spawnPoint: { x: 50, y: 50 },
      initialGravity: 'down',
      elements: [
        {
          id: 'ground',
          type: 'platform',
          x: 0,
          y: 200,
          width: 500,
          height: 40,
        },
        {
          id: 'hazard-1',
          type: 'hazard',
          x: 600,
          y: 200,
          width: 50,
          height: 40,
        },
        {
          id: 'bounce-1',
          type: 'bounce-pad',
          x: 300,
          y: 190,
          width: 40,
          height: 10,
        },
        {
          id: 'finish-1',
          type: 'finish',
          x: 800,
          y: 150,
          width: 50,
          height: 50,
        },
      ],
    };

    it('applies downward gravity when falling', () => {
      const char = createInitialCharacter({ x: 100, y: 50 });
      const result = updateGravityCharacterPhysics(
        char,
        course,
        'down',
        { moveNegative: false, movePositive: false, jump: false },
        0.05,
      );

      assert.ok(result.character.position.y > 50);
      assert.ok(result.character.velocity.y > 0);
    });

    it('lands and stops on a solid platform', () => {
      let char = createInitialCharacter({ x: 100, y: 150 });
      for (let i = 0; i < 20; i++) {
        const res = updateGravityCharacterPhysics(
          char,
          course,
          'down',
          { moveNegative: false, movePositive: false, jump: false },
          0.05,
        );
        char = res.character;
      }

      assert.strictEqual(char.isGrounded, true);
      assert.ok(Math.abs(char.position.y + char.height - 200) < 0.5);
      assert.strictEqual(char.velocity.y, 0);
    });

    it('triggers jump impulse when grounded', () => {
      const char = createInitialCharacter({ x: 100, y: 168 });
      char.isGrounded = true;
      char.coyoteTime = 0.1;

      const result = updateGravityCharacterPhysics(
        char,
        course,
        'down',
        { moveNegative: false, movePositive: false, jump: true },
        0.016,
      );

      assert.strictEqual(result.jumpTriggered, true);
      assert.ok(result.character.velocity.y < 0);
    });

    it('detects hazard collisions and flags hazardHit', () => {
      const char = createInitialCharacter({ x: 610, y: 200 });
      const result = updateGravityCharacterPhysics(
        char,
        course,
        'down',
        { moveNegative: false, movePositive: false, jump: false },
        0.016,
      );

      assert.strictEqual(result.hazardHit, true);
      assert.deepStrictEqual(result.character.position, char.respawnPoint);
    });

    it('detects finish element crossing', () => {
      const char = createInitialCharacter({ x: 810, y: 160 });
      const result = updateGravityCharacterPhysics(
        char,
        course,
        'down',
        { moveNegative: false, movePositive: false, jump: false },
        0.016,
      );

      assert.strictEqual(result.reachedFinish, true);
      assert.strictEqual(result.character.reachedFinish, true);
    });
  });
});
