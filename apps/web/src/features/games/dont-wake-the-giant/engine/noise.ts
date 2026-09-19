import type {
  GiantMood,
  GiantWorld,
  NoiseSource,
  QuietZone,
  Ripple,
  Thief,
  Vec2,
} from '../types/giant.types';
import { distance } from './geometry';
import {
  CARRY_NOISE_PER_ITEM,
  GAIT_NOISE_PER_SEC,
  MAX_RIPPLES,
  MOOD_ASLEEP,
  MOOD_AWAKE,
  MOOD_RESTLESS,
  MOOD_RESTLESS_AT,
  MOOD_STIR_AT,
  MOOD_STIRRING,
  MUFFLE_FACTOR,
  NOISE_DECAY_PER_SEC,
  NOISE_MAX,
  NOISE_STRUCK,
  QUIET_ZONE_FACTOR,
  RIPPLE_LIFE_MS,
} from './giant-constants';

/**
 * How much of a sound made at `pos` actually carries. Quiet zones fade in
 * towards their centre rather than switching on at the rim, so edging onto the
 * moss is rewarded proportionally instead of feeling like a light switch.
 */
export function quietFactorAt(pos: Vec2, zones: QuietZone[]): number {
  let factor = 1;
  for (const zone of zones) {
    const dist = distance(pos, zone.pos);
    if (dist >= zone.radius) continue;
    const depth = 1 - dist / zone.radius;
    factor = Math.min(factor, 1 - (1 - QUIET_ZONE_FACTOR) * depth);
  }
  return factor;
}

/** Everything damping one thief right now: the floor under them and any charm. */
export function dampingFor(thief: Thief, world: GiantWorld): number {
  const quiet = quietFactorAt(thief.pos, world.map.quietZones);
  const muffled = thief.muffledUntilMs > world.elapsedMs ? MUFFLE_FACTOR : 1;
  return quiet * muffled;
}

/** Noise per second of movement, before the floor and charms get a say. */
export function movementNoiseRate(thief: Thief): number {
  return GAIT_NOISE_PER_SEC[thief.gait] + thief.carriedCount * CARRY_NOISE_PER_ITEM;
}

export function moodFor(noise: number): GiantMood {
  if (noise >= NOISE_MAX) return MOOD_AWAKE;
  if (noise >= MOOD_RESTLESS_AT) return MOOD_RESTLESS;
  if (noise >= MOOD_STIR_AT) return MOOD_STIRRING;
  return MOOD_ASLEEP;
}

function pushRipple(world: GiantWorld, at: Vec2, strength: number): void {
  const ripple: Ripple = {
    id: world.nextRippleId++,
    pos: { ...at },
    bornAtMs: world.elapsedMs,
    strength: Math.min(1, strength),
  };
  world.ripples.push(ripple);
  if (world.ripples.length > MAX_RIPPLES) world.ripples.shift();
}

export interface NoiseRequest {
  source: NoiseSource;
  thief: Thief;
  /** Raw loudness before the floor, charms and carried weight are applied. */
  amount: number;
  at?: Vec2;
  /** Movement noise is already continuous, so it does not draw its own ripple. */
  silentRipple?: boolean;
}

/**
 * The single door into the shared meter. Every noise source goes through here
 * so damping, attribution and the ripple that explains it can never drift apart.
 */
export function addNoise(world: GiantWorld, request: NoiseRequest): number {
  const { source, thief, amount } = request;
  if (amount <= 0) return 0;

  const applied = amount * dampingFor(thief, world);
  if (applied <= 0) return 0;

  world.noise = Math.min(NOISE_MAX, world.noise + applied);
  world.peakNoise = Math.max(world.peakNoise, world.noise);
  thief.noiseMade += applied;

  const at = request.at ?? thief.pos;
  world.lastEvent = {
    source,
    thiefId: thief.id,
    amount: applied,
    at: { ...at },
    atMs: world.elapsedMs,
  };
  if (!request.silentRipple) pushRipple(world, at, applied / NOISE_STRUCK);

  return applied;
}

/** Spends a lullaby charm: the one thing that pulls the meter back down fast. */
export function relieveNoise(world: GiantWorld, amount: number): void {
  world.noise = Math.max(0, world.noise - amount);
}

/** The room settling. Runs every frame regardless of phase. */
export function decayNoise(world: GiantWorld, dtSec: number): void {
  world.noise = Math.max(0, world.noise - NOISE_DECAY_PER_SEC * dtSec);
}

export function expireRipples(ripples: Ripple[], elapsedMs: number): Ripple[] {
  return ripples.filter((ripple) => elapsedMs - ripple.bornAtMs < RIPPLE_LIFE_MS);
}

/** 0..1 — how far through its life a ripple is, for the renderer to fade on. */
export function rippleAge(ripple: Ripple, elapsedMs: number): number {
  return Math.min(1, Math.max(0, (elapsedMs - ripple.bornAtMs) / RIPPLE_LIFE_MS));
}

/** Ascending severity, so the UI can compare two moods without a switch. */
export const MOOD_ORDER: GiantMood[] = [MOOD_ASLEEP, MOOD_STIRRING, MOOD_RESTLESS, MOOD_AWAKE];
