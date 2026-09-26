/**
 * Stickman Racing — Core Engine
 * Multi-lane arcade sprint gauntlet with hurdle physics,
 * AI rival drafting, slipstream turbo mechanics, and podium finishes.
 */

export type RacingStatus = 'ready' | 'racing' | 'finished';

export interface TrackHurdle {
  id: string;
  lane: number; // 0, 1, or 2
  distanceMeters: number;
  cleared?: boolean;
}

export interface Runner {
  id: string;
  name: string;
  isPlayer: boolean;
  lane: number; // 0: Left, 1: Center, 2: Right
  targetLane: number;
  laneProgress: number; // 0 to 1 smooth lane transition
  distanceMeters: number;
  speed: number; // m/s
  baseSpeed: number;
  jumpY: number; // 0 is on track, > 0 is in air
  jumpVy: number;
  isJumping: boolean;
  isDrafting: boolean;
  isBoosting: boolean;
  nitroGauge: number; // 0 to 100
  stumbleTimer: number;
  rank: number;
  finished: boolean;
  finishTime?: number;
  color: string;
}

export interface StickmanRacingState {
  status: RacingStatus;
  raceDistance: number; // e.g. 400 meters
  elapsedTime: number;
  player: Runner;
  rivals: Runner[];
  hurdles: TrackHurdle[];
  score: number;
  highScore: number;
  stats: {
    hurdlesCleared: number;
    stumbles: number;
    draftSeconds: number;
    boostSeconds: number;
    podiumFinish: number; // 1, 2, 3
  };
}

export const LANE_COUNT = 3;
export const JUMP_GRAVITY = 28; // m/s^2
export const JUMP_INITIAL_VY = 8.5; // m/s
export const BASE_PLAYER_SPEED = 19.5; // m/s (~70 km/h arcade sprint)
export const BOOST_SPEED = 30.0; // m/s

function generateTrackHurdles(totalDistance: number): TrackHurdle[] {
  const hurdles: TrackHurdle[] = [];
  let dist = 40;

  while (dist < totalDistance - 25) {
    // Generate hurdles across 1 or 2 lanes (leaving at least 1 open lane)
    const openLane = Math.floor(Math.random() * LANE_COUNT);
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      if (lane !== openLane && Math.random() < 0.75) {
        hurdles.push({
          id: `hurdle_${dist}_${lane}`,
          lane,
          distanceMeters: dist,
        });
      }
    }
    dist += 35 + Math.random() * 25;
  }

  return hurdles;
}

export function createInitialRacingState(highScore = 0, raceDistance = 400): StickmanRacingState {
  const hurdles = generateTrackHurdles(raceDistance);

  const player: Runner = {
    id: 'player',
    name: 'Player',
    isPlayer: true,
    lane: 1,
    targetLane: 1,
    laneProgress: 1,
    distanceMeters: 0,
    speed: BASE_PLAYER_SPEED,
    baseSpeed: BASE_PLAYER_SPEED,
    jumpY: 0,
    jumpVy: 0,
    isJumping: false,
    isDrafting: false,
    isBoosting: false,
    nitroGauge: 30,
    stumbleTimer: 0,
    rank: 1,
    finished: false,
    color: '#06B6D4',
  };

  const rivals: Runner[] = [
    {
      id: 'rival_1',
      name: 'Apex Runner',
      isPlayer: false,
      lane: 0,
      targetLane: 0,
      laneProgress: 1,
      distanceMeters: 0,
      speed: 19.2,
      baseSpeed: 19.2,
      jumpY: 0,
      jumpVy: 0,
      isJumping: false,
      isDrafting: false,
      isBoosting: false,
      nitroGauge: 20,
      stumbleTimer: 0,
      rank: 2,
      finished: false,
      color: '#EF4444',
    },
    {
      id: 'rival_2',
      name: 'Dash Phantom',
      isPlayer: false,
      lane: 2,
      targetLane: 2,
      laneProgress: 1,
      distanceMeters: 0,
      speed: 19.8,
      baseSpeed: 19.8,
      jumpY: 0,
      jumpVy: 0,
      isJumping: false,
      isDrafting: false,
      isBoosting: false,
      nitroGauge: 25,
      stumbleTimer: 0,
      rank: 3,
      finished: false,
      color: '#F59E0B',
    },
  ];

  return {
    status: 'ready',
    raceDistance,
    elapsedTime: 0,
    player,
    rivals,
    hurdles,
    score: 0,
    highScore,
    stats: {
      hurdlesCleared: 0,
      stumbles: 0,
      draftSeconds: 0,
      boostSeconds: 0,
      podiumFinish: 0,
    },
  };
}

