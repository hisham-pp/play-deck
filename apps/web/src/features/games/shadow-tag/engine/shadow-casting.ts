import type {
  LightSource,
  Obstacle,
  ShadowCast,
  ShadowTagRunner,
  Vec2,
} from '../types/shadow-tag.types';
import { clamp, distance, normalize, segmentBlocked, sub } from './geometry';
import {
  CASTER_HEIGHT,
  LIGHT_HEIGHT,
  PLAYER_RADIUS,
  SHADOW_MAX_LENGTH,
  SHADOW_MIN_LENGTH,
  SHADOW_MIN_OPACITY,
  SHADOW_SPREAD,
} from './shadow-tag-constants';

/** How far a caster's shadow stretches under a lamp at `dist`. */
const LENGTH_RATIO = CASTER_HEIGHT / (LIGHT_HEIGHT - CASTER_HEIGHT);

/**
 * How brightly a lamp falls on a point: full under the lamp, nothing past its
 * reach, and nothing at all when a pillar stands in the way.
 */
export function illuminationAt(point: Vec2, light: LightSource, obstacles: Obstacle[]): number {
  if (light.intensity <= 0) return 0;
  const dist = distance(light.pos, point);
  if (dist >= light.reach) return 0;
  if (segmentBlocked(light.pos, point, obstacles)) return 0;
  return light.intensity * clamp(1 - dist / light.reach, 0, 1);
}

/**
 * Projects one runner away from one lamp. Returns `null` when the lamp cannot
 * reach them — which is exactly how a player disappears: stand in a pillar's
 * shade, or far enough out, and you cast nothing for anyone to chase.
 */
export function castShadow(
  runner: ShadowTagRunner,
  light: LightSource,
  obstacles: Obstacle[],
): ShadowCast | null {
  const opacity = illuminationAt(runner.pos, light, obstacles);
  if (opacity < SHADOW_MIN_OPACITY) return null;

  const away = normalize(sub(runner.pos, light.pos));
  if (away.x === 0 && away.y === 0) return null;

  const dist = distance(light.pos, runner.pos);
  const len = clamp(dist * LENGTH_RATIO, SHADOW_MIN_LENGTH, SHADOW_MAX_LENGTH);

  return {
    playerId: runner.id,
    lightId: light.id,
    from: { ...runner.pos },
    to: { x: runner.pos.x + away.x * len, y: runner.pos.y + away.y * len },
    nearRadius: PLAYER_RADIUS,
    farRadius: PLAYER_RADIUS + len * SHADOW_SPREAD,
    opacity,
  };
}

/** Every shadow currently on the floor, in draw order (faintest first). */
export function computeShadows(
  runners: ShadowTagRunner[],
  lights: LightSource[],
  obstacles: Obstacle[],
): ShadowCast[] {
  const casts: ShadowCast[] = [];
  for (const runner of runners) {
    if (!runner.connected) continue;
    for (const light of lights) {
      const cast = castShadow(runner, light, obstacles);
      if (cast) casts.push(cast);
    }
  }
  return casts.sort((a, b) => a.opacity - b.opacity);
}

/** Strongest lamp falling on a point — how exposed you are right now, 0..1. */
export function exposureAt(point: Vec2, lights: LightSource[], obstacles: Obstacle[]): number {
  let worst = 0;
  for (const light of lights) {
    worst = Math.max(worst, illuminationAt(point, light, obstacles));
  }
  return worst;
}

/** The shadows a single runner is throwing, used for the "you are visible" cue. */
export function shadowsOf(casts: ShadowCast[], playerId: string): ShadowCast[] {
  return casts.filter((cast) => cast.playerId === playerId);
}
