import { PHASE_ROUND_OVER } from '../engine/shadow-tag-constants';
import type { ShadowTagEngine } from '../engine/shadow-tag-engine';
import type { SnapshotPayload } from './shadow-tag-protocol';

const round2 = (n: number) => Math.round(n * 100) / 100;
/** Snap rather than ease when the host and this client have drifted this far apart. */
const CLOCK_SNAP_MS = 900;
/** Share of the remaining clock gap closed per snapshot when merely drifting. */
const CLOCK_EASE = 0.25;

/** The authoritative slice of the world: the clock, the mark, the lamps, the scores. */
export function buildSnapshot(engine: ShadowTagEngine, roundId: string): SnapshotPayload {
  const world = engine.getWorld();
  return {
    roundId,
    elapsedMs: Math.round(world.elapsedMs),
    itId: world.itId,
    ended: world.phase === PHASE_ROUND_OVER,
    lights: world.lights.map((light) => ({
      id: light.id,
      angle: round2(light.angle),
      speed: round2(light.speed),
      intensity: round2(light.intensity),
      blockedUntilMs: Math.round(light.blockedUntilMs),
    })),
    scores: world.players.map((runner) => ({
      id: runner.id,
      score: Math.round(runner.score),
      tags: runner.tags,
      timesTagged: runner.timesTagged,
    })),
  };
}

/**
 * Folds a host snapshot into a guest's world. Positions are deliberately left
 * alone — those arrive far more often on the pose channel — so this only
 * settles the things the host alone decides.
 */
export function applySnapshot(engine: ShadowTagEngine, snapshot: SnapshotPayload): void {
  const world = engine.getWorld();

  const drift = snapshot.elapsedMs - world.elapsedMs;
  world.elapsedMs += Math.abs(drift) > CLOCK_SNAP_MS ? drift : drift * CLOCK_EASE;
  world.itId = snapshot.itId;

  for (const patch of snapshot.lights) {
    const light = world.lights.find((candidate) => candidate.id === patch.id);
    if (!light) continue;
    light.angle = patch.angle;
    light.speed = patch.speed;
    light.intensity = patch.intensity;
    light.blockedUntilMs = patch.blockedUntilMs;
  }

  for (const patch of snapshot.scores) {
    const runner = world.players.find((candidate) => candidate.id === patch.id);
    if (!runner) continue;
    runner.score = patch.score;
    runner.tags = patch.tags;
    runner.timesTagged = patch.timesTagged;
  }

  if (snapshot.ended) engine.endRound();
}
