import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createRoundId,
  encodePose,
  isPose,
  isRoundStart,
  isSnapshot,
  isTagEvent,
  MAX_EXTRAPOLATION_MS,
  POSE_RENDER_DELAY_MS,
  PoseTrack,
} from './shadow-tag-protocol';

describe('shadow tag wire guards', () => {
  it('accepts well-formed payloads', () => {
    assert.ok(
      isRoundStart({ roundId: 'r1', seats: [], arenaId: 'atrium', roundMs: 1000, itId: 'p1' }),
    );
    assert.ok(isPose(encodePose('r1', { x: 1.24, y: 2.36 }, 0.5, false)));
    assert.ok(isTagEvent({ taggerId: 'a', victimId: 'b', atMs: 1, at: { x: 0, y: 0 } }));
    assert.ok(isSnapshot({ roundId: 'r', elapsedMs: 1, itId: 'p', lights: [], scores: [] }));
  });

  it('rejects anything malformed rather than trusting the channel', () => {
    assert.equal(isRoundStart({ roundId: 'r1', seats: [], arenaId: 'atrium' }), false);
    assert.equal(isPose({ roundId: 'r1', pose: [1, 2] }), false);
    assert.equal(isPose({ roundId: 'r1', pose: [1, 2, Number.NaN] }), false);
    assert.equal(isTagEvent({ taggerId: 'a', victimId: 'b', atMs: 1 }), false);
    assert.equal(isSnapshot(null), false);
    assert.equal(isSnapshot([]), false);
  });

  it('rounds poses to one decimal to keep broadcasts small', () => {
    assert.deepEqual(encodePose('r1', { x: 1.2449, y: 2.3651 }, 0.523, true), {
      roundId: 'r1',
      pose: [1.2, 2.4, 0.5],
      sneaking: true,
    });
  });

  it('mints a fresh round id each time', () => {
    assert.notEqual(createRoundId(), createRoundId());
  });
});

describe('PoseTrack', () => {
  it('returns nothing until a sample lands', () => {
    assert.equal(new PoseTrack().sample(1000), null);
  });

  it('blends between the two samples straddling the render delay', () => {
    const track = new PoseTrack();
    track.push([0, 0, 0], 1000);
    track.push([100, 0, 0], 1200);

    const sample = track.sample(1100 + POSE_RENDER_DELAY_MS);
    assert.ok(sample);
    assert.ok(Math.abs(sample.x - 50) < 1e-6, `expected the midpoint, got ${sample.x}`);
  });

  it('turns the short way round the half-turn seam', () => {
    const track = new PoseTrack();
    track.push([0, 0, 3.0], 1000);
    track.push([0, 0, -3.0], 1200);

    const sample = track.sample(1100 + POSE_RENDER_DELAY_MS);
    assert.ok(sample);
    assert.ok(Math.abs(sample.facing) > 3.0, `expected a turn through pi, got ${sample.facing}`);
  });

  it('extrapolates briefly past the newest sample, then stops running away', () => {
    const track = new PoseTrack();
    track.push([0, 0, 0], 1000);
    track.push([100, 0, 0], 1100);

    const soon = track.sample(1150 + POSE_RENDER_DELAY_MS);
    const late = track.sample(9000 + POSE_RENDER_DELAY_MS);
    assert.ok(soon && late);
    assert.ok(soon.x > 100);
    assert.ok(late.x <= 100 + MAX_EXTRAPOLATION_MS + 1e-6, `capped extrapolation, got ${late.x}`);
  });

  it('forgets everything on clear', () => {
    const track = new PoseTrack();
    track.push([1, 2, 3], 1000);
    track.clear();
    assert.equal(track.sample(2000), null);
  });
});
