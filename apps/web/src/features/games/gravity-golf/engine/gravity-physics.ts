import type {
  AsteroidHazard,
  BallState,
  CosmicCup,
  GravityObject,
  Vector2D,
  WallSegment,
} from '../types/gravity-golf.types';

export const ARENA_WIDTH = 1000;
export const ARENA_HEIGHT = 600;
export const BALL_RADIUS = 7;
export const GRAVITY_G = 16000;
export const SOFTENING_EPSILON = 28;
export const MAX_VELOCITY = 600;
export const MAX_FLIGHT_TICKS = 1800; // ~30 seconds at 60fps

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function distanceSq(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a: Vector2D, b: Vector2D): number {
  return Math.sqrt(distanceSq(a, b));
}

export function normalize(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len < 0.0001) return { x: 1, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Calculates net gravitational and field acceleration on the ball from all objects.
 */
export function calculateNetAcceleration(ballPos: Vector2D, objects: GravityObject[]): Vector2D {
  let ax = 0;
  let ay = 0;

  for (const obj of objects) {
    const dx = obj.position.x - ballPos.x;
    const dy = obj.position.y - ballPos.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    switch (obj.type) {
      case 'attractor': {
        // Inward Newtonian force with softening
        const force = (GRAVITY_G * obj.strength) / (distSq + SOFTENING_EPSILON * SOFTENING_EPSILON);
        if (dist > 0.001) {
          ax += (dx / dist) * force;
          ay += (dy / dist) * force;
        }
        break;
      }

      case 'repeller': {
        // Outward repulsive force with softening
        const force = (GRAVITY_G * obj.strength) / (distSq + SOFTENING_EPSILON * SOFTENING_EPSILON);
        if (dist > 0.001) {
          ax -= (dx / dist) * force;
          ay -= (dy / dist) * force;
        }
        break;
      }

      case 'directional': {
        // Directional push field within range
        const maxRange = obj.radius || 120;
        if (dist <= maxRange) {
          const falloff = 1 - dist / maxRange;
          const dir = obj.direction ? normalize(obj.direction) : { x: 1, y: 0 };
          const strength = (obj.strength || 1) * 350 * falloff;
          ax += dir.x * strength;
          ay += dir.y * strength;
        }
        break;
      }

      case 'orbit-ring': {
        // Orbit ring: pulls toward optimal radius, plus creates tangential orbital spin
        const targetRadius = obj.radius || 60;
        const radialDiff = dist - targetRadius;
        if (dist > 0.001 && dist < targetRadius * 2.2) {
          // Radial restoring spring
          const springForce = radialDiff * (obj.strength * 4.5);
          ax += (dx / dist) * springForce;
          ay += (dy / dist) * springForce;

          // Tangential vortex velocity push (counter-clockwise)
          const tangentX = -dy / dist;
          const tangentY = dx / dist;
          const vortexForce = obj.strength * 220;
          ax += tangentX * vortexForce;
          ay += tangentY * vortexForce;
        }
        break;
      }

      case 'gravity-wall':
        // Walls handle collision reflection rather than continuous field
        break;
    }
  }

  return { x: ax, y: ay };
}

/**
 * Checks and resolves wall reflections against segment walls and gravity walls.
 */
export function resolveWallCollisions(
  ballPos: Vector2D,
  ballVel: Vector2D,
  ballRadius: number,
  walls: WallSegment[],
  objects: GravityObject[],
): { pos: Vector2D; vel: Vector2D; bounced: boolean } {
  let currentPos = { ...ballPos };
  let currentVel = { ...ballVel };
  let bounced = false;

  const allWalls: WallSegment[] = [...walls];

  // Convert gravity-wall objects into wall segments
  for (const obj of objects) {
    if (obj.type === 'gravity-wall') {
      const len = obj.length || 80;
      const ang = obj.angle || 0;
      const hx = (Math.cos(ang) * len) / 2;
      const hy = (Math.sin(ang) * len) / 2;
      allWalls.push({
        x1: obj.position.x - hx,
        y1: obj.position.y - hy,
        x2: obj.position.x + hx,
        y2: obj.position.y + hy,
        restitution: 0.95, // High bounciness for gravity wall
      });
    }
  }

  for (const wall of allWalls) {
    const vx = wall.x2 - wall.x1;
    const vy = wall.y2 - wall.y1;
    const wallLenSq = vx * vx + vy * vy;
    if (wallLenSq < 0.001) continue;

    // Projection of ball onto segment
    const t = clamp(
      ((currentPos.x - wall.x1) * vx + (currentPos.y - wall.y1) * vy) / wallLenSq,
      0,
      1,
    );
    const closestX = wall.x1 + t * vx;
    const closestY = wall.y1 + t * vy;

    const dx = currentPos.x - closestX;
    const dy = currentPos.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < ballRadius * ballRadius && distSq > 0.00001) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Normal velocity component
      const dot = currentVel.x * nx + currentVel.y * ny;
      if (dot < 0) {
        const restitution = wall.restitution ?? 0.85;
        currentVel = {
          x: currentVel.x - (1 + restitution) * dot * nx,
          y: currentVel.y - (1 + restitution) * dot * ny,
        };

        // Push ball out of intersection
        currentPos = {
          x: closestX + nx * (ballRadius + 0.5),
          y: closestY + ny * (ballRadius + 0.5),
        };
        bounced = true;
      }
    }
  }

  return { pos: currentPos, vel: currentVel, bounced };
}