export function startRacingGame(state: StickmanRacingState): StickmanRacingState {
  const initial = createInitialRacingState(state.highScore, state.raceDistance);
  return {
    ...initial,
    status: 'racing',
  };
}

export function shiftLane(state: StickmanRacingState, direction: -1 | 1): StickmanRacingState {
  if (state.status !== 'racing' || state.player.finished) return state;

  const nextTarget = Math.max(0, Math.min(LANE_COUNT - 1, state.player.targetLane + direction));
  if (nextTarget === state.player.targetLane) return state;

  return {
    ...state,
    player: {
      ...state.player,
      targetLane: nextTarget,
      laneProgress: 0,
    },
  };
}

export function jumpHurdle(state: StickmanRacingState): StickmanRacingState {
  if (state.status !== 'racing' || state.player.finished) return state;
  const p = { ...state.player };

  if (!p.isJumping && p.stumbleTimer <= 0) {
    p.isJumping = true;
    p.jumpVy = JUMP_INITIAL_VY;
    p.jumpY = 0.05;
    return {
      ...state,
      player: p,
    };
  }

  return state;
}

export function setBoost(state: StickmanRacingState, active: boolean): StickmanRacingState {
  if (state.status !== 'racing' || state.player.finished) return state;

  return {
    ...state,
    player: {
      ...state.player,
      isBoosting: active && state.player.nitroGauge > 5,
    },
  };
}

