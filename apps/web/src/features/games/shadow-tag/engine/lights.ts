import type { LightSource, ShadowTagRunner, Vec2 } from '../types/shadow-tag.types';
import { clamp, distance } from './geometry';
import {
  LIGHT_BLOCK_MS,
  LIGHT_FADE_PER_SEC,
  LIGHT_INTERACT_COOLDOWN_MS,
  LIGHT_INTERACT_RANGE,
} from './shadow-tag-constants';

export function lightPosition(light: LightSource): Vec2 {
  return {
    x: light.orbit.cx + Math.cos(light.angle) * light.orbit.rx,
    y: light.orbit.cy + Math.sin(light.angle) * light.orbit.ry,
  };
}

/** Walks every lamp along its patrol and fades it toward its covered state. */
export function advanceLights(lights: LightSource[], dtSec: number, elapsedMs: number): void {
  for (const light of lights) {
    light.angle = (light.angle + light.speed * dtSec) % (Math.PI * 2);
    light.pos = lightPosition(light);

    const covered = light.blockedUntilMs > elapsedMs;
    const target = covered ? 0 : 1;
    const step = LIGHT_FADE_PER_SEC * dtSec;
    light.intensity = clamp(
      light.intensity +
        Math.sign(target - light.intensity) * Math.min(step, Math.abs(target - light.intensity)),
      0,
      1,
    );
  }
}

export function nearestLight(pos: Vec2, lights: LightSource[]): LightSource | null {
  let best: LightSource | null = null;
  let bestDist = LIGHT_INTERACT_RANGE;
  for (const light of lights) {
    const dist = distance(pos, light.pos);
    if (dist <= bestDist) {
      best = light;
      bestDist = dist;
    }
  }
  return best;
}

export type LightInteraction = { kind: 'block' | 'redirect'; lightId: string } | null;

/**
 * Covering a lamp kills every shadow it throws for a few seconds; redirecting
 * reverses its patrol. Both share one cooldown so a player cannot stand at a
 * lamp and strobe the arena.
 */
export function applyLightInteraction(
  runner: ShadowTagRunner,
  lights: LightSource[],
  wantsBlock: boolean,
  wantsRedirect: boolean,
  elapsedMs: number,
): LightInteraction {
  if (!wantsBlock && !wantsRedirect) return null;
  if (elapsedMs < runner.interactReadyAtMs) return null;

  const light = nearestLight(runner.pos, lights);
  if (!light) return null;

  runner.interactReadyAtMs = elapsedMs + LIGHT_INTERACT_COOLDOWN_MS;

  if (wantsBlock) {
    light.blockedUntilMs = elapsedMs + LIGHT_BLOCK_MS;
    return { kind: 'block', lightId: light.id };
  }

  light.speed = -light.speed;
  return { kind: 'redirect', lightId: light.id };
}

/** Seconds until this runner may touch a lamp again; 0 when ready. */
export function interactCooldownSec(runner: ShadowTagRunner, elapsedMs: number): number {
  return Math.max(0, (runner.interactReadyAtMs - elapsedMs) / 1000);
}
