/**
 * Platform Race Game Engine
 * Pure TypeScript 2D physics platform racing engine with moving platforms,
 * spring pads, speed boosts, hazard checkpoints, and bot AI navigation.
 */

export const COURSE_WIDTH = 3200;
export const COURSE_HEIGHT = 600;
export const GRAVITY = 1150; // px/sec^2
export const JUMP_VELOCITY = -470; // px/sec
export const RUN_SPEED = 280; // px/sec
export const ACCELERATION = 1400; // px/sec^2
export const DRAG = 0.88;
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 36;

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'moving_h' | 'moving_v';
  moveRange?: number;
  moveSpeed?: number;
  initialX?: number;
  initialY?: number;
}

export interface SpringPad {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  power: number; // upward impulse
}

export interface BoostPad {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boostVelocity: number; // forward boost
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RacePlayer {
  id: string;
  name: string;
  color: string;
  isAi: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  canDoubleJump: boolean;
  respawnX: number;
  respawnY: number;
  lastCheckpointIndex: number;
  finished: boolean;
  finishTimeSec: number | null;
  rank: number | null;
  boostTimer: number;
  facing: 'left' | 'right';
}

export interface PlatformCourse {
  name: string;
  width: number;
  platforms: Platform[];
  springs: SpringPad[];
  boostPads: BoostPad[];
  hazards: Hazard[];
  checkpoints: Checkpoint[];
  finishLineX: number;
}

export type RaceStatus = 'countdown' | 'racing' | 'finished';

export interface PlatformRaceState {
  course: PlatformCourse;
  players: RacePlayer[];
  status: RaceStatus;
  countdownSec: number;
  raceTimeSec: number;
  winners: string[]; // player IDs in finish order
}

export interface PlayerRaceAction {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
}

/**
 * Creates the standard Grand Prix obstacle race track.
 */
export function createDefaultCourse(): PlatformCourse {
  const platforms: Platform[] = [
    // Starting Ground
    { id: 'p_start', x: 0, y: 520, width: 450, height: 80, type: 'solid' },

    // First Leap & Island Platforms
    { id: 'p_step1', x: 520, y: 460, width: 140, height: 24, type: 'solid' },
    { id: 'p_step2', x: 720, y: 400, width: 140, height: 24, type: 'solid' },
    { id: 'p_step3', x: 920, y: 350, width: 160, height: 24, type: 'solid' },

    // Middle Stretch Ground
    { id: 'p_mid1', x: 1140, y: 520, width: 380, height: 80, type: 'solid' },

    // Moving Platform Section
    {
      id: 'p_move1',
      x: 1580,
      y: 440,
      width: 130,
      height: 20,
      type: 'moving_h',
      moveRange: 160,
      moveSpeed: 80,
      initialX: 1580,
      initialY: 440,
    },
    {
      id: 'p_move2',
      x: 1880,
      y: 380,
      width: 130,
      height: 20,
      type: 'moving_v',
      moveRange: 120,
      moveSpeed: 70,
      initialX: 1880,
      initialY: 380,
    },

    // Upper High Speed Highway
    { id: 'p_high1', x: 2100, y: 320, width: 400, height: 24, type: 'solid' },

    // Final Obstacle Stretch
    { id: 'p_final_gap1', x: 2580, y: 400, width: 120, height: 24, type: 'solid' },
    { id: 'p_final_gap2', x: 2760, y: 460, width: 120, height: 24, type: 'solid' },

    // Finish Podium Ground
    { id: 'p_finish', x: 2940, y: 520, width: 350, height: 80, type: 'solid' },
  ];

  const springs: SpringPad[] = [
    { id: 'sp1', x: 380, y: 510, width: 40, height: 10, power: -640 },
    { id: 'sp2', x: 1450, y: 510, width: 40, height: 10, power: -680 },
    { id: 'sp3', x: 2460, y: 310, width: 40, height: 10, power: -600 },
  ];

  const boostPads: BoostPad[] = [
    { id: 'bp1', x: 1220, y: 512, width: 60, height: 8, boostVelocity: 550 },
    { id: 'bp2', x: 2160, y: 312, width: 60, height: 8, boostVelocity: 600 },
  ];

  const hazards: Hazard[] = [
    // Pit between start and step 1
    { id: 'h1', x: 450, y: 580, width: 690, height: 40 },
    // Pit between mid1 and upper platforms
    { id: 'h2', x: 1520, y: 580, width: 1420, height: 40 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp0', x: 60, y: 450, width: 24, height: 70 },
    { id: 'cp1', x: 1180, y: 450, width: 24, height: 70 },
    { id: 'cp2', x: 2130, y: 250, width: 24, height: 70 },
  ];

  return {
    name: 'Neon Velocity Track',
    width: COURSE_WIDTH,
    platforms,
    springs,
    boostPads,
    hazards,
    checkpoints,
    finishLineX: 3080,
  };
}

/**
 * Initializes a new Platform Race state with players.
 */
export function createInitialPlatformRaceState(
  playerConfigs: { name: string; isAi: boolean }[] = [
    { name: 'You (P1)', isAi: false },
    { name: 'ApexBot', isAi: true },
    { name: 'TurboBot', isAi: true },
    { name: 'FlashBot', isAi: true },
  ],
): PlatformRaceState {
  const course = createDefaultCourse();
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  const players: RacePlayer[] = playerConfigs.slice(0, 4).map((cfg, idx) => ({
    id: `racer_${idx + 1}`,
    name: cfg.name,
    color: colors[idx % colors.length],
    isAi: cfg.isAi,
    x: 40 + idx * 25,
    y: 470,
    vx: 0,
    vy: 0,
    isGrounded: true,
    canDoubleJump: true,
    respawnX: 40 + idx * 25,
    respawnY: 470,
    lastCheckpointIndex: 0,
    finished: false,
    finishTimeSec: null,
    rank: null,
    boostTimer: 0,
    facing: 'right',
  }));

  return {
    course,
    players,
    status: 'countdown',
    countdownSec: 3.0,
    raceTimeSec: 0,
    winners: [],
  };
}

/**
 * Steps moving platform positions according to elapsed time.
 */
export function updateMovingPlatforms(platforms: Platform[], raceTimeSec: number): Platform[] {
  return platforms.map((p) => {
    if (p.type === 'moving_h' && p.initialX !== undefined && p.moveRange && p.moveSpeed) {
      const offsetX = Math.sin((raceTimeSec * p.moveSpeed) / 40) * (p.moveRange * 0.5);
      return { ...p, x: p.initialX + offsetX };
    }
    if (p.type === 'moving_v' && p.initialY !== undefined && p.moveRange && p.moveSpeed) {
      const offsetY = Math.sin((raceTimeSec * p.moveSpeed) / 40) * (p.moveRange * 0.5);
      return { ...p, y: p.initialY + offsetY };
    }
    return p;
  });
}

/**
 * AABB intersection test.
 */
export function checkAABB(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Advances the Platform Race simulation by delta time in seconds.
 */
export function stepPlatformRace(
  state: PlatformRaceState,
  actions: Record<string, PlayerRaceAction>,
  dt: number,
): PlatformRaceState {
  const clampedDt = Math.min(dt, 0.05);

  // 1. Countdown Phase
  if (state.status === 'countdown') {
    const nextCountdown = state.countdownSec - clampedDt;
    if (nextCountdown <= 0) {
      return { ...state, status: 'racing', countdownSec: 0 };
    }
    return { ...state, countdownSec: nextCountdown };
  }

  if (state.status === 'finished') {
    return state;
  }

  const nextRaceTime = state.raceTimeSec + clampedDt;
  const currentPlatforms = updateMovingPlatforms(state.course.platforms, nextRaceTime);
  const updatedCourse = { ...state.course, platforms: currentPlatforms };

  const players = state.players.map((p) => ({ ...p }));
  const winners = [...state.winners];

  for (const player of players) {
    if (player.finished) continue;

    const action = actions[player.id] || { moveLeft: false, moveRight: false, jump: false };

    // Horizontal Movement
    if (action.moveRight) {
      player.vx += ACCELERATION * clampedDt;
      player.facing = 'right';
    } else if (action.moveLeft) {
      player.vx -= ACCELERATION * clampedDt;
      player.facing = 'left';
    } else {
      player.vx *= Math.pow(DRAG, clampedDt * 60);
    }

    // Apply Boost Pad timer decay
    if (player.boostTimer > 0) {
      player.boostTimer = Math.max(0, player.boostTimer - clampedDt);
    } else {
      // Clamp to normal max run speed if boost expired
      const maxSpd = RUN_SPEED;
      player.vx = Math.max(-maxSpd, Math.min(maxSpd, player.vx));
    }

    // Jumping
    if (action.jump) {
      if (player.isGrounded) {
        player.vy = JUMP_VELOCITY;
        player.isGrounded = false;
        player.canDoubleJump = true;
      } else if (player.canDoubleJump) {
        player.vy = JUMP_VELOCITY * 0.9;
        player.canDoubleJump = false;
      }
    }

    // Gravity
    player.vy += GRAVITY * clampedDt;

    // Tentative next positions
    const targetX = player.x + player.vx * clampedDt;
    const targetY = player.y + player.vy * clampedDt;

    player.isGrounded = false;

    // Platform Collisions (Resolving vertical & one-way top landing)
    for (const plat of currentPlatforms) {
      const willCollide = checkAABB(
        targetX,
        targetY,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
        plat.x,
        plat.y,
        plat.width,
        plat.height,
      );

      if (willCollide) {
        // Landing on top of platform from above
        const wasAbove = player.y + PLAYER_HEIGHT <= plat.y + 12;
        if (wasAbove && player.vy >= 0) {
          player.y = plat.y - PLAYER_HEIGHT;
          player.vy = 0;
          player.isGrounded = true;
          player.canDoubleJump = true;
          continue;
        }

        // Horizontal Wall Collision
        if (player.vx > 0 && player.x + PLAYER_WIDTH <= plat.x + 8) {
          player.x = plat.x - PLAYER_WIDTH;
          player.vx = 0;
        } else if (player.vx < 0 && player.x >= plat.x + plat.width - 8) {
          player.x = plat.x + plat.width;
          player.vx = 0;
        }
      }
    }

    if (!player.isGrounded) {
      player.y = targetY;
    }
    player.x = targetX;

    // Boundary containment (Course Left)
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }

    // Check Spring Pads
    for (const spring of state.course.springs) {
      if (
        checkAABB(
          player.x,
          player.y,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          spring.x,
          spring.y,
          spring.width,
          spring.height,
        )
      ) {
        player.vy = spring.power;
        player.isGrounded = false;
        player.canDoubleJump = true;
      }
    }

    // Check Boost Pads
    for (const boost of state.course.boostPads) {
      if (
        checkAABB(
          player.x,
          player.y,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          boost.x,
          boost.y,
          boost.width,
          boost.height,
        )
      ) {
        player.vx = boost.boostVelocity;
        player.boostTimer = 1.2;
      }
    }

    // Check Hazards (Pit spikes / fell out of world)
    let inHazard = player.y > COURSE_HEIGHT - 30;
    if (!inHazard) {
      for (const h of state.course.hazards) {
        if (
          checkAABB(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, h.x, h.y, h.width, h.height)
        ) {
          inHazard = true;
          break;
        }
      }
    }

    if (inHazard) {
      // Respawn at last visited checkpoint
      player.x = player.respawnX;
      player.y = player.respawnY;
      player.vx = 0;
      player.vy = 0;
      player.isGrounded = true;
      player.canDoubleJump = true;
    }

    // Check Checkpoints
    state.course.checkpoints.forEach((cp, idx) => {
      if (
        idx > player.lastCheckpointIndex &&
        checkAABB(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, cp.x, cp.y, cp.width, cp.height)
      ) {
        player.lastCheckpointIndex = idx;
        player.respawnX = cp.x + 10;
        player.respawnY = cp.y + cp.height - PLAYER_HEIGHT - 2;
      }
    });

    // Check Finish Line
    if (player.x >= state.course.finishLineX) {
      player.finished = true;
      player.finishTimeSec = nextRaceTime;
      winners.push(player.id);
      player.rank = winners.length;
    }
  }

  // End race when human player finishes or all finished
  const humanPlayer = players[0];
  const allFinished = players.every((p) => p.finished);
  let nextStatus: RaceStatus = state.status;

  if (allFinished || (humanPlayer && humanPlayer.finished && winners.length >= 3)) {
    nextStatus = 'finished';
  }

  return {
    ...state,
    course: updatedCourse,
    players,
    status: nextStatus,
    raceTimeSec: nextRaceTime,
    winners,
  };
}

/**
 * Intelligent Bot AI Controller.
 * Scans upcoming terrain for gaps, hazards, or higher platforms and time jumps.
 */
export function getBotRaceAction(bot: RacePlayer, state: PlatformRaceState): PlayerRaceAction {
  if (bot.finished || state.status !== 'racing') {
    return { moveLeft: false, moveRight: false, jump: false };
  }

  let jump = false;

  // Always run right towards finish line
  const moveRight = true;
  const moveLeft = false;

  // Raycast/Lookahead 70px in front
  const lookAheadX = bot.x + 60;
  const feetY = bot.y + PLAYER_HEIGHT;

  // Check if there is ground ahead under feet
  let groundAhead = false;
  for (const plat of state.course.platforms) {
    if (
      lookAheadX >= plat.x &&
      lookAheadX <= plat.x + plat.width &&
      feetY >= plat.y - 10 &&
      feetY <= plat.y + plat.height + 20
    ) {
      groundAhead = true;
      break;
    }
  }

  // Check if approaching a wall or higher ledge
  let wallAhead = false;
  for (const plat of state.course.platforms) {
    if (
      lookAheadX >= plat.x &&
      lookAheadX <= plat.x + plat.width &&
      bot.y + 10 >= plat.y &&
      bot.y + 10 <= plat.y + plat.height
    ) {
      wallAhead = true;
      break;
    }
  }

  // Check if directly over a hazard
  let hazardAhead = false;
  for (const h of state.course.hazards) {
    if (lookAheadX >= h.x && lookAheadX <= h.x + h.width && feetY >= h.y - 60) {
      hazardAhead = true;
      break;
    }
  }

  // Jump if no ground ahead, or wall blocking, or hazard ahead
  if (!groundAhead || wallAhead || hazardAhead) {
    if (bot.isGrounded) {
      jump = true;
    } else if (bot.canDoubleJump && bot.vy > 80) {
      // Emergency second jump if falling
      jump = true;
    }
  }

  return { moveLeft, moveRight, jump };
}
