import type {
  Gait,
  GiantInput,
  GiantWorld,
  MapDefinition,
  Obstacle,
  Thief,
  Vec2,
} from '../types/giant.types';
import { clamp, closestOnSegment, normalize } from './geometry';
import { limbSegment } from './giant-ai';
import {
  CARRY_SLOW_FLOOR,
  CARRY_SLOW_PER_ITEM,
  RUN_SPEED,
  THIEF_DAMPING,
  THIEF_RADIUS,
  TIPTOE_SPEED,
  WALK_SPEED,
} from './giant-constants';

const GAIT_SPEED: Record<Gait, number> = {
  tiptoe: TIPTOE_SPEED,
  walk: WALK_SPEED,
  run: RUN_SPEED,
};

/** Damping is authored per 16ms frame, so it is re-based onto the real step. */
function dampingFor(dtSec: number): number {
  return Math.pow(THIEF_DAMPING, (dtSec * 1000) / 16);
}

export function gaitFor(input: GiantInput): Gait {
  if (input.tiptoe) return 'tiptoe';
  return input.run ? 'run' : 'walk';
}

/** Loot is heavy: a full pack costs speed as well as silence. */
export function speedFor(thief: Thief): number {
  const burden = Math.max(CARRY_SLOW_FLOOR, 1 - thief.carriedCount * CARRY_SLOW_PER_ITEM);
  return GAIT_SPEED[thief.gait] * burden;
}

/** Pushes a circle out of one box along whichever axis it overlaps least. */
function resolveBox(pos: Vec2, box: Obstacle, radius: number): boolean {
  const nearestX = clamp(pos.x, box.x, box.x + box.w);
  const nearestY = clamp(pos.y, box.y, box.y + box.h);
  const dx = pos.x - nearestX;
  const dy = pos.y - nearestY;
  const distSq = dx * dx + dy * dy;

  if (distSq > radius * radius) return false;

  if (distSq > 1e-6) {
    const dist = Math.sqrt(distSq);
    pos.x = nearestX + (dx / dist) * radius;
    pos.y = nearestY + (dy / dist) * radius;
    return true;
  }

  // Dead centre of the box: pick the closest face and slide out through it.
  const faces = [
    [pos.x - box.x, () => (pos.x = box.x - radius)],
    [box.x + box.w - pos.x, () => (pos.x = box.x + box.w + radius)],
    [pos.y - box.y, () => (pos.y = box.y - radius)],
    [box.y + box.h - pos.y, () => (pos.y = box.y + box.h + radius)],
  ] as const;
  faces.reduce((best, face) => (face[0] < best[0] ? face : best))[1]();
  return true;
}

/** Pushes a circle out of another circle — the giant's head. */
function resolveCircle(pos: Vec2, centre: Vec2, circleRadius: number, radius: number): boolean {
  const dx = pos.x - centre.x;
  const dy = pos.y - centre.y;
  const dist = Math.hypot(dx, dy);
  const minDist = circleRadius + radius;
  if (dist >= minDist) return false;

  const heading = dist > 1e-6 ? { x: dx / dist, y: dy / dist } : { x: 0, y: -1 };
  pos.x = centre.x + heading.x * minDist;
  pos.y = centre.y + heading.y * minDist;
  return true;
}

/** Pushes a circle out of a capsule — an arm, whatever angle it is lying at. */
function resolveCapsule(pos: Vec2, a: Vec2, b: Vec2, capRadius: number, radius: number): boolean {
  return resolveCircle(pos, closestOnSegment(a, b, pos), capRadius, radius);
}

/**
 * Settles a position against every solid thing in the room and returns the
 * shove it took to do it, pointing away from whatever was in the way.
 *
 * A vector rather than a yes/no: a thief resting against a wall is touching it
 * on every single frame, so anything that treated contact as a collision would
 * charge them for a crash forever while they stood still. The direction is
 * what lets the caller kill the part of their speed aimed into the wall.
 */
export function resolveCollisions(pos: Vec2, map: MapDefinition, radius = THIEF_RADIUS): Vec2 {
  const beforeX = pos.x;
  const beforeY = pos.y;

  for (const box of map.obstacles) resolveBox(pos, box, radius);
  resolveBox(pos, map.giant.torso, radius);
  resolveCircle(pos, map.giant.head.pos, map.giant.head.radius, radius);
  for (const limb of map.giant.limbs) {
    const { a, b } = limbSegment(limb);
    resolveCapsule(pos, a, b, limb.radius, radius);
  }

  pos.x = clamp(pos.x, radius, map.width - radius);
  pos.y = clamp(pos.y, radius, map.height - radius);

  return { x: pos.x - beforeX, y: pos.y - beforeY };
}

