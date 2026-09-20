import type {
  Vector2D,
  TankPlayer,
  ArenaBlock,
  Projectile,
  TankInput,
} from '../types/tiny-tank.types';

export const TANK_RADIUS = 18;
export const TANK_MAX_SPEED = 180; // pixels / second
export const TANK_ACCELERATION = 420;
export const TANK_REVERSE_SPEED = 110;
export const TANK_ROTATION_SPEED = 3.2; // radians / second
export const TANK_FRICTION = 0.88;

export function vectorAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vectorSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorScale(v: Vector2D, factor: number): Vector2D {
  return { x: v.x * factor, y: v.y * factor };
}

export function vectorLength(v: Vector2D): number {
  return Math.hypot(v.x, v.y);
}

export function vectorDistance(a: Vector2D, b: Vector2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function vectorNormalize(v: Vector2D): Vector2D {
  const len = vectorLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function vectorDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function circleIntersectsAABB(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): { collides: boolean; normalX: number; normalY: number; depth: number } {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);

  const distX = cx - closestX;
  const distY = cy - closestY;
  const distanceSq = distX * distX + distY * distY;

  if (distanceSq >= r * r) {
    return { collides: false, normalX: 0, normalY: 0, depth: 0 };
  }

  const distance = Math.sqrt(distanceSq);
  if (distance === 0) {
    // Circle center inside box; resolve to nearest edge
    const distLeft = cx - rx;
    const distRight = rx + rw - cx;
    const distTop = cy - ry;
    const distBottom = ry + rh - cy;
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft)
      return { collides: true, normalX: -1, normalY: 0, depth: r + distLeft };
    if (minDist === distRight)
      return { collides: true, normalX: 1, normalY: 0, depth: r + distRight };
    if (minDist === distTop) return { collides: true, normalX: 0, normalY: -1, depth: r + distTop };
    return { collides: true, normalX: 0, normalY: 1, depth: r + distBottom };
  }

  return {
    collides: true,
    normalX: distX / distance,
    normalY: distY / distance,
    depth: r - distance,
  };
}

export function updateTankPhysics(
  tank: TankPlayer,
  input: TankInput,
  blocks: ArenaBlock[],
  arenaWidth: number,
  arenaHeight: number,
  dt: number,
): TankPlayer {
  if (!tank.isAlive) return tank;

  let newAngle = tank.angle;
  if (input.turnLeft) {
    newAngle -= TANK_ROTATION_SPEED * dt;
  }
  if (input.turnRight) {
    newAngle += TANK_ROTATION_SPEED * dt;
  }

  // Normalize angle to -PI..PI
  while (newAngle > Math.PI) newAngle -= 2 * Math.PI;
  while (newAngle < -Math.PI) newAngle += 2 * Math.PI;

  // Compute forward/backward acceleration along hull facing
  const forwardDir = { x: Math.cos(newAngle), y: Math.sin(newAngle) };
  let vel = { ...tank.velocity };

  if (input.moveForward) {
    vel.x += forwardDir.x * TANK_ACCELERATION * dt;
    vel.y += forwardDir.y * TANK_ACCELERATION * dt;
  } else if (input.moveBackward) {
    vel.x -= forwardDir.x * TANK_ACCELERATION * 0.65 * dt;
    vel.y -= forwardDir.y * TANK_ACCELERATION * 0.65 * dt;
  }

  // Apply friction
  vel.x *= Math.pow(TANK_FRICTION, dt * 60);
  vel.y *= Math.pow(TANK_FRICTION, dt * 60);

  // Speed cap
  const currentSpeed = vectorLength(vel);
  if (currentSpeed > TANK_MAX_SPEED) {
    vel = vectorScale(vectorNormalize(vel), TANK_MAX_SPEED);
  }

  // Attempt move
  const newPos = {
    x: tank.position.x + vel.x * dt,
    y: tank.position.y + vel.y * dt,
  };

  // Boundary clamp
  newPos.x = clamp(newPos.x, TANK_RADIUS + 8, arenaWidth - TANK_RADIUS - 8);
  newPos.y = clamp(newPos.y, TANK_RADIUS + 8, arenaHeight - TANK_RADIUS - 8);

  // Collision with obstacles/blocks
  for (const block of blocks) {
    if (block.health <= 0) continue;
    const hit = circleIntersectsAABB(
      newPos.x,
      newPos.y,
      TANK_RADIUS,
      block.x,
      block.y,
      block.width,
      block.height,
    );
    if (hit.collides) {
      newPos.x += hit.normalX * hit.depth;
      newPos.y += hit.normalY * hit.depth;
      // Dampen velocity along normal
      const dot = vel.x * hit.normalX + vel.y * hit.normalY;
      if (dot < 0) {
        vel.x -= hit.normalX * dot;
        vel.y -= hit.normalY * dot;
      }
    }
  }

  return {
    ...tank,
    angle: newAngle,
    turretAngle: input.turretAngle,
    position: newPos,
    velocity: vel,
    recoilOffset: Math.max(0, tank.recoilOffset - dt * 25),
    invulnerableTimer: Math.max(0, tank.invulnerableTimer - dt),
    reloadTimer: Math.max(0, tank.reloadTimer - dt),
  };
}

export function resolveTankSeparation(tanks: TankPlayer[]): TankPlayer[] {
  const resolved = tanks.map((t) => ({ ...t, position: { ...t.position } }));

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const t1 = resolved[i];
      const t2 = resolved[j];
      if (!t1.isAlive || !t2.isAlive) continue;

      const dist = vectorDistance(t1.position, t2.position);
      const minDist = TANK_RADIUS * 2;
      if (dist < minDist && dist > 0.001) {
        const overlap = (minDist - dist) * 0.5;
        const nx = (t1.position.x - t2.position.x) / dist;
        const ny = (t1.position.y - t2.position.y) / dist;

        t1.position.x += nx * overlap;
        t1.position.y += ny * overlap;
        t2.position.x -= nx * overlap;
        t2.position.y -= ny * overlap;
      }
    }
  }

  return resolved;
}

export function updateProjectilePhysics(
  projectile: Projectile,
  targetPosition: Vector2D | null,
  dt: number,
): Projectile {
  let vel = { ...projectile.velocity };

  // Homing missile logic
  if (projectile.weapon === 'homing' && targetPosition) {
    const toTarget = vectorSub(targetPosition, projectile.position);
    const targetAngle = Math.atan2(toTarget.y, toTarget.x);
    let curAngle = Math.atan2(vel.y, vel.x);
    let diff = targetAngle - curAngle;

    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    const turnRate = 4.2 * dt;
    curAngle += clamp(diff, -turnRate, turnRate);

    const speed = Math.max(260, vectorLength(vel) + 120 * dt);
    vel = {
      x: Math.cos(curAngle) * speed,
      y: Math.sin(curAngle) * speed,
    };
  }

  const newPos = {
    x: projectile.position.x + vel.x * dt,
    y: projectile.position.y + vel.y * dt,
  };

  return {
    ...projectile,
    position: newPos,
    velocity: vel,
    lifetime: projectile.lifetime - dt,
    angle: Math.atan2(vel.y, vel.x),
  };
}

export function reflectVector(v: Vector2D, normalX: number, normalY: number): Vector2D {
  const dot = v.x * normalX + v.y * normalY;
  return {
    x: v.x - 2 * dot * normalX,
    y: v.y - 2 * dot * normalY,
  };
}
