import { PHASE_ESCAPED, PHASE_WOKEN } from '../engine/giant-constants';
import type { GiantEngine } from '../engine/giant-engine';
import type { SnapshotPayload } from './giant-protocol';

const round2 = (n: number) => Math.round(n * 100) / 100;
/** Snap rather than ease when the host and this client have drifted this far apart. */
const CLOCK_SNAP_MS = 900;
/** Share of the remaining clock gap closed per snapshot when merely drifting. */
const CLOCK_EASE = 0.25;

/**
 * The authoritative slice of the world: the clocks, the meter, what has been
 * lifted and who is carrying it. Positions are deliberately absent — those
 * arrive far more often on the pose channel.
 */
export function buildSnapshot(engine: GiantEngine, roundId: string): SnapshotPayload {
  const world = engine.getWorld();

  return {
    roundId,
    elapsedMs: Math.round(world.elapsedMs),
    phase: world.phase,
    mood: world.mood,
    noise: round2(world.noise),
    escapeStartedMs: Math.round(world.escapeStartedMs),
    bankedTotal: world.bankedTotal,
    taken: world.treasures
      .filter((treasure) => treasure.takenBy !== null)
      .map((treasure) => [treasure.id, treasure.takenBy as string]),
    charms: world.charms
      .filter((charm) => charm.usedBy !== null)
      .map((charm) => [charm.id, charm.usedBy as string]),
    hauls: world.thieves.map((thief) => ({
      id: thief.id,
      banked: thief.banked,
      carried: thief.carried,
      carriedCount: thief.carriedCount,
      noiseMade: round2(thief.noiseMade),
      escaped: thief.escaped,
    })),
    limbs: world.giant.limbs.map((limb) => ({
      id: limb.id,
      angle: round2(limb.angle),
      dir: limb.dir,
    })),
  };
}

/**
 * Folds a host snapshot into a guest's world. The shared meter is the one thing
 * a co-op game cannot afford to disagree about, so it is taken wholesale rather
 * than eased — everybody has to be looking at the same number.
 */
export function applySnapshot(engine: GiantEngine, snapshot: SnapshotPayload): void {
  const world = engine.getWorld();

  const drift = snapshot.elapsedMs - world.elapsedMs;
  world.elapsedMs += Math.abs(drift) > CLOCK_SNAP_MS ? drift : drift * CLOCK_EASE;
  world.noise = snapshot.noise;
  world.peakNoise = Math.max(world.peakNoise, snapshot.noise);
  world.mood = snapshot.mood;
  world.escapeStartedMs = snapshot.escapeStartedMs;
  world.bankedTotal = snapshot.bankedTotal;

  const taken = new Map(snapshot.taken);
  for (const treasure of world.treasures) treasure.takenBy = taken.get(treasure.id) ?? null;

  const spent = new Map(snapshot.charms);
  for (const charm of world.charms) charm.usedBy = spent.get(charm.id) ?? null;

  for (const patch of snapshot.hauls) {
    const thief = world.thieves.find((candidate) => candidate.id === patch.id);
    if (!thief) continue;
    thief.banked = patch.banked;
    thief.carried = patch.carried;
    thief.carriedCount = patch.carriedCount;
    thief.noiseMade = patch.noiseMade;
    thief.escaped = patch.escaped;
  }

  for (const patch of snapshot.limbs) {
    const limb = world.giant.limbs.find((candidate) => candidate.id === patch.id);
    if (!limb) continue;
    limb.angle = patch.angle;
    limb.dir = patch.dir;
  }

  if (snapshot.phase === PHASE_ESCAPED || snapshot.phase === PHASE_WOKEN) {
    engine.finish(snapshot.phase);
  } else {
    world.phase = snapshot.phase;
  }
}
