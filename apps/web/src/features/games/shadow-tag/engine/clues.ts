import type { Footstep, Prop, ShadowTagRunner, ShadowTagWorld } from '../types/shadow-tag.types';
import { distance } from './geometry';
import {
  FOOTSTEP_INTERVAL_MS,
  FOOTSTEP_LIFE_MS,
  MAX_FOOTSTEPS,
  PROP_DISTURB_MS,
  PROP_DISTURB_RANGE,
} from './shadow-tag-constants';

/**
 * Drops a dust mote under a runner who is jogging. Sneaking sets `strideMs`
 * back to zero every frame, so a careful player leaves no trail at all — the
 * trade is that they move at less than half speed.
 */
export function shedFootsteps(world: ShadowTagWorld, runner: ShadowTagRunner): void {
  if (runner.strideMs < FOOTSTEP_INTERVAL_MS) return;
  runner.strideMs = 0;

  world.footsteps.push({
    id: world.nextFootstepId++,
    pos: { ...runner.pos },
    bornAtMs: world.elapsedMs,
    seed: (world.nextFootstepId * 73) % 360,
  });

  if (world.footsteps.length > MAX_FOOTSTEPS) {
    world.footsteps.splice(0, world.footsteps.length - MAX_FOOTSTEPS);
  }
}

export function expireFootsteps(footsteps: Footstep[], elapsedMs: number): Footstep[] {
  return footsteps.filter((step) => elapsedMs - step.bornAtMs < FOOTSTEP_LIFE_MS);
}

/** 0..1 — how much life a footstep has left, for the renderer's fade. */
export function footstepFade(step: Footstep, elapsedMs: number): number {
  return Math.max(0, 1 - (elapsedMs - step.bornAtMs) / FOOTSTEP_LIFE_MS);
}

/** Brushing past scenery rattles it. Everyone sees the rattle; nobody sees who. */
export function disturbProps(props: Prop[], runner: ShadowTagRunner, elapsedMs: number): void {
  if (Math.hypot(runner.vel.x, runner.vel.y) < 20) return;
  for (const prop of props) {
    if (distance(prop.pos, runner.pos) <= PROP_DISTURB_RANGE + prop.radius) {
      prop.disturbedUntilMs = elapsedMs + PROP_DISTURB_MS;
    }
  }
}

/** 0..1 — how hard a prop is still shaking. */
export function propShake(prop: Prop, elapsedMs: number): number {
  const remaining = prop.disturbedUntilMs - elapsedMs;
  return remaining <= 0 ? 0 : Math.min(1, remaining / PROP_DISTURB_MS);
}
