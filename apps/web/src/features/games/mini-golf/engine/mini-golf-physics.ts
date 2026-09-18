import type {
  Ball,
  CircleZone,
  HoleDefinition,
  RectZone,
  Rotator,
  Vector2D,
} from './mini-golf-types';

export const BASE_FRICTION = 0.985; // Normal green rolling friction
export const SAND_FRICTION = 0.92; // Heavy sand resistance
export const MAX_SHOT_SPEED = 650; // Maximum initial speed in px/s
export const REST_SPEED_THRESHOLD = 6.0; // Ball stops when speed falls below this
export const CUP_CAPTURE_MAX_SPEED = 240; // Above this speed, ball lips out of the cup

/** Distance from point P to line segment AB */
export function pointToSegmentDistance(
  p: Vector2D,
  a: Vector2D,
  b: Vector2D,
): { dist: number; closest: Vector2D; normal: Vector2D } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {
    const dist = Math.hypot(p.x - a.x, p.y - a.y);
    return {
      dist,
      closest: { x: a.x, y: a.y },
      normal: dist > 0 ? { x: (p.x - a.x) / dist, y: (p.y - a.y) / dist } : { x: 0, y: -1 },
    };
  }

  // Projection parameter t
  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;
  const dx = p.x - closestX;
  const dy = p.y - closestY;
  const dist = Math.hypot(dx, dy);

  const nx = dist > 0 ? dx / dist : -aby / Math.sqrt(abLenSq);
  const ny = dist > 0 ? dy / dist : abx / Math.sqrt(abLenSq);

  return { dist, closest: { x: closestX, y: closestY }, normal: { x: nx, y: ny } };
}

export function isInsideRect(p: Vector2D, rect: RectZone): boolean {
  return (
    p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height
  );
}

export function isInsideCircle(p: Vector2D, circle: CircleZone): boolean {
  return Math.hypot(p.x - circle.x, p.y - circle.y) <= circle.radius;
}

export function isInsideZone(p: Vector2D, zone: RectZone | CircleZone): boolean {
  if ('radius' in zone) {
    return isInsideCircle(p, zone);
  }
  return isInsideRect(p, zone);
}

export interface PhysicsStepEvents {
  hitWall: boolean;
  hitBumper: boolean;
  hitSand: boolean;
  hitWater: boolean;
  hitPortal: boolean;
  inHole: boolean;
  lipOut: boolean;
}

/**
 * Advance ball physics by `dt` seconds within the given hole.
 */
