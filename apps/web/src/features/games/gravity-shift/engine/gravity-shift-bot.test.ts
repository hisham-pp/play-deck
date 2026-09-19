import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CourseDefinition } from '../types/gravity-shift.types';
import { createInitialCharacter } from './gravity-physics';
import { computeBotDecision, computeNextTarget } from './gravity-shift-bot';

describe('gravity-shift-bot', () => {
  const mockCourse: CourseDefinition = {
    id: 'test-bot-course',
    name: 'Bot Course',
    description: 'Course for bot testing',
    worldBounds: { width: 1500, height: 1000 },
    spawnPoint: { x: 100, y: 900 },
    initialGravity: 'down',
    elements: [
      { id: 'p1', type: 'platform', x: 50, y: 950, width: 400, height: 40 },
      { id: 'cp1', type: 'checkpoint', x: 400, y: 900, width: 40, height: 50, order: 1 },
      { id: 'cp2', type: 'checkpoint', x: 800, y: 900, width: 40, height: 50, order: 2 },
      { id: 'finish', type: 'finish', x: 1200, y: 900, width: 60, height: 60 },
    ],
  };

  it('selects the first unreached checkpoint as next target', () => {
    const char = createInitialCharacter({ x: 100, y: 900 });
    char.checkpointsPassed = 0;

    const target = computeNextTarget(char, mockCourse);
    assert.strictEqual(target.id, 'cp1');
  });

  it('advances target to next checkpoint when current is passed', () => {
    const char = createInitialCharacter({ x: 500, y: 900 });
    char.checkpointsPassed = 1;

    const target = computeNextTarget(char, mockCourse);
    assert.strictEqual(target.id, 'cp2');
  });

  it('targets the finish line when all checkpoints are cleared', () => {
    const char = createInitialCharacter({ x: 900, y: 900 });
    char.checkpointsPassed = 2;

    const target = computeNextTarget(char, mockCourse);
    assert.strictEqual(target.id, 'finish');
  });

  it('computes positive movement when target is to the right with down gravity', () => {
    const char = createInitialCharacter({ x: 100, y: 900 });
    const decision = computeBotDecision({
      character: char,
      currentGravity: 'down',
      course: mockCourse,
    });

    assert.strictEqual(decision.input.movePositive, true);
    assert.strictEqual(decision.input.moveNegative, false);
  });
});
