import type {
  ConveyorSegment,
  DeliveryTargetZone,
  MachineObject,
  MachineObstacle,
} from './conveyor-types';

export const GRAVITY = 520; // px/s²
export const AIR_DRAG = 0.996;
export const SHATTER_VELOCITY_DEFAULT = 220;

export interface CollisionResult {
  hit: boolean;
  shattered: boolean;
}

/**
 * Checks and resolves collision between a machine object and a conveyor segment.
 */
export function resolveSegmentCollision(
  obj: MachineObject,
  seg: ConveyorSegment,
  dt: number,
): CollisionResult {
  const cos = Math.cos(seg.angle);
  const sin = Math.sin(seg.angle);

  // Tangent points along belt surface; normal points upwards into air
  const tx = cos;
  const ty = sin;
  const nx = sin;
  const ny = -cos;

  const segY = seg.baseY + seg.elevation;
  const dx = obj.x - seg.x;
  const dy = obj.y - segY;

  const distTangent = dx * tx + dy * ty;
  const distNormal = dx * nx + dy * ny;

  const halfLength = seg.length / 2;
  const halfThick = seg.thickness / 2;
  const radius = obj.radius;

  // Check if object is within platform bounds
  if (distTangent < -halfLength - radius || distTangent > halfLength + radius) {
    return { hit: false, shattered: false };
  }

  // Top-surface collision window
  const surfaceDistance = distNormal - halfThick;
  if (surfaceDistance > radius || surfaceDistance < -halfThick - 6) {
    return { hit: false, shattered: false };
  }

  const normalVel = obj.vx * nx + obj.vy * ny;

  // Shatter check for fragile objects on hard impact
  if (obj.type === 'fragile' && normalVel < -obj.durability) {
    obj.status = 'broken';
    return { hit: true, shattered: true };
  }

  // Positional correction above belt surface
  const overlap = radius - surfaceDistance;
  if (overlap > 0) {
    obj.x += nx * overlap * 0.85;
    obj.y += ny * overlap * 0.85;
  }

  // Reflect velocity if moving toward the platform
  if (normalVel < 0) {
    const tangentVel = obj.vx * tx + obj.vy * ty;
    const relTangentVel = tangentVel - seg.speed;

    // Normal bounce with restitution
    const newNormalVel = -normalVel * obj.restitution;

    // Tangential friction and conveyor motor acceleration
    const frictionFactor = Math.min(1, obj.friction * 4 * (1 + dt * 60));
    const newTangentVel = seg.speed + relTangentVel * (1 - frictionFactor);

    obj.vx = tx * newTangentVel + nx * newNormalVel;
    obj.vy = ty * newTangentVel + ny * newNormalVel;

    // Ball roll spin
    obj.vRot = (newTangentVel / Math.max(8, radius)) * 0.5;

    return { hit: true, shattered: false };
  }

  return { hit: false, shattered: false };
}

/**
 * Checks and resolves collision with machine obstacles like gears or wind tunnels.
 */
export function resolveObstacleForces(
  obj: MachineObject,
  obstacle: MachineObstacle,
  dt: number,
): void {
  if (obstacle.type === 'wind_tunnel') {
    const width = obstacle.width ?? 120;
    const height = obstacle.height ?? 100;
    if (
      obj.x >= obstacle.x &&
      obj.x <= obstacle.x + width &&
      obj.y >= obstacle.y &&
      obj.y <= obstacle.y + height
    ) {
      obj.vx += (obstacle.windForceX ?? 0) * dt;
      obj.vy += (obstacle.windForceY ?? -300) * dt;
    }
  } else if (obstacle.type === 'gear') {
    const gearRadius = obstacle.radius ?? 40;
    const dx = obj.x - obstacle.x;
    const dy = obj.y - obstacle.y;
    const distSq = dx * dx + dy * dy;
    const minDist = gearRadius + obj.radius;

    if (distSq < minDist * minDist && distSq > 0.001) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Push out
      const overlap = minDist - dist;
      obj.x += nx * overlap;
      obj.y += ny * overlap;

      // Deflect velocity
      const normalVel = obj.vx * nx + obj.vy * ny;
      if (normalVel < 0) {
        obj.vx -= (1 + obj.restitution) * normalVel * nx;
        obj.vy -= (1 + obj.restitution) * normalVel * ny;

        // Gear rotation spin impulse
        const rotSpeed = obstacle.rotationSpeed ?? 2;
        obj.vx += -ny * rotSpeed * 30 * dt;
        obj.vy += nx * rotSpeed * 30 * dt;
      }
    }
  }
}

/**
 * Checks whether an object is inside the delivery target hopper.
 */
export function isObjectDelivered(obj: MachineObject, target: DeliveryTargetZone): boolean {
  return (
    obj.x >= target.x &&
    obj.x <= target.x + target.width &&
    obj.y >= target.y &&
    obj.y <= target.y + target.height
  );
}

/**
 * Updates a single object's motion and lifetime.
 */
export function stepObjectPhysics(
  obj: MachineObject,
  segments: ConveyorSegment[],
  obstacles: MachineObstacle[],
  target: DeliveryTargetZone,
  hazardY: number,
  dt: number,
): void {
  if (obj.status !== 'active') return;

  // Handle countdown for explosive cargo
  if (obj.type === 'explosive') {
    obj.timer -= dt;
    if (obj.timer <= 0) {
      obj.status = 'broken';
      return;
    }
  }

  // Apply gravity & drag
  obj.vy += GRAVITY * dt;
  obj.vx *= Math.pow(AIR_DRAG, dt * 60);
  obj.vy *= Math.pow(AIR_DRAG, dt * 60);

  // Apply obstacle forces (wind, gears)
  for (const obstacle of obstacles) {
    resolveObstacleForces(obj, obstacle, dt);
  }

  // Integrate position & rotation
  obj.x += obj.vx * dt;
  obj.y += obj.vy * dt;
  obj.rotation += obj.vRot * dt;

  // Check delivery target
  if (isObjectDelivered(obj, target)) {
    obj.status = 'delivered';
    return;
  }

  // Check hazard pit floor
  if (obj.y > hazardY) {
    obj.status = 'dropped';
    return;
  }

  // Platform collisions
  for (const seg of segments) {
    const col = resolveSegmentCollision(obj, seg, dt);
    if (col.shattered) return;
  }
}
