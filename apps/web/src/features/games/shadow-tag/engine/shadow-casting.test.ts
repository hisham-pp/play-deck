import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LightSource, Obstacle, ShadowTagRunner } from '../types/shadow-tag.types';
import { castShadow, computeShadows, exposureAt } from './shadow-casting';
import { PLAYER_RADIUS, SHADOW_MAX_LENGTH } from './shadow-tag-constants';

function lamp(overrides: Partial<LightSource> = {}): LightSource {
  return {
    id: 'lamp',
    orbit: { cx: 100, cy: 300, rx: 0, ry: 0 },
    angle: 0,
    speed: 0,
    pos: { x: 100, y: 300 },
    intensity: 1,
    blockedUntilMs: 0,
    reach: 400,
    hue: 40,
    ...overrides,
  };
}

function runner(x: number, y: number, id = 'p1'): ShadowTagRunner {
  return {
    id,
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

describe('shadow casting', () => {
  it('throws the shadow directly away from the lamp', () => {
    const cast = castShadow(runner(300, 300), lamp(), []);
    assert.ok(cast);
    assert.ok(cast.to.x > cast.from.x, 'shadow points away from a lamp on the left');
    assert.ok(Math.abs(cast.to.y - cast.from.y) < 1e-6, 'stays on the lamp-to-runner line');
  });

  it('lengthens and widens with distance from the lamp', () => {
    const near = castShadow(runner(180, 300), lamp(), []);
    const far = castShadow(runner(340, 300), lamp(), []);
    assert.ok(near && far);

    const nearLength = Math.hypot(near.to.x - near.from.x, near.to.y - near.from.y);
    const farLength = Math.hypot(far.to.x - far.from.x, far.to.y - far.from.y);
    assert.ok(farLength > nearLength);
    assert.ok(far.farRadius > near.farRadius);
    assert.ok(farLength <= SHADOW_MAX_LENGTH + 1e-6, 'never grows past the cap');
    assert.equal(near.nearRadius, PLAYER_RADIUS);
  });

  it('casts nothing when a pillar stands between lamp and runner', () => {
    const wall: Obstacle[] = [{ x: 200, y: 260, w: 30, h: 80 }];
    assert.equal(castShadow(runner(300, 300), lamp(), wall), null);
  });

  it('casts nothing once the lamp is covered or out of reach', () => {
    assert.equal(castShadow(runner(300, 300), lamp({ intensity: 0 }), []), null);
    assert.equal(castShadow(runner(560, 300), lamp({ reach: 200 }), []), null);
  });

  it('collects one cast per lamp that reaches a runner', () => {
    const lights = [lamp(), lamp({ id: 'lamp-2', pos: { x: 700, y: 300 } })];
    const casts = computeShadows([runner(400, 300)], lights, []);
    assert.deepEqual(casts.map((cast) => cast.lightId).sort(), ['lamp', 'lamp-2']);
  });

  it('skips runners who have dropped out', () => {
    const gone = { ...runner(300, 300), connected: false };
    assert.equal(computeShadows([gone], [lamp()], []).length, 0);
  });

  it('reports exposure as the strongest lamp falling on a point', () => {
    const lights = [lamp({ intensity: 0.4 }), lamp({ id: 'b', pos: { x: 320, y: 300 } })];
    const lit = exposureAt({ x: 300, y: 300 }, lights, []);
    const hidden = exposureAt({ x: 300, y: 300 }, lights, [{ x: 200, y: 200, w: 400, h: 200 }]);
    assert.ok(lit > 0.8, `expected a bright spot, got ${lit}`);
    assert.equal(hidden, 0);
  });
});
