import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  createInitialConveyorState,
  createMachineObject,
  spawnNextObject,
  tickConveyorGame,
  updateSegmentControl,
} from '../engine/conveyor-engine';
import { CONVEYOR_LAYOUTS } from '../engine/conveyor-layouts';

describe('Conveyor Engine — State, Scoring & Controls', () => {
  const layout = CONVEYOR_LAYOUTS[0];

  test('creates machine objects with expected physical attributes for all 5 types', () => {
    const std = createMachineObject('standard', 0, 0, 0, 0);
    const bouncy = createMachineObject('bouncy', 0, 0, 0, 0);
    const fragile = createMachineObject('fragile', 0, 0, 0, 0);
    const heavy = createMachineObject('heavy', 0, 0, 0, 0);
    const explosive = createMachineObject('explosive', 0, 0, 0, 0);

    assert.equal(std.mass, 1.0);
    assert.equal(bouncy.restitution, 0.85);
    assert.equal(fragile.durability, 140);
    assert.ok(heavy.mass > std.mass);
    assert.equal(explosive.timer, 15.0);
  });

  test('initializes conveyor state with player platforms and glyphs', () => {
    const players = [
      { id: 'p1', name: 'Alice', isBot: false },
      { id: 'p2', name: 'Bob', isBot: true },
    ];
    const state = createInitialConveyorState(layout, players);

    assert.equal(state.phase, 'ready');
    assert.equal(state.segments.length, layout.defaultPlatforms.length);
    assert.equal(state.segments[0].assignedPlayerId, 'p1');
    assert.equal(state.segments[0].glyph, '●');
    assert.equal(state.segments[1].glyph, '◆');
    assert.equal(state.segments[1].isBot, true);
  });

  test('updates segment tilt, elevation, and speed with clamping', () => {
    let state = createInitialConveyorState(layout);
    state = updateSegmentControl(state, 0, {
      angleDelta: 0.1,
      elevationDelta: -20,
      speedDelta: 30,
    });

    assert.ok(state.segments[0].targetAngle > 0.08);
    assert.equal(state.segments[0].targetElevation, -20);
    assert.equal(state.segments[0].targetSpeed, 70);
  });

  test('spawns new object from layout pool', () => {
    let state = createInitialConveyorState(layout);
    state = spawnNextObject(state);

    assert.equal(state.objects.length, 1);
    assert.equal(state.objects[0].status, 'active');
  });

  test('ticks running state, accumulates score and increments combo streak on delivery', () => {
    const state = createInitialConveyorState(layout);
    state.phase = 'running';

    // Place an object directly inside target zone
    const target = layout.targetZone;
    const deliveredObj = createMachineObject('standard', target.x + 10, target.y + 10, 0, 0);
    deliveredObj.status = 'delivered';
    state.objects = [deliveredObj];

    const nextState = tickConveyorGame(state, 0.016);
    assert.equal(nextState.deliveredCount, 1);
    assert.equal(nextState.comboStreak, 1);
    assert.ok(nextState.score >= 100);
    assert.equal(nextState.objects.length, 0);
  });

  test('resets streak to 0 and increments dropped/broken count on object loss', () => {
    const state = createInitialConveyorState(layout);
    state.phase = 'running';
    state.comboStreak = 4;

    const brokenObj = createMachineObject('fragile', 0, 0, 0, 0);
    brokenObj.status = 'broken';
    state.objects = [brokenObj];

    const nextState = tickConveyorGame(state, 0.016);
    assert.equal(nextState.brokenCount, 1);
    assert.equal(nextState.comboStreak, 0);
  });

  test('transitions to wave_cleared once delivery quota is met', () => {
    const state = createInitialConveyorState(layout);
    state.phase = 'running';
    state.deliveredCount = layout.targetDeliveries - 1;

    const target = layout.targetZone;
    const obj = createMachineObject('standard', target.x + 5, target.y + 5, 0, 0);
    obj.status = 'delivered';
    state.objects = [obj];

    const nextState = tickConveyorGame(state, 0.016);
    assert.equal(nextState.phase, 'wave_cleared');
  });
});
