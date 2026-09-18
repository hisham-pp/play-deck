import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ShadowCast, ShadowTagRunner } from '../types/shadow-tag.types';
import { PLAYER_RADIUS, TAG_GRACE_MS, TAG_POINTS } from './shadow-tag-constants';
import { resolveTag, shadowContactPoint } from './tagging';

function runner(id: string, x: number, y: number): ShadowTagRunner {
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

function cast(playerId: string, overrides: Partial<ShadowCast> = {}): ShadowCast {
  return {
    playerId,
    lightId: 'lamp',
    from: { x: 100, y: 300 },
    to: { x: 260, y: 300 },
    nearRadius: PLAYER_RADIUS,
    farRadius: 32,
    opacity: 0.8,
    ...overrides,
  };
}

const BASE = { elapsedMs: 10_000, tagPoints: TAG_POINTS };

describe('shadow contact', () => {
  it('hits along the capsule and misses beyond its tip', () => {
    assert.ok(shadowContactPoint(cast('p2'), { x: 200, y: 300 }, 0));
    assert.equal(shadowContactPoint(cast('p2'), { x: 400, y: 300 }, 0), null);
  });

  it('is easier to step on at the wide far end', () => {
    assert.equal(shadowContactPoint(cast('p2'), { x: 110, y: 328 }, 0), null);
    assert.ok(shadowContactPoint(cast('p2'), { x: 255, y: 328 }, 0));
  });

  it('ignores a shadow too faint to read', () => {
    assert.equal(shadowContactPoint(cast('p2', { opacity: 0.01 }), { x: 200, y: 300 }, 0), null);
  });
});

describe('resolveTag', () => {
  it('passes the mark when "it" steps on a rival shadow', () => {
    const it = runner('p1', 200, 300);
    const victim = runner('p2', 100, 300);
    const resolution = resolveTag({
      itRunner: it,
      runners: [it, victim],
      casts: [cast('p2')],
      ...BASE,
    });

    assert.ok(resolution);
    assert.equal(resolution.event.victimId, 'p2');
    resolution.apply();
    assert.equal(it.tags, 1);
    assert.equal(it.score, TAG_POINTS);
    assert.equal(victim.timesTagged, 1);
    assert.equal(it.immuneUntilMs, BASE.elapsedMs + TAG_GRACE_MS);
    assert.equal(victim.immuneUntilMs, BASE.elapsedMs + TAG_GRACE_MS);
  });

  it('tags on body contact even with no shadow on the floor', () => {
    const it = runner('p1', 300, 300);
    const victim = runner('p2', 310, 300);
    assert.ok(resolveTag({ itRunner: it, runners: [it, victim], casts: [], ...BASE }));
  });

  it('never tags the runner who just handed the mark over', () => {
    const it = runner('p1', 200, 300);
    const victim = runner('p2', 100, 300);
    victim.immuneUntilMs = BASE.elapsedMs + 500;
    assert.equal(
      resolveTag({ itRunner: it, runners: [it, victim], casts: [cast('p2')], ...BASE }),
      null,
    );
  });

  it('holds a freshly tagged "it" off until their grace expires', () => {
    const it = runner('p1', 200, 300);
    it.immuneUntilMs = BASE.elapsedMs + 500;
    const victim = runner('p2', 100, 300);
    assert.equal(
      resolveTag({ itRunner: it, runners: [it, victim], casts: [cast('p2')], ...BASE }),
      null,
    );
  });

  it('skips disconnected runners and never tags itself', () => {
    const it = runner('p1', 200, 300);
    const gone = runner('p2', 100, 300);
    gone.connected = false;
    assert.equal(
      resolveTag({
        itRunner: it,
        runners: [it, gone],
        casts: [cast('p2'), cast('p1')],
        ...BASE,
      }),
      null,
    );
  });
});
