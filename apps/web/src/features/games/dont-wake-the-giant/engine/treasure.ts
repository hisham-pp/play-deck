import type { Charm, GiantWorld, Obstacle, Thief, Treasure, Vec2 } from '../types/giant.types';
import { distance, distanceToBox } from './geometry';
import {
  COLLECT_COOLDOWN_MS,
  INTERACT_RANGE,
  LULLABY_RELIEF,
  MUFFLE_MS,
  PHASE_ESCAPE,
} from './giant-constants';
import { addNoise, relieveNoise } from './noise';

const TIER_LABEL: Record<Treasure['tier'], string> = {
  trinket: 'trinket',
  goblet: 'goblet',
  relic: 'relic',
};

export function treasuresLeft(world: GiantWorld): number {
  return world.treasures.filter((treasure) => treasure.takenBy === null).length;
}

function nearest<T extends { pos: Vec2 }>(pos: Vec2, items: T[], range: number): T | null {
  let best: T | null = null;
  let bestDist = range;
  for (const item of items) {
    const dist = distance(pos, item.pos);
    if (dist <= bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

export type InteractTarget =
  { kind: 'treasure'; treasure: Treasure } | { kind: 'charm'; charm: Charm } | null;

/**
 * Whatever is in arm's reach. The same call drives the on-screen prompt and the
 * action itself, so the game never offers something it will then refuse to do.
 */
export function interactTargetFor(world: GiantWorld, thief: Thief): InteractTarget {
  const charm = nearest(
    thief.pos,
    world.charms.filter((item) => item.usedBy === null),
    INTERACT_RANGE,
  );
  if (charm) return { kind: 'charm', charm };

  const treasure = nearest(
    thief.pos,
    world.treasures.filter((item) => item.takenBy === null),
    INTERACT_RANGE,
  );
  return treasure ? { kind: 'treasure', treasure } : null;
}

/** The line shown under the reticle, or empty when nothing is in reach. */
export function promptFor(world: GiantWorld, thief: Thief | undefined): string {
  if (!thief || thief.escaped) return '';
  if (world.phase === PHASE_ESCAPE && inExit(thief.pos, world.map.exit)) {
    return 'Step through the door to bank your haul';
  }

  const target = interactTargetFor(world, thief);
  if (!target) return '';
  if (target.kind === 'charm') {
    return target.charm.kind === 'lullaby'
      ? 'Take the lullaby chime — settles the whole room'
      : 'Take the muffle wrap — quiets you alone';
  }
  return `Lift the ${TIER_LABEL[target.treasure.tier]} (+${target.treasure.value}, ${target.treasure.noise} noise)`;
}

export function collectTreasure(world: GiantWorld, thief: Thief, treasure: Treasure): void {
  if (treasure.takenBy !== null) return;

  treasure.takenBy = thief.id;
  thief.carried += treasure.value;
  thief.carriedCount += 1;
  thief.collectReadyAtMs = world.elapsedMs + COLLECT_COOLDOWN_MS;
  addNoise(world, { source: 'collect', thief, amount: treasure.noise, at: treasure.pos });
}

export function spendCharm(world: GiantWorld, thief: Thief, charm: Charm): void {
  if (charm.usedBy !== null) return;

  charm.usedBy = thief.id;
  thief.collectReadyAtMs = world.elapsedMs + COLLECT_COOLDOWN_MS;

  if (charm.kind === 'lullaby') {
    relieveNoise(world, LULLABY_RELIEF);
    world.lastEvent = {
      source: 'charm',
      thiefId: thief.id,
      amount: -LULLABY_RELIEF,
      at: { ...charm.pos },
      atMs: world.elapsedMs,
    };
    return;
  }

  thief.muffledUntilMs = world.elapsedMs + MUFFLE_MS;
}

/** Acts on whatever `interactTargetFor` offered. Returns what was actually taken. */
export function applyInteract(world: GiantWorld, thief: Thief): InteractTarget {
  if (thief.collectReadyAtMs > world.elapsedMs || thief.escaped) return null;

  const target = interactTargetFor(world, thief);
  if (!target) return null;

  if (target.kind === 'charm') spendCharm(world, thief, target.charm);
  else collectTreasure(world, thief, target.treasure);

  return target;
}

export function inExit(pos: Vec2, exit: Obstacle): boolean {
  return distanceToBox(exit, pos) <= 4;
}

/**
 * Carrying loot out of the door is the only thing that turns it into a score.
 * Anything still in a thief's arms when the heist ends is left behind.
 */
export function tryBank(world: GiantWorld, thief: Thief): number {
  if (thief.escaped || world.phase !== PHASE_ESCAPE) return 0;
  if (!inExit(thief.pos, world.map.exit)) return 0;

  const haul = thief.carried;
  thief.banked += haul;
  thief.carried = 0;
  thief.carriedCount = 0;
  thief.escaped = true;
  world.bankedTotal += haul;
  return haul;
}

export function allEscaped(world: GiantWorld): boolean {
  const active = world.thieves.filter((thief) => thief.connected);
  return active.length > 0 && active.every((thief) => thief.escaped);
}
