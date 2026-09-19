import type { GiantInput, GiantWorld, Thief } from '../types/giant.types';
import { limbStrikes } from './giant-ai';
import {
  BUMP_COOLDOWN_MS,
  COLLIDE_COOLDOWN_MS,
  FOOTFALL_INTERVAL_MS,
  NOISE_BUMP,
  NOISE_COLLIDE,
  NOISE_STRUCK,
  PHASE_ESCAPE,
  STRUCK_COOLDOWN_MS,
} from './giant-constants';
import { resolveThiefPairs, stepThief } from './movement';
import { addNoise, movementNoiseRate } from './noise';
import { applyInteract, tryBank, type InteractTarget } from './treasure';

export interface TakeEvent {
  thiefId: string;
  kind: 'treasure' | 'charm';
  /** Id of the treasure or charm claimed. */
  id: string;
}

export interface BankEvent {
  thiefId: string;
  amount: number;
}

export interface FrameEvents {
  takes: TakeEvent[];
  banks: BankEvent[];
  /** Discrete loud moments this frame, for the audio cue and screen shake. */
  spikes: number;
  /** True when a locally-driven thief was swatted by a sweeping arm. */
  struck: boolean;
}

export function emptyEvents(): FrameEvents {
  return { takes: [], banks: [], spikes: 0, struck: false };
}

function toTake(thief: Thief, target: InteractTarget): TakeEvent | null {
  if (!target) return null;
  return target.kind === 'charm'
    ? { thiefId: thief.id, kind: 'charm', id: target.charm.id }
    : { thiefId: thief.id, kind: 'treasure', id: target.treasure.id };
}

/** Footfalls are what a walking thief actually puts into the meter, tick by tick. */
function chargeMovement(world: GiantWorld, thief: Thief, travelled: number, dtSec: number): void {
  if (travelled < 0.4) return;
  addNoise(world, {
    source: 'step',
    thief,
    amount: movementNoiseRate(thief) * dtSec,
    silentRipple: true,
  });

  // A visible ripple every few steps, so players can see what their gait costs.
  const interval = FOOTFALL_INTERVAL_MS * (thief.gait === 'run' ? 0.7 : 1);
  if (thief.strideMs < interval) return;
  thief.strideMs = 0;
  addNoise(world, { source: 'step', thief, amount: movementNoiseRate(thief) * 0.35 });
}

function chargeBump(world: GiantWorld, thief: Thief, bumped: boolean): boolean {
  if (!bumped || thief.bumpReadyAtMs > world.elapsedMs) return false;
  thief.bumpReadyAtMs = world.elapsedMs + BUMP_COOLDOWN_MS;
  addNoise(world, { source: 'bump', thief, amount: NOISE_BUMP });
  return true;
}

function chargeStrike(world: GiantWorld, thief: Thief): boolean {
  if (!limbStrikes(world.giant, world.mood, thief)) return false;
  if (thief.struckReadyAtMs > world.elapsedMs) return false;
  thief.struckReadyAtMs = world.elapsedMs + STRUCK_COOLDOWN_MS;
  addNoise(world, { source: 'struck', thief, amount: NOISE_STRUCK });
  return true;
}

/**
 * One thief's whole frame: move, pay for the movement, pay for anything they ran
 * into, then act on whatever they were reaching for.
 */
export function updateThief(
  world: GiantWorld,
  thief: Thief,
  input: GiantInput,
  dtSec: number,
  events: FrameEvents,
): void {
  if (!thief.connected || thief.escaped) return;

  const { bumped, travelled } = stepThief(thief, input, world, dtSec);
  chargeMovement(world, thief, travelled, dtSec);

  if (chargeBump(world, thief, bumped)) events.spikes += 1;
  if (chargeStrike(world, thief)) {
    events.spikes += 1;
    events.struck = true;
  }

  if (input.interact) {
    const take = toTake(thief, applyInteract(world, thief));
    if (take) {
      events.takes.push(take);
      events.spikes += 1;
    }
  }

  if (world.phase === PHASE_ESCAPE) {
    const amount = tryBank(world, thief);
    if (amount > 0) events.banks.push({ thiefId: thief.id, amount });
  }
}

/** Barging into a team-mate: separated, and charged to whoever was moving. */
export function settleCrowding(world: GiantWorld, events: FrameEvents): void {
  for (const { a, b, at } of resolveThiefPairs(world.thieves)) {
    if (a.bumpReadyAtMs > world.elapsedMs || b.bumpReadyAtMs > world.elapsedMs) continue;
    a.bumpReadyAtMs = world.elapsedMs + COLLIDE_COOLDOWN_MS;
    b.bumpReadyAtMs = world.elapsedMs + COLLIDE_COOLDOWN_MS;
    // The louder gait pays; two tiptoers brushing past is barely a sound.
    const payer = a.gait === 'run' || b.gait !== 'run' ? a : b;
    addNoise(world, { source: 'collide', thief: payer, amount: NOISE_COLLIDE, at });
    events.spikes += 1;
  }
}