/**
 * Checks asteroid hazards. Collisions absorb the ball.
 */
export function checkHazardCollision(
  ballPos: Vector2D,
  ballRadius: number,
  hazards: AsteroidHazard[],
): boolean {
  for (const hazard of hazards) {
    const threshold = hazard.radius + ballRadius;
    if (distanceSq(ballPos, hazard.position) <= threshold * threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether ball reached the cup and applies capture funneling.
 */
export function updateCupInteraction(
  ballPos: Vector2D,
  ballVel: Vector2D,
  cup: CosmicCup,
): { status: 'none' | 'sunk' | 'funneling'; assistAccel?: Vector2D } {
  const dist = distance(ballPos, cup.position);
  const speed = Math.sqrt(ballVel.x * ballVel.x + ballVel.y * ballVel.y);

  if (dist <= cup.radius) {
    if (speed <= cup.captureSpeed * 1.5) {
      return { status: 'sunk' };
    }
  }

  if (dist <= cup.captureRadius && speed <= cup.captureSpeed) {
    // Gravitational suction toward the hole
    const dir = normalize({
      x: cup.position.x - ballPos.x,
      y: cup.position.y - ballPos.y,
    });
    const suckForce = 400 * (1 - dist / cup.captureRadius);
    return {
      status: 'funneling',
      assistAccel: { x: dir.x * suckForce, y: dir.y * suckForce },
    };
  }

  return { status: 'none' };
}

/**
 * Advance physics by one fixed delta time tick (default dt = 1/60).
 */
export function stepPhysicsTick(
  ball: BallState,
  objects: GravityObject[],
  hazards: AsteroidHazard[],
  walls: WallSegment[],
  cup: CosmicCup,
  dt = 1 / 60,
): { ball: BallState; bounced: boolean } {
  if (ball.status !== 'in_flight') {
    return { ball, bounced: false };
  }

  // 1. Calculate gravity and field acceleration
  const netAccel = calculateNetAcceleration(ball.position, objects);

  // 2. Cup suction check
  const cupResult = updateCupInteraction(ball.position, ball.velocity, cup);
  if (cupResult.status === 'sunk') {
    return {
      ball: {
        ...ball,
        status: 'sunk',
        position: { ...cup.position },
        velocity: { x: 0, y: 0 },
        flightTicks: ball.flightTicks + 1,
      },
      bounced: false,
    };
  }

  if (cupResult.assistAccel) {
    netAccel.x += cupResult.assistAccel.x;
    netAccel.y += cupResult.assistAccel.y;
  }

  // 3. Update velocity
  let vx = ball.velocity.x + netAccel.x * dt;
  let vy = ball.velocity.y + netAccel.y * dt;

  // Clamp speed to prevent cosmic runaway
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > MAX_VELOCITY) {
    vx = (vx / speed) * MAX_VELOCITY;
    vy = (vy / speed) * MAX_VELOCITY;
  }

  // Slight cosmic dampening (space drag)
  vx *= 0.9995;
  vy *= 0.9995;

  // 4. Update position
  const nextPos: Vector2D = {
    x: ball.position.x + vx * dt,
    y: ball.position.y + vy * dt,
  };

  // 5. Collision with walls
  const wallCollision = resolveWallCollisions(
    nextPos,
    { x: vx, y: vy },
    ball.radius,
    walls,
    objects,
  );

  // 6. Hazard check
  if (checkHazardCollision(wallCollision.pos, ball.radius, hazards)) {
    return {
      ball: {
        ...ball,
        position: wallCollision.pos,
        velocity: { x: 0, y: 0 },
        status: 'absorbed',
        flightTicks: ball.flightTicks + 1,
      },
      bounced: false,
    };
  }

  // 7. Bounds check
  const isOutOfBounds =
    wallCollision.pos.x < -120 ||
    wallCollision.pos.x > ARENA_WIDTH + 120 ||
    wallCollision.pos.y < -120 ||
    wallCollision.pos.y > ARENA_HEIGHT + 120 ||
    ball.flightTicks > MAX_FLIGHT_TICKS;

  if (isOutOfBounds) {
    return {
      ball: {
        ...ball,
        position: wallCollision.pos,
        velocity: { x: 0, y: 0 },
        status: 'out_of_bounds',
        flightTicks: ball.flightTicks + 1,
      },
      bounced: wallCollision.bounced,
    };
  }

  // Update trail (every 3 ticks for smooth trailing visuals)
  const newTrail = [...ball.trail];
  if (ball.flightTicks % 2 === 0) {
    newTrail.push({ ...wallCollision.pos });
    if (newTrail.length > 40) {
      newTrail.shift();
    }
  }

  return {
    ball: {
      ...ball,
      position: wallCollision.pos,
      velocity: wallCollision.vel,
      status: 'in_flight',
      trail: newTrail,
      flightTicks: ball.flightTicks + 1,
    },
    bounced: wallCollision.bounced,
  };
}
