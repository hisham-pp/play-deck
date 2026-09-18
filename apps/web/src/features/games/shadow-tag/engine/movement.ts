import type {
  ArenaDefinition,
  Obstacle,
  ShadowTagInput,
  ShadowTagRunner,
  Vec2,
} from '../types/shadow-tag.types';
import { clamp, normalize } from './geometry';
import {
  PLAYER_DAMPING,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  SNEAK_SPEED_FACTOR,
} from './shadow-tag-constants';

/** Damping is authored per 16ms frame, so it is re-based onto the real step. */
function dampingFor(dtSec: number): number {
  return Math.pow(PLAYER_DAMPING, (dtSec * 1000) / 16);
}

/** Pushes a circle out of one pillar along whichever axis it overlaps least. */
function resolveBox(pos: Vec2, box: Obstacle, radius: number): void {
  const nearestX = clamp(pos.x, box.x, box.x + box.w);
  const nearestY = clamp(pos.y, box.y, box.y + box.h);
  const dx = pos.x - nearestX;
  const dy = pos.y - nearestY;
  const distSq = dx * dx + dy * dy;

  if (distSq > radius * radius) return;

  if (distSq > 1e-6) {
    const dist = Math.sqrt(distSq);
    pos.x = nearestX + (dx / dist) * radius;
    pos.y = nearestY + (dy / dist) * radius;
    return;
  }

  // Dead centre of the box: pick the closest face and slide out through it.
  const left = pos.x - box.x;
  const right = box.x + box.w - pos.x;
  const top = pos.y - box.y;
  const bottom = box.y + box.h - pos.y;
  const smallest = Math.min(left, right, top, bottom);

  if (smallest === left) pos.x = box.x - radius;
  else if (smallest === right) pos.x = box.x + box.w + radius;
  else if (smallest === top) pos.y = box.y - radius;
  else pos.y = box.y + box.h + radius;
}

export function resolveCollisions(pos: Vec2, arena: ArenaDefinition, radius = PLAYER_RADIUS): void {
  for (const box of arena.obstacles) resolveBox(pos, box, radius);
  pos.x = clamp(pos.x, radius, arena.width - radius);
  pos.y = clamp(pos.y, radius, arena.height - radius);
}

export function speedFor(input: ShadowTagInput): number {
  return input.sneak ? PLAYER_SPEED * SNEAK_SPEED_FACTOR : PLAYER_SPEED;
}

/**
 * Advances one runner. Steering is velocity-based rather than teleporting the
 * position, so a shadow sweeps rather than snapping — which is the whole read
 * of the game.
 */
export function stepRunner(
  runner: ShadowTagRunner,
  input: ShadowTagInput,
  arena: ArenaDefinition,
  dtSec: number,
): void {
  const heading = normalize({ x: input.moveX, y: input.moveY });
  const target = speedFor(input);
  const desiredX = heading.x * target;
  const desiredY = heading.y * target;

  const keep = dampingFor(dtSec);
  runner.vel.x = runner.vel.x * keep + desiredX * (1 - keep);
  runner.vel.y = runner.vel.y * keep + desiredY * (1 - keep);

  const moved = Math.hypot(runner.vel.x, runner.vel.y);
  if (moved > 1) runner.facing = Math.atan2(runner.vel.y, runner.vel.x);

  runner.pos.x += runner.vel.x * dtSec;
  runner.pos.y += runner.vel.y * dtSec;
  runner.sneaking = input.sneak;

  resolveCollisions(runner.pos, arena);

  // Only a real jog leaves tracks; a sneak is quiet by design.
  runner.strideMs = input.sneak || moved < target * 0.35 ? 0 : runner.strideMs + dtSec * 1000;
}