export function stepRacingEngine(
  state: StickmanRacingState,
  deltaSec: number,
): StickmanRacingState {
  if (state.status !== 'racing') return state;

  const dt = Math.max(0, Math.min(deltaSec, 0.1));
  const elapsedTime = state.elapsedTime + dt;
  const player = { ...state.player };
  const rivals = state.rivals.map((r) => ({ ...r }));
  let score = state.score;
  let highScore = state.highScore;
  const stats = { ...state.stats };
  let status: RacingStatus = state.status;

  // 1. Update Player Physics & Lane Interpolation
  if (player.lane !== player.targetLane) {
    player.laneProgress = Math.min(1, player.laneProgress + dt * 6);
    if (player.laneProgress >= 1) {
      player.lane = player.targetLane;
    }
  }

  // Jumping
  if (player.isJumping) {
    player.jumpY += player.jumpVy * dt;
    player.jumpVy -= JUMP_GRAVITY * dt;
    if (player.jumpY <= 0) {
      player.jumpY = 0;
      player.jumpVy = 0;
      player.isJumping = false;
    }
  }

  // Stumble
  if (player.stumbleTimer > 0) {
    player.stumbleTimer -= dt;
    player.isBoosting = false;
  }

  // Drafting / Slipstream Detection
  // Check if any rival is directly ahead in player's current target lane within 16m
  let isDrafting = false;
  for (const rival of rivals) {
    if (
      rival.targetLane === player.targetLane &&
      rival.distanceMeters > player.distanceMeters &&
      rival.distanceMeters - player.distanceMeters <= 16
    ) {
      isDrafting = true;
      break;
    }
  }
  player.isDrafting = isDrafting;

  if (isDrafting) {
    stats.draftSeconds += dt;
    player.nitroGauge = Math.min(100, player.nitroGauge + dt * 25);
  }

  // Nitro Boost
  if (player.isBoosting && player.nitroGauge > 0 && player.stumbleTimer <= 0) {
    stats.boostSeconds += dt;
    player.speed = BOOST_SPEED;
    player.nitroGauge = Math.max(0, player.nitroGauge - dt * 30);
    if (player.nitroGauge <= 0) {
      player.isBoosting = false;
    }
  } else {
    player.isBoosting = false;
    const speedBoost = isDrafting ? 2.5 : 0;
    const targetSpeed =
      player.stumbleTimer > 0 ? player.baseSpeed * 0.4 : player.baseSpeed + speedBoost;
    player.speed = targetSpeed;
  }

  if (!player.finished) {
    player.distanceMeters += player.speed * dt;
    score += Math.round(player.speed * dt * 5);
    highScore = Math.max(highScore, score);

    if (player.distanceMeters >= state.raceDistance) {
      player.distanceMeters = state.raceDistance;
      player.finished = true;
      player.finishTime = Number(elapsedTime.toFixed(2));
    }
  }

  // 2. Hurdle Collision Detection for Player
  for (const hurdle of state.hurdles) {
    if (hurdle.cleared) continue;

    // In player's lane and within hurdle contact range
    const distDiff = hurdle.distanceMeters - player.distanceMeters;
    if (distDiff <= 1.5 && distDiff >= -1.5 && hurdle.lane === player.targetLane) {
      if (player.jumpY >= 0.8 || player.isBoosting) {
        // Successfully jumped over hurdle or smashed through with nitro!
        hurdle.cleared = true;
        stats.hurdlesCleared++;
        player.nitroGauge = Math.min(100, player.nitroGauge + 12);
        score += 150;
      } else if (player.stumbleTimer <= 0) {
        // Hit hurdle!
        player.stumbleTimer = 0.8;
        player.nitroGauge = 0;
        hurdle.cleared = true;
        stats.stumbles++;
      }
    }
  }

  // 3. Update AI Rivals
  for (const rival of rivals) {
    if (rival.finished) continue;

    // AI Lane Shift & Hurdle Jump
    const nextHurdle = state.hurdles.find(
      (h) =>
        h.lane === rival.targetLane &&
        h.distanceMeters > rival.distanceMeters &&
        h.distanceMeters - rival.distanceMeters < 12,
    );

    if (nextHurdle) {
      // Jump hurdle
      if (!rival.isJumping) {
        rival.isJumping = true;
        rival.jumpVy = JUMP_INITIAL_VY;
        rival.jumpY = 0.05;
      }
    }

    if (rival.isJumping) {
      rival.jumpY += rival.jumpVy * dt;
      rival.jumpVy -= JUMP_GRAVITY * dt;
      if (rival.jumpY <= 0) {
        rival.jumpY = 0;
        rival.jumpVy = 0;
        rival.isJumping = false;
      }
    }

    rival.distanceMeters += rival.speed * dt;
    if (rival.distanceMeters >= state.raceDistance) {
      rival.distanceMeters = state.raceDistance;
      rival.finished = true;
      rival.finishTime = Number(elapsedTime.toFixed(2));
    }
  }

  // 4. Calculate Live Standings
  const allRunners = [player, ...rivals];
  allRunners.sort((a, b) => b.distanceMeters - a.distanceMeters);

  for (let i = 0; i < allRunners.length; i++) {
    allRunners[i].rank = i + 1;
  }

  // 5. Check If Race Concluded
  if (player.finished) {
    status = 'finished';
    stats.podiumFinish = player.rank;
    // Award bonus score for podium
    if (player.rank === 1) score += 2000;
    else if (player.rank === 2) score += 1000;
    else if (player.rank === 3) score += 500;
    highScore = Math.max(highScore, score);
  }

  return {
    ...state,
    status,
    elapsedTime: Number(elapsedTime.toFixed(2)),
    player,
    rivals,
    score,
    highScore,
    stats,
  };
}
