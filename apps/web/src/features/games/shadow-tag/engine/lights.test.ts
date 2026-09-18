import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LightSource, ShadowTagRunner } from '../types/shadow-tag.types';
import { advanceLights, applyLightInteraction, interactCooldownSec, nearestLight } from './lights';
import {
  LIGHT_BLOCK_MS,
  LIGHT_INTERACT_COOLDOWN_MS,
  LIGHT_INTERACT_RANGE,
} from './shadow-tag-constants';

function lamp(id: string, x: number, y: number): LightSource {
  return {
    id,
    orbit: { cx: x, cy: y, rx: 100, ry: 60 },
    angle: 0,
    speed: 0.5,
    pos: { x: x + 100, y },
    intensity: 1,
    blockedUntilMs: 0,
    reach: 300,
    hue: 40,
  };
}

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

describe('light patrols', () => {
  it('walks the lamp around its ellipse', () => {
    const lights = [lamp('a', 300, 300)];
    advanceLights(lights, 0.5, 0);
    assert.ok(Math.abs(lights[0].angle - 0.25) < 1e-9);
    assert.ok(lights[0].pos.y > 300, 'moved off the major axis');
  });

  it('fades to dark while covered and back once the cover lapses', () => {
    const lights = [lamp('a', 300, 300)];
    lights[0].blockedUntilMs = 2000;
    for (let i = 0; i < 40; i++) advanceLights(lights, 1 / 60, 500);
    assert.equal(lights[0].intensity, 0);

    for (let i = 0; i < 60; i++) advanceLights(lights, 1 / 60, 3000);
    assert.equal(lights[0].intensity, 1);
  });
});

describe('light interaction', () => {
  it('only reaches a lamp you are standing next to', () => {
    const lights = [lamp('a', 300, 300)];
    assert.equal(nearestLight({ x: 400, y: 300 }, lights)?.id, 'a');
    assert.equal(nearestLight({ x: 400 + LIGHT_INTERACT_RANGE + 5, y: 300 }, lights), null);
  });

  it('covers the nearest lamp and locks the player out for a while', () => {
    const lights = [lamp('a', 300, 300)];
    const player = runner(400, 300);
    const result = applyLightInteraction(player, lights, true, false, 1000);

    assert.deepEqual(result, { kind: 'block', lightId: 'a' });
    assert.equal(lights[0].blockedUntilMs, 1000 + LIGHT_BLOCK_MS);
    assert.equal(player.interactReadyAtMs, 1000 + LIGHT_INTERACT_COOLDOWN_MS);
    assert.equal(interactCooldownSec(player, 1000), LIGHT_INTERACT_COOLDOWN_MS / 1000);
  });

  it('reverses a lamp on redirect', () => {
    const lights = [lamp('a', 300, 300)];
    const before = lights[0].speed;
    assert.deepEqual(applyLightInteraction(runner(400, 300), lights, false, true, 0), {
      kind: 'redirect',
      lightId: 'a',
    });
    assert.equal(lights[0].speed, -before);
  });

  it('does nothing while the player is still on cooldown or out of range', () => {
    const lights = [lamp('a', 300, 300)];
    const cooling = runner(400, 300);
    cooling.interactReadyAtMs = 5000;
    assert.equal(applyLightInteraction(cooling, lights, true, false, 1000), null);
    assert.equal(applyLightInteraction(runner(900, 300), lights, true, false, 9000), null);
    assert.equal(applyLightInteraction(runner(400, 300), lights, false, false, 9000), null);
  });
});
