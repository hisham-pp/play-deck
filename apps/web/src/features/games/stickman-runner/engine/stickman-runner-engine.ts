export type RunnerStatus = 'idle' | 'running' | 'paused' | 'game-over';

export interface RunnerPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  gravity: number;
  jumpVelocity: number;
}

export interface RunnerObstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface RunnerPickup {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

export interface StickmanRunnerState {
  status: RunnerStatus;
  score: number;
  highScore: number;
  distance: number;
  speed: number;
  elapsed: number;
  groundY: number;
  player: RunnerPlayer;
  obstacles: RunnerObstacle[];
  pickups: RunnerPickup[];
  spawnTimer: number;
  pickupTimer: number;
  lastObstacleId: number;
  lastPickupId: number;
}

const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 420;
const BASE_GROUND = 340;
const BASE_SPEED = 240;

export function createInitialStickmanRunnerState(highScore = 0): StickmanRunnerState {
  return {
    status: 'idle',
    score: 0,
    highScore,
    distance: 0,
    speed: BASE_SPEED,
    elapsed: 0,
    groundY: BASE_GROUND,
    player: {
      x: 90,
      y: 340,
      width: 28,
      height: 52,
      vy: 0,
      gravity: 980,
      jumpVelocity: 510,
    },
    obstacles: [],
    pickups: [],
    spawnTimer: 0,
    pickupTimer: 0,
    lastObstacleId: 1,
    lastPickupId: 1,
  };
}

export function triggerJump(state: StickmanRunnerState): StickmanRunnerState {
  if (state.status === 'game-over') return state;

  if (state.player.y >= state.groundY - state.player.height) {
    return {
      ...state,
      player: {
        ...state.player,
        y: state.groundY - state.player.height,
        vy: -state.player.jumpVelocity,
      },
    };
  }

  return state;
}

function rectIntersects(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function stepStickmanRunnerGame(
  state: StickmanRunnerState,
  dt: number,
  inputJump: boolean,
): StickmanRunnerState {
  if (state.status !== 'running') {
    if (inputJump && state.status === 'idle') {
      const jumped = triggerJump({ ...state, status: 'running' });
      return {
        ...jumped,
        status: 'running',
      };
    }
    return state;
  }

  let score = state.score;
  let distance = state.distance + state.speed * dt;
  let elapsed = state.elapsed + dt;
  let speed = state.speed + dt * 2.6;
  let spawnTimer = state.spawnTimer + dt;
  let pickupTimer = state.pickupTimer + dt;

  const player = {
    ...state.player,
    vy: state.player.vy + state.player.gravity * dt,
  };

  const nextPlayer = {
    ...player,
    y: Math.min(state.groundY - state.player.height, player.y + player.vy * dt),
  };

  let grounded = nextPlayer.y >= state.groundY - state.player.height;
  let finalPlayer = {
    ...nextPlayer,
    y: grounded ? state.groundY - state.player.height : nextPlayer.y,
    vy: grounded ? 0 : nextPlayer.vy,
  };

  if (inputJump && grounded) {
    finalPlayer = {
      ...finalPlayer,
      vy: -finalPlayer.jumpVelocity,
      y: finalPlayer.y - 1,
    };
  }

  const obstacles = state.obstacles
    .map((obs) => ({ ...obs, x: obs.x - speed * dt }))
    .filter((obs) => obs.x + obs.width > -20);

  const pickups = state.pickups
    .map((pickup) => ({ ...pickup, x: pickup.x - speed * dt }))
    .filter((pickup) => !pickup.collected && pickup.x + pickup.radius > -10);

  if (spawnTimer >= 1.3) {
    spawnTimer = 0;
    const height = 38 + Math.random() * 80;
    obstacles.push({
      id: state.lastObstacleId,
      x: WORLD_WIDTH + 20,
      y: state.groundY - height,
      width: 26 + Math.random() * 20,
      height,
      passed: false,
    });
  }

  if (pickupTimer >= 2.4) {
    pickupTimer = 0;
    pickups.push({
      id: state.lastPickupId,
      x: WORLD_WIDTH + 20,
      y: 170 + Math.random() * 120,
      radius: 10,
      collected: false,
    });
  }

  for (const obstacle of obstacles) {
    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };
    const playerRect = {
      x: finalPlayer.x,
      y: finalPlayer.y,
      width: finalPlayer.width,
      height: finalPlayer.height,
    };

    if (rectIntersects(playerRect, obstacleRect)) {
      return {
        ...state,
        status: 'game-over',
        score: Math.max(score, Math.floor(distance / 12)),
        highScore: Math.max(state.highScore, Math.max(score, Math.floor(distance / 12))),
        distance,
        speed,
        elapsed,
        player: finalPlayer,
        obstacles,
        pickups,
        spawnTimer,
        pickupTimer,
        lastObstacleId: state.lastObstacleId + 1,
        lastPickupId: state.lastPickupId + 1,
      };
    }

    if (!obstacle.passed && obstacle.x + obstacle.width < finalPlayer.x) {
      obstacle.passed = true;
      score += 1;
    }
  }

  for (const pickup of pickups) {
    const dx = Math.abs(finalPlayer.x + finalPlayer.width / 2 - (pickup.x + pickup.radius));
    const dy = Math.abs(finalPlayer.y + finalPlayer.height / 2 - (pickup.y + pickup.radius));
    const dist = Math.hypot(dx, dy);
    if (dist < (finalPlayer.width + pickup.radius) * 0.7) {
      pickup.collected = true;
      score += 5;
    }
  }

  const nextState: StickmanRunnerState = {
    ...state,
    status: 'running',
    score: Math.max(score, 0),
    highScore: Math.max(state.highScore, Math.max(score, 0)),
    distance,
    speed,
    elapsed,
    player: finalPlayer,
    obstacles: obstacles.filter((obs) => !obs.passed || obs.x > -30),
    pickups: pickups.filter((pickup) => !pickup.collected),
    spawnTimer,
    pickupTimer,
    lastObstacleId: state.lastObstacleId + 1,
    lastPickupId: state.lastPickupId + 1,
  };

  return nextState;
}
