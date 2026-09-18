import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ArenaDefinition, ShadowTagInput, ShadowTagRunner } from '../types/shadow-tag.types';
import { resolveCollisions, speedFor, stepRunner } from './movement';
import { PLAYER_RADIUS, PLAYER_SPEED, SNEAK_SPEED_FACTOR } from './shadow-tag-constants';

const ARENA: ArenaDefinition = {
  id: 'test',
  name: 'Test',
  width: 600,
  height: 400,
  obstacles: [{ x: 250, y: 150, w: 100, h: 100 }],
  props: [],
  lights: [],
  spawns: [{ x: 50, y: 200 }],
};

function runner(x: number, y: number): ShadowTagRunner {
  return {
    id: 'p1',
    pos: { x, y },
    vel: { x: 0, y: 0 },
    facing: 0,
    sneaking: false,
    strideMs: 0,
    immuneUntilMs: 0,
    interactReadyAtMs: 0,
    score: 0,
    tags: 0,
    timesTagged: 0,
    itMs: 0,
    evasionMs: 0,
    bestEvasionMs: 0,
    connected: true,
  };
}

function input(overrides: Partial<ShadowTagInput> = {}): ShadowTagInput {
  return { moveX: 0, moveY: 0, sneak: false, block: false, redirect: false, ...overrides };
}

describe('movement', () => {
  it('sneaking costs most of your speed', () => {
    assert.equal(speedFor(input()), PLAYER_SPEED);
    assert.equal(speedFor(input({ sneak: true })), PLAYER_SPEED * SNEAK_SPEED_FACTOR);
  });

  it('accelerates toward the held direction rather than teleporting', () => {
    const player = runner(100, 200);
    stepRunner(player, input({ moveX: 1 }), ARENA, 1 / 60);
    assert.ok(player.vel.x > 0 && player.vel.x < PLAYER_SPEED, 'eases up to speed');
    assert.ok(player.pos.x > 100);
  });

  it('normalises diagonals so corner-running is not faster', () => {
    const straight = runner(100, 200);
    const diagonal = runner(100, 200);
    for (let i = 0; i < 60; i++) {
      stepRunner(straight, input({ moveX: 1 }), ARENA, 1 / 60);
      stepRunner(diagonal, input({ moveX: 1, moveY: 1 }), ARENA, 1 / 60);
    }
    const straightSpeed = Math.hypot(straight.vel.x, straight.vel.y);
    const diagonalSpeed = Math.hypot(diagonal.vel.x, diagonal.vel.y);
    assert.ok(Math.abs(straightSpeed - diagonalSpeed) < 1);
  });

  it('keeps runners out of pillars and inside the arena', () => {
    const player = runner(200, 200);
    for (let i = 0; i < 120; i++) stepRunner(player, input({ moveX: 1 }), ARENA, 1 / 60);
    assert.ok(
      player.pos.x <= 250 - PLAYER_RADIUS + 0.01,
      `stopped at the pillar (${player.pos.x})`,
    );

    const edge = runner(590, 395);
    resolveCollisions(edge.pos, ARENA);
    assert.equal(edge.pos.x, ARENA.width - PLAYER_RADIUS);
    assert.equal(edge.pos.y, ARENA.height - PLAYER_RADIUS);
  });

  it('pushes a runner trapped dead centre of a pillar out the nearest face', () => {
    const pos = { x: 300, y: 190 };
    resolveCollisions(pos, ARENA);
    assert.equal(pos.y, 150 - PLAYER_RADIUS);
  });

  it('leaves tracks when jogging but none when sneaking', () => {
    const jogger = runner(100, 200);
    const sneaker = runner(100, 200);
    for (let i = 0; i < 30; i++) {
      stepRunner(jogger, input({ moveX: 1 }), ARENA, 1 / 60);
      stepRunner(sneaker, input({ moveX: 1, sneak: true }), ARENA, 1 / 60);
    }
    assert.ok(jogger.strideMs > 0);
    assert.equal(sneaker.strideMs, 0);
  });
});
