import { calculateDifficulty, generatePipeHeights } from './flappy-difficulty';
import {
  applyFlapImpulse,
  checkBoundaryCollision,
  checkPipeCollision,
  DEFAULT_FLAPPY_CONFIG,
  stepBirdPhysics,
} from './flappy-physics';
export { DEFAULT_FLAPPY_CONFIG };

import type {
  BirdState,
  FlappyEngineConfig,
  FlappyGameState,
  FlappyInput,
  ObstaclePipe,
  Particle,
} from './flappy-types';

export interface FlappyEngineEvents {
  onFlap?: () => void;
  onScore?: (score: number) => void;
  onCollision?: () => void;
  onGameOver?: (finalScore: number) => void;
}

export const INITIAL_BIRD_STATE: BirdState = {
  x: 120,
  y: 280,
  vy: 0,
  rotation: 0,
  radius: 14,
  flapCooldown: 0,
};

export function createInitialFlappyState(
  highScore: number = 0,
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): FlappyGameState {
  return {
    status: 'idle',
    score: 0,
    highScore,
    bird: { ...INITIAL_BIRD_STATE },
    pipes: [],
    particles: [],
    difficulty: calculateDifficulty(0, config),
    screenShake: 0,
    timeAlive: 0,
    lastPipeId: 0,
    distanceTraveled: 0,
  };
}

/**
 * Creates thruster exhaust particles behind the cyber-avian bird.
 */
export function createThrusterParticles(bird: BirdState, count: number = 2): Particle[] {
  const particles: Particle[] = [];
  const baseAngle = bird.rotation + Math.PI; // Opposite to heading

  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * 0.4;
    const speed = 70 + Math.random() * 50;
    particles.push({
      id: Math.random(),
      x: bird.x - Math.cos(bird.rotation) * bird.radius,
      y: bird.y - Math.sin(bird.rotation) * bird.radius + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 20,
      life: 0.35 + Math.random() * 0.15,
      maxLife: 0.5,
      size: 3 + Math.random() * 2.5,
      color: Math.random() > 0.4 ? '#f59e0b' : '#38bdf8', // Amber or Cyan glow
    });
  }

  return particles;
}

/**
 * Creates collision impact explosion particles.
 */
export function createExplosionParticles(x: number, y: number, count: number = 24): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#f59e0b', '#ef4444', '#f97316', '#38bdf8', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 180;
    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1.0,
      size: 2.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  return particles;
}

/**
 * Pure state transition step for Flappy Arcade.
 */
export function stepFlappyGame(
  state: FlappyGameState,
  dt: number,
  input: FlappyInput,
  events: FlappyEngineEvents = {},
  config: FlappyEngineConfig = DEFAULT_FLAPPY_CONFIG,
): FlappyGameState {
  // Update particles even during game-over / screen shake damping
  const updatedParticles = state.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);

  // Dampen screen shake
  const screenShake = Math.max(0, state.screenShake - dt * 25);

  // If paused or game-over, return state without physics progression
  if (state.status !== 'playing') {
    return {
      ...state,
      particles: updatedParticles,
      screenShake,
    };
  }

  // Handle flap input
  let bird = { ...state.bird };
  let newParticles = [...updatedParticles];

  if (input.flap && bird.flapCooldown <= 0) {
    bird = applyFlapImpulse(bird, config.flapImpulse);
    newParticles = newParticles.concat(createThrusterParticles(bird, 5));
    events.onFlap?.();
  }

  // Step bird physics
  bird = stepBirdPhysics(bird, dt, config);

  // Add subtle thruster particles while flying
  if (Math.random() < 0.6) {
    newParticles = newParticles.concat(createThrusterParticles(bird, 1));
  }

  // Check boundary collision (ground / ceiling)
  const boundaries = checkBoundaryCollision(bird, config);
  if (boundaries.hitGround || boundaries.hitCeiling) {
    events.onCollision?.();
    events.onGameOver?.(state.score);
    return {
      ...state,
      status: 'game-over',
      bird: {
        ...bird,
        y: boundaries.hitGround
          ? config.worldHeight - config.groundHeight - bird.radius
          : config.ceilingHeight + bird.radius,
        vy: 0,
      },
      particles: newParticles.concat(createExplosionParticles(bird.x, bird.y, 25)),
      screenShake: 12,
      highScore: Math.max(state.highScore, state.score),
    };
  }

  // Move pipes and check collision / scoring
  const scrollDelta = state.difficulty.speed * dt;
  const newDistance = state.distanceTraveled + scrollDelta;
  let newScore = state.score;
  let collided = false;

  const updatedPipes: ObstaclePipe[] = [];

  for (const pipe of state.pipes) {
    const updatedPipe = {
      ...pipe,
      x: pipe.x - scrollDelta,
      pulsePhase: (pipe.pulsePhase + dt * 3) % (Math.PI * 2),
    };

    // Check collision
    if (checkPipeCollision(bird, updatedPipe, config)) {
      collided = true;
    }

    // Check scoring: when bird x passes pipe middle line
    if (!updatedPipe.passed && bird.x > updatedPipe.x + updatedPipe.width / 2) {
      updatedPipe.passed = true;
      newScore += 1;
      events.onScore?.(newScore);
    }

    // Retain pipes that are still on screen (width margin)
    if (updatedPipe.x + updatedPipe.width > -10) {
      updatedPipes.push(updatedPipe);
    }
  }

  if (collided) {
    events.onCollision?.();
    events.onGameOver?.(state.score);
    return {
      ...state,
      status: 'game-over',
      pipes: updatedPipes,
      bird,
      particles: newParticles.concat(createExplosionParticles(bird.x, bird.y, 30)),
      screenShake: 14,
      highScore: Math.max(state.highScore, state.score),
    };
  }

  // Spawn new pipe if needed
  let lastPipeId = state.lastPipeId;
  const lastPipe = updatedPipes[updatedPipes.length - 1];
  const shouldSpawn =
    !lastPipe ||
    config.worldWidth - (lastPipe.x + lastPipe.width) >= state.difficulty.spawnDistance;

  if (shouldSpawn) {
    lastPipeId += 1;
    const { topHeight, bottomY } = generatePipeHeights(
      config.worldHeight,
      config.groundHeight,
      config.ceilingHeight,
      state.difficulty.gapSize,
    );

    updatedPipes.push({
      id: lastPipeId,
      x: config.worldWidth + 10,
      width: config.pipeWidth,
      topHeight,
      bottomY,
      gap: state.difficulty.gapSize,
      passed: false,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  // Update progressive difficulty based on new score
  const difficulty = calculateDifficulty(newScore, config);

  return {
    ...state,
    score: newScore,
    highScore: Math.max(state.highScore, newScore),
    bird,
    pipes: updatedPipes,
    particles: newParticles,
    difficulty,
    screenShake,
    timeAlive: state.timeAlive + dt,
    lastPipeId,
    distanceTraveled: newDistance,
  };
}