export function updateBallPhysics(
  ball: Ball,
  hole: HoleDefinition,
  rotators: Rotator[],
  dt: number,
): PhysicsStepEvents {
  const events: PhysicsStepEvents = {
    hitWall: false,
    hitBumper: false,
    hitSand: false,
    hitWater: false,
    hitPortal: false,
    inHole: false,
    lipOut: false,
  };

  if (ball.inHole || ball.inWater || ball.isResting) {
    return events;
  }

  // 1. Terrain zone interactions
  let currentFriction = BASE_FRICTION;
  const inSand = hole.sandTraps.some((zone) => isInsideZone({ x: ball.x, y: ball.y }, zone));
  if (inSand) {
    currentFriction = SAND_FRICTION;
    events.hitSand = true;
  }

  // Water hazard check
  const inWater = hole.waterHazards.some((zone) => isInsideZone({ x: ball.x, y: ball.y }, zone));
  if (inWater) {
    ball.inWater = true;
    ball.vx = 0;
    ball.vy = 0;
    events.hitWater = true;
    return events;
  }

  // Booster zones
  for (const booster of hole.boosters) {
    if (isInsideRect({ x: ball.x, y: ball.y }, booster)) {
      ball.vx += booster.direction.x * booster.force * dt;
      ball.vy += booster.direction.y * booster.force * dt;
    }
  }

  // Apply friction decay scaled by delta time
  const frictionFactor = Math.pow(currentFriction, dt * 60);
  ball.vx *= frictionFactor;
  ball.vy *= frictionFactor;

  // 2. Integration
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Track motion trail for silky visuals
  if (Math.hypot(ball.vx, ball.vy) > 20) {
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 12) {
      ball.trail.shift();
    }
  } else if (ball.trail.length > 0) {
    ball.trail.shift();
  }

  // 3. Cup Attraction & Hole Sink Check
  const distToCup = Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y);
  const currentSpeed = Math.hypot(ball.vx, ball.vy);

  if (distToCup < hole.cup.radius * 1.6) {
    // Gravitational funnel pull toward the cup center
    const pull = (hole.cup.radius * 1.6 - distToCup) * 12;
    const dirX = (hole.cup.x - ball.x) / (distToCup || 1);
    const dirY = (hole.cup.y - ball.y) / (distToCup || 1);
    ball.vx += dirX * pull * dt;
    ball.vy += dirY * pull * dt;

    if (distToCup < hole.cup.radius * 0.75) {
      if (currentSpeed <= CUP_CAPTURE_MAX_SPEED) {
        ball.inHole = true;
        ball.vx = 0;
        ball.vy = 0;
        ball.x = hole.cup.x;
        ball.y = hole.cup.y;
        ball.isResting = true;
        events.inHole = true;
        return events;
      } else {
        // Lip out: ball deflects around the rim
        const perpX = -dirY;
        const perpY = dirX;
        ball.vx = ball.vx * 0.65 + perpX * 80;
        ball.vy = ball.vy * 0.65 + perpY * 80;
        events.lipOut = true;
      }
    }
  }

  // 4. Wall Collisions
  for (const wall of hole.walls) {
    const { dist, normal } = pointToSegmentDistance({ x: ball.x, y: ball.y }, wall.p1, wall.p2);
    if (dist < ball.radius) {
      const penetration = ball.radius - dist;
      ball.x += normal.x * penetration;
      ball.y += normal.y * penetration;

      const dot = ball.vx * normal.x + ball.vy * normal.y;
      if (dot < 0) {
        const restitution = wall.restitution ?? 0.76;
        ball.vx -= (1 + restitution) * dot * normal.x;
        ball.vy -= (1 + restitution) * dot * normal.y;
        events.hitWall = true;
      }
    }
  }

  // 5. Bumper Collisions
  for (const bumper of hole.bumpers) {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const dist = Math.hypot(dx, dy);
    const minDist = bumper.radius + ball.radius;

    if (dist < minDist) {
      const nx = dist > 0 ? dx / dist : 1;
      const ny = dist > 0 ? dy / dist : 0;

      // Push ball out
      const penetration = minDist - dist;
      ball.x += nx * penetration;
      ball.y += ny * penetration;

      // Elastic impulse bounce
      const bounceSpeed = Math.max(Math.hypot(ball.vx, ball.vy) * 1.15, bumper.impulse);
      ball.vx = nx * bounceSpeed;
      ball.vy = ny * bounceSpeed;

      bumper.activeUntil = Date.now() + 150;
      events.hitBumper = true;
    }
  }

  // 6. Rotating Obstacles
  for (const rot of rotators) {
    const cos = Math.cos(rot.angle);
    const sin = Math.sin(rot.angle);
    const halfLen = rot.length / 2;

    const p1: Vector2D = { x: rot.x - cos * halfLen, y: rot.y - sin * halfLen };
    const p2: Vector2D = { x: rot.x + cos * halfLen, y: rot.y + sin * halfLen };

    const { dist, normal } = pointToSegmentDistance({ x: ball.x, y: ball.y }, p1, p2);
    const effectiveRadius = ball.radius + rot.width / 2;

    if (dist < effectiveRadius) {
      const penetration = effectiveRadius - dist;
      ball.x += normal.x * penetration;
      ball.y += normal.y * penetration;

      // Tangential sweep speed from rotation
      const rDist = Math.hypot(ball.x - rot.x, ball.y - rot.y);
      const rotVelocity = rDist * rot.speed;
      const tangX = -sin * rotVelocity;
      const tangY = cos * rotVelocity;

      ball.vx = -ball.vx * 0.6 + tangX * 0.5;
      ball.vy = -ball.vy * 0.6 + tangY * 0.5;
      events.hitWall = true;
    }
  }

  // 7. Portals
  for (const portal of hole.portals) {
    const distToEntry = Math.hypot(ball.x - portal.entry.x, ball.y - portal.entry.y);
    if (distToEntry < portal.radius) {
      // Warp ball to exit and carry momentum
      ball.x = portal.exit.x;
      ball.y = portal.exit.y;
      events.hitPortal = true;
    }
  }

  // 8. Rest Check
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed < REST_SPEED_THRESHOLD) {
    ball.vx = 0;
    ball.vy = 0;
    ball.isResting = true;
    ball.trail = [];
  }

  return events;
}

/**
 * Predict the flight / roll trajectory path for aiming preview.
 */
export function calculateTrajectory(
  origin: Vector2D,
  angle: number,
  power: number,
  hole: HoleDefinition,
  maxDistance: number = 320,
): Vector2D[] {
  if (power <= 0.02) return [];

  const points: Vector2D[] = [{ ...origin }];
  const simBall: Ball = {
    x: origin.x,
    y: origin.y,
    vx: Math.cos(angle) * power * MAX_SHOT_SPEED,
    vy: Math.sin(angle) * power * MAX_SHOT_SPEED,
    radius: 7,
    inHole: false,
    inWater: false,
    isResting: false,
    lastLie: { ...origin },
    trail: [],
  };

  const dt = 1 / 60;
  let totalDist = 0;

  for (let i = 0; i < 45; i++) {
    const prevX = simBall.x;
    const prevY = simBall.y;

    updateBallPhysics(simBall, hole, [], dt);

    const stepDist = Math.hypot(simBall.x - prevX, simBall.y - prevY);
    totalDist += stepDist;

    // Sample points every ~15px
    if (i % 3 === 0 || simBall.inHole) {
      points.push({ x: simBall.x, y: simBall.y });
    }

    if (simBall.isResting || simBall.inHole || simBall.inWater || totalDist > maxDistance) {
      break;
    }
  }

  return points;
}
