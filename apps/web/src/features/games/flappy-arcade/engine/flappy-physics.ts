import type { BirdState, FlappyEngineConfig, ObstaclePipe } from './flappy-types';

export const DEFAULT_FLAPPY_CONFIG: FlappyEngineConfig = {
  worldWidth: 480,
  worldHeight: 640,
  groundHeight: 70,
  ceilingHeight: 10,
  gravity: 1100, // px/s^2
  flapImpulse: 380, // px/s upward
  maxFallSpeed: 600,
  pipeWidth: 64,
  baseSpeed: 170,
  maxSpeed: 280,
  baseGap: 150,
  minGap: 110,
};

/**
 * Updates bird position, applies gravity, and computes pitch rotation based on velocity.
 */
export function stepBirdPhysics(
  bird: BirdState,
  dt: number,
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): BirdState {
  // Apply gravity clamped to maxFallSpeed
  const vy = Math.min(bird.vy + config.gravity * dt, config.maxFallSpeed);
  const y = bird.y + vy * dt;

  // Calculate tilt angle based on velocity:
  // Rising quickly: tilts up to -25 deg (-0.44 rad)
  // Falling quickly: tilts down to +75 deg (+1.31 rad)
  const targetRotation =
    vy < 0
      ? (vy / config.flapImpulse) * 0.44 // Upward tilt
      : Math.min(vy / config.maxFallSpeed, 1) * 1.31; // Downward dive

  // Smooth rotation interpolation
  const rotation = bird.rotation + (targetRotation - bird.rotation) * Math.min(dt * 12, 1);
  const flapCooldown = Math.max(0, bird.flapCooldown - dt);

  return {
    ...bird,
    y,
    vy,
    rotation,
    flapCooldown,
  };
}

/**
 * Applies vertical flap impulse to the bird.
 */
export function applyFlapImpulse(
  bird: BirdState,
  flapImpulse: number = DEFAULT_FLAPPY_CONFIG.flapImpulse,
): BirdState {
  return {
    ...bird,
    vy: -flapImpulse,
    rotation: -0.4, // Instant upward pitch response
    flapCooldown: 0.12, // Minimum cooldown between consecutive taps
  };
}

/**
 * Checks circle-to-axis-aligned-bounding-box (AABB) collision.
 */
export function checkCircleBoxCollision(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  // Distance squared between circle center and closest point
  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy < radius * radius;
}

/**
 * Evaluates whether the bird collides with the ground or ceiling boundaries.
 */
export function checkBoundaryCollision(
  bird: BirdState,
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): { hitCeiling: boolean; hitGround: boolean } {
  const hitCeiling = bird.y - bird.radius <= config.ceilingHeight;
  const hitGround = bird.y + bird.radius >= config.worldHeight - config.groundHeight;

  return { hitCeiling, hitGround };
}

/**
 * Checks collision with a given pipe obstacle (both top and bottom sections).
 */
export function checkPipeCollision(
  bird: BirdState,
  pipe: ObstaclePipe,
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): boolean {
  // Broad-phase X rejection
  if (bird.x + bird.radius < pipe.x || bird.x - bird.radius > pipe.x + pipe.width) {
    return false;
  }

  // Top pipe box: [pipe.x, 0, pipe.width, pipe.topHeight]
  const hitTop = checkCircleBoxCollision(
    bird.x,
    bird.y,
    bird.radius,
    pipe.x,
    0,
    pipe.width,
    pipe.topHeight,
  );
  if (hitTop) return true;

  // Bottom pipe box: [pipe.x, pipe.bottomY, pipe.width, worldHeight - groundHeight - pipe.bottomY]
  const bottomPipeHeight = config.worldHeight - config.groundHeight - pipe.bottomY;
  const hitBottom = checkCircleBoxCollision(
    bird.x,
    bird.y,
    bird.radius,
    pipe.x,
    pipe.bottomY,
    pipe.width,
    bottomPipeHeight,
  );

  return hitBottom;
}