/** How far a thief has to be shoved back for it to count as a real collision. */
const BUMP_MIN_PUSH = 0.6;

export interface MoveReport {
  /** True on the frame this thief ran into something solid hard enough to hear. */
  bumped: boolean;
  /** Distance actually travelled, in units — used to pace footfall ripples. */
  travelled: number;
}

/**
 * Advances one thief. Steering is velocity-based rather than teleporting the
 * position, so stopping short of a wall is a skill rather than a reflex.
 */
export function stepThief(
  thief: Thief,
  input: GiantInput,
  world: GiantWorld,
  dtSec: number,
): MoveReport {
  thief.gait = gaitFor(input);

  const heading = normalize({ x: input.moveX, y: input.moveY });
  const target = speedFor(thief);
  const keep = dampingFor(dtSec);
  thief.vel.x = thief.vel.x * keep + heading.x * target * (1 - keep);
  thief.vel.y = thief.vel.y * keep + heading.y * target * (1 - keep);

  const speed = Math.hypot(thief.vel.x, thief.vel.y);
  if (speed > 1) thief.facing = Math.atan2(thief.vel.y, thief.vel.x);

  const beforeX = thief.pos.x;
  const beforeY = thief.pos.y;
  thief.pos.x += thief.vel.x * dtSec;
  thief.pos.y += thief.vel.y * dtSec;

  const push = resolveCollisions(thief.pos, world.map);
  const pushed = Math.hypot(push.x, push.y);

  // A crash is a real shove at a real speed. Easing into a wall on tiptoe is
  // how you are supposed to get past one, so it stays silent.
  const bumped = pushed > BUMP_MIN_PUSH && speed > TIPTOE_SPEED;

  // Kill the part of the speed aimed into the surface, so a thief slides along
  // a wall instead of driving into it and being shoved back every frame.
  if (pushed > 1e-6) {
    const nx = push.x / pushed;
    const ny = push.y / pushed;
    const into = thief.vel.x * nx + thief.vel.y * ny;
    if (into < 0) {
      thief.vel.x -= nx * into;
      thief.vel.y -= ny * into;
    }
  }

  const travelled = Math.hypot(thief.pos.x - beforeX, thief.pos.y - beforeY);

  // Only real travel counts towards a footfall; being shoved by a wall does not.
  thief.strideMs = travelled < 0.4 ? 0 : thief.strideMs + dtSec * 1000;

  return { bumped, travelled };
}

export interface ThiefCollision {
  a: Thief;
  b: Thief;
  at: Vec2;
}

/** How hard two thieves have to meet before it counts as barging, not brushing. */
const BARGE_MIN_PUSH = 0.6;

/**
 * Separates any two thieves standing in the same place, and reports only the
 * pairs that actually met at speed. Two people edging past each other in the
 * dark is the game working; barging is the mistake — and as with walls, resting
 * shoulder to shoulder must not be charged over and over.
 */
export function resolveThiefPairs(thieves: Thief[]): ThiefCollision[] {
  const collisions: ThiefCollision[] = [];
  const minDist = THIEF_RADIUS * 2;

  for (let i = 0; i < thieves.length; i++) {
    for (let j = i + 1; j < thieves.length; j++) {
      const a = thieves[i];
      const b = thieves[j];
      if (!a.connected || !b.connected || a.escaped || b.escaped) continue;

      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= minDist) continue;

      const nx = dist > 1e-6 ? dx / dist : 1;
      const ny = dist > 1e-6 ? dy / dist : 0;
      const push = (minDist - dist) / 2;
      a.pos.x -= nx * push;
      a.pos.y -= ny * push;
      b.pos.x += nx * push;
      b.pos.y += ny * push;

      const fastest = Math.max(Math.hypot(a.vel.x, a.vel.y), Math.hypot(b.vel.x, b.vel.y));
      if (push <= BARGE_MIN_PUSH || fastest <= TIPTOE_SPEED) continue;

      collisions.push({ a, b, at: { x: (a.pos.x + b.pos.x) / 2, y: (a.pos.y + b.pos.y) / 2 } });
    }
  }

  return collisions;
}
