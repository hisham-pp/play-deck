import type {
  HazardCoil,
  MagnetPlayer,
  MetallicAnchor,
  TargetOrb,
  Vector2D,
} from '../types/magnet-mayhem.types';

export const PLAYER_RADIUS = 18;
export const ANCHOR_RADIUS = 24;
export const TARGET_RADIUS = 12;
export const HAZARD_RADIUS = 26;
export const MAX_SPEED = 560;
export const BASE_DRAG = 1.35;
export const ATTRACT_FORCE = 1350;
export const ATTRACT_RANGE = 440;
export const REPEL_FORCE = 1900;
export const REPEL_RANGE = 210;
export const WALL_RESTITUTION = 0.75;
export const COLLISION_RESTITUTION = 0.82;
export const ENERGY_DRAIN_ATTRACT = 26; // points per sec
export const ENERGY_DRAIN_REPEL = 44; // points per sec
export const ENERGY_RECHARGE = 32; // points per sec
export const HAZARD_ZAP_PENALTY = 5;
export const HAZARD_STUN_DURATION = 0.85;

export function vec(x: number, y: number): Vector2D {
  return { x, y };
}

export function vecAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s };
}

export function vecLength(v: Vector2D): number {
  return Math.hypot(v.x, v.y);
}

export function vecDist(a: Vector2D, b: Vector2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function vecDistSq(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function vecNormalize(v: Vector2D): Vector2D {
  const len = vecLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function vecDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculates pull force vector from player towards target anchor or object.
 * Applies slingshot assistance by prioritizing centripetal pull when circling.
 */
export function calculateAttractForce(
  playerPos: Vector2D,
  targetPos: Vector2D,
  customRange = ATTRACT_RANGE,
): Vector2D {
  const delta = vecSub(targetPos, playerPos);
  const dist = vecLength(delta);
  if (dist === 0 || dist > customRange) {
    return { x: 0, y: 0 };
  }

  // Smooth quadratic attenuation: stronger when closer, soft decay towards perimeter
  const ratio = Math.max(0, 1 - dist / customRange);
  const magnitude = ATTRACT_FORCE * Math.pow(ratio, 0.75);
  const dir = vecScale(delta, 1 / dist);
  return vecScale(dir, magnitude);
}

/**
 * Calculates outward radial repelling force vector pushing target away from source.
 */
export function calculateRepelForce(
  sourcePos: Vector2D,
  targetPos: Vector2D,
  customRange = REPEL_RANGE,
): Vector2D {
  const delta = vecSub(targetPos, sourcePos);
  const dist = vecLength(delta);
  if (dist === 0 || dist > customRange) {
    return { x: 0, y: 0 };
  }

  const ratio = Math.max(0, 1 - dist / customRange);
  const magnitude = REPEL_FORCE * Math.pow(ratio, 1.1);
  const dir = vecScale(delta, 1 / dist);
  return vecScale(dir, magnitude);
}

/**
 * Enforces arena boundary bounces with elastic restitution.
 */
export function resolveWallCollisions(
  pos: Vector2D,
  vel: Vector2D,
  radius: number,
  arenaWidth: number,
  arenaHeight: number,
): { pos: Vector2D; vel: Vector2D; bounced: boolean; speed: number } {
  let bounced = false;
  let newX = pos.x;
  let newY = pos.y;
  let newVx = vel.x;
  let newVy = vel.y;
  const initialSpeed = vecLength(vel);

  if (newX - radius < 0) {
    newX = radius;
    newVx = Math.abs(newVx) * WALL_RESTITUTION;
    bounced = true;
  } else if (newX + radius > arenaWidth) {
    newX = arenaWidth - radius;
    newVx = -Math.abs(newVx) * WALL_RESTITUTION;
    bounced = true;
  }

  if (newY - radius < 0) {
    newY = radius;
    newVy = Math.abs(newVy) * WALL_RESTITUTION;
    bounced = true;
  } else if (newY + radius > arenaHeight) {
    newY = arenaHeight - radius;
    newVy = -Math.abs(newVy) * WALL_RESTITUTION;
    bounced = true;
  }

  return {
    pos: { x: newX, y: newY },
    vel: { x: newVx, y: newVy },
    bounced,
    speed: initialSpeed,
  };
}

/**
 * Resolves elastic circle-to-circle collision between two mobile or solid entities.
 */
export function resolveCircleCollision(
  posA: Vector2D,
  velA: Vector2D,
  radiusA: number,
  posB: Vector2D,
  velB: Vector2D,
  radiusB: number,
  massA = 1,
  massB = 1,
  restitution = COLLISION_RESTITUTION,
): { posA: Vector2D; velA: Vector2D; posB: Vector2D; velB: Vector2D; collided: boolean } {
  const delta = vecSub(posB, posA);
  const dist = vecLength(delta);
  const minDist = radiusA + radiusB;

  if (dist >= minDist || dist === 0) {
    return { posA, velA, posB, velB, collided: false };
  }

  const normal = vecScale(delta, 1 / dist);
  const overlap = minDist - dist;

  // Separate positions based on mass ratio
  const totalMass = massA + massB;
  const moveA = vecScale(normal, -(overlap * (massB / totalMass)));
  const moveB = vecScale(normal, overlap * (massA / totalMass));

  const newPosA = vecAdd(posA, moveA);
  const newPosB = vecAdd(posB, moveB);

  // Impulse along collision normal
  const relativeVel = vecSub(velB, velA);
  const velAlongNormal = vecDot(relativeVel, normal);

  if (velAlongNormal > 0) {
    // Moving away from each other
    return { posA: newPosA, velA, posB: newPosB, velB, collided: true };
  }

  const impulseScalar = (-(1 + restitution) * velAlongNormal) / (1 / massA + 1 / massB);
  const impulse = vecScale(normal, impulseScalar);

  const newVelA = vecSub(velA, vecScale(impulse, 1 / massA));
  const newVelB = vecAdd(velB, vecScale(impulse, 1 / massB));

  return {
    posA: newPosA,
    velA: newVelA,
    posB: newPosB,
    velB: newVelB,
    collided: true,
  };
}

/**
 * Finds the nearest metallic anchor within range of a player.
 */
export function findNearestAnchor(
  playerPos: Vector2D,
  anchors: MetallicAnchor[],
  maxRange = ATTRACT_RANGE,
): MetallicAnchor | null {
  let closest: MetallicAnchor | null = null;
  let minDistance = maxRange;

  for (const anchor of anchors) {
    const d = vecDist(playerPos, { x: anchor.x, y: anchor.y });
    if (d < minDistance) {
      minDistance = d;
      closest = anchor;
    }
  }

  return closest;
}

/**
 * Checks if player is within collection range of a target orb.
 */
export function isTargetCollected(
  playerPos: Vector2D,
  playerRadius: number,
  target: TargetOrb,
): boolean {
  if (target.isCollected) return false;
  const d = vecDist(playerPos, { x: target.x, y: target.y });
  return d <= playerRadius + target.radius;
}

/**
 * Checks if player collides with an electric hazard coil.
 */
export function isHazardZapped(player: MagnetPlayer, hazard: HazardCoil): boolean {
  if (player.stunnedTimer > 0 || hazard.zapCooldown > 0) return false;
  const d = vecDist(player.position, { x: hazard.x, y: hazard.y });
  return d <= PLAYER_RADIUS + hazard.radius;
}
