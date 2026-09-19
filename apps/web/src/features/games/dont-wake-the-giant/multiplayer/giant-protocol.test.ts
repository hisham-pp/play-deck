import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createRoundId,
  encodePose,
  isPose,
  isRoundStart,
  isSnapshot,
  isTake,
  MAX_EXTRAPOLATION_MS,
  POSE_RENDER_DELAY_MS,
  PoseTrack,
} from './giant-protocol';

describe('protocol — guards', () => {
  it('accepts a well-formed round start and rejects a mangled one', () => {
    assert.equal(isRoundStart({ roundId: 'r1', seats: [], mapId: 'hearth', heistMs: 1000 }), true);
    assert.equal(isRoundStart({ roundId: 'r1', seats: [], mapId: 'hearth' }), false);
    assert.equal(isRoundStart(null), false);
    assert.equal(isRoundStart([]), false);
  });

  it('rejects a pose carrying anything that is not a finite number', () => {
    const good = encodePose('r1', { x: 10, y: 20 }, 0.5, 'walk', 2);
    assert.equal(isPose(good), true);
    assert.equal(isPose({ ...good, pose: [10, 20, Number.NaN] }), false);
    assert.equal(isPose({ ...good, pose: [10, 20] }), false);
    assert.equal(isPose({ ...good, gait: 7 }), false);
  });

  it('only accepts the two kinds of pickup that exist', () => {
    const take = { roundId: 'r1', thiefId: 'p1', kind: 'treasure', id: 'loot-0' };
    assert.equal(isTake(take), true);
    assert.equal(isTake({ ...take, kind: 'charm' }), true);
    assert.equal(isTake({ ...take, kind: 'giant' }), false);
  });

  it('requires every collection a snapshot promises to carry', () => {
    const snapshot = {
      roundId: 'r1',
      elapsedMs: 10,
      phase: 'heist',
      mood: 'asleep',
      noise: 12,
      escapeStartedMs: 0,
      bankedTotal: 0,
      taken: [],
      charms: [],
      hauls: [],
      limbs: [],
    };
    assert.equal(isSnapshot(snapshot), true);
    assert.equal(isSnapshot({ ...snapshot, hauls: undefined }), false);
    assert.equal(isSnapshot({ ...snapshot, noise: 'loud' }), false);
  });

  it('mints a fresh round id each time', () => {
    assert.notEqual(createRoundId(), createRoundId());
  });
});

describe('protocol — pose encoding', () => {
  it('rounds coordinates down to one decimal to keep messages small', () => {
    const pose = encodePose('r1', { x: 12.34567, y: 98.7654 }, 1.23456, 'run', 1);
    assert.deepEqual(pose.pose, [12.3, 98.8, 1.2]);
    assert.equal(pose.gait, 'run');
    assert.equal(pose.carriedCount, 1);
  });
});

describe('protocol — pose interpolation', () => {
  it('has nothing to say before the first sample arrives', () => {
    assert.equal(new PoseTrack().sample(1000), null);
  });

  it('holds the only sample it has', () => {
    const track = new PoseTrack();
    track.push([100, 200, 0], 1000);
    assert.deepEqual(track.sample(1000), { x: 100, y: 200, facing: 0 });
  });

  it('blends between the two samples that straddle the render time', () => {
    const track = new PoseTrack();
    track.push([0, 0, 0], 1000);
    track.push([100, 0, 0], 1100);

    // Rendering is deliberately behind, so ask for a "now" that lands mid-way.
    const pose = track.sample(1050 + POSE_RENDER_DELAY_MS);
    assert.ok(pose);
    assert.ok(Math.abs(pose.x - 50) < 1e-6);
  });

  it('takes the short way round when a facing wraps past half a turn', () => {
    const track = new PoseTrack();
    track.push([0, 0, Math.PI - 0.1], 1000);
    track.push([0, 0, -Math.PI + 0.1], 1100);

    const pose = track.sample(1050 + POSE_RENDER_DELAY_MS);
    assert.ok(pose);
    assert.ok(Math.abs(pose.facing) > Math.PI - 0.15, 'it should cross the wrap, not sweep back');
  });

  it('extrapolates a little past the newest sample, then stops running away', () => {
    const track = new PoseTrack();
    track.push([0, 0, 0], 1000);
    track.push([100, 0, 0], 1100);

    const soon = track.sample(1200 + POSE_RENDER_DELAY_MS);
    const muchLater = track.sample(9000 + POSE_RENDER_DELAY_MS);
    assert.ok(soon && muchLater);
    assert.ok(soon.x > 100, 'a brief extrapolation keeps motion smooth');
    assert.ok(muchLater.x <= 100 + MAX_EXTRAPOLATION_MS, 'but it is capped');
  });

  it('forgets everything on a fresh round', () => {
    const track = new PoseTrack();
    track.push([1, 2, 3], 1000);
    track.clear();
    assert.equal(track.sample(1000), null);
  });
});
