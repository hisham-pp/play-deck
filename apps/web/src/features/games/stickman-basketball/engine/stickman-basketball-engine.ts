export type BallHolder = 'p1' | 'p2' | null;

export interface Hoops {
  left: { x: number; y: number; rimX: number; backboardX: number };
  right: { x: number; y: number; rimX: number; backboardX: number };
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  holder: BallHolder;
  inFlight: boolean;
  isDunk: boolean;
  lastShooter: 'p1' | 'p2' | null;
  radius: number;
}

export interface BasketballPlayer {
  id: 'p1' | 'p2';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  isJumping: boolean;
  isDunking: boolean;
  isShooting: boolean;
  shootCharge: number; // 0 to 1
  crossoverCooldown: number;
  stealCooldown: number;
  stumbled: boolean;
  stumbleTimer: number;
  score: number;
}

export type BasketballSoundEvent =
  | 'bounce'
  | 'shoot'
  | 'swish'
  | 'rim_hit'
  | 'dunk'
  | 'steal'
  | 'crossover'
  | 'buzzer';

export interface BasketballGameState {
  status: 'playing' | 'scored' | 'quarter_end' | 'game_over';
  gameTimeRemaining: number; // 60s
  shotClock: number; // 14s
  possession: 'p1' | 'p2';
  p1: BasketballPlayer;
  p2: BasketballPlayer;
  ball: Ball;
  scoreCelebrationTimer: number;
  lastScoredPoints: number;
  soundEvents: BasketballSoundEvent[];
  isTwoPlayer: boolean;
}

export const COURT_WIDTH = 800;
export const COURT_FLOOR_Y = 390;
export const GRAVITY = 850;
export const PLAYER_SPEED = 240;
export const JUMP_IMPULSE = -430;
export const RIM_Y = 230;
export const DUNK_RANGE = 95;

export const HOOPS: Hoops = {
  left: { x: 70, y: RIM_Y, rimX: 110, backboardX: 70 },
  right: { x: 730, y: RIM_Y, rimX: 690, backboardX: 730 },
};

export function createInitialPlayer(
  id: 'p1' | 'p2',
  name: string,
  x: number,
  facing: 1 | -1,
): BasketballPlayer {
  return {
    id,
    name,
    x,
    y: COURT_FLOOR_Y,
    vx: 0,
    vy: 0,
    facing,
    isGrounded: true,
    isJumping: false,
    isDunking: false,
    isShooting: false,
    shootCharge: 0,
    crossoverCooldown: 0,
    stealCooldown: 0,
    stumbled: false,
    stumbleTimer: 0,
    score: 0,
  };
}

export function createInitialBasketballState(isTwoPlayer = false): BasketballGameState {
  return {
    status: 'playing',
    gameTimeRemaining: 60,
    shotClock: 14,
    possession: 'p1',
    p1: createInitialPlayer('p1', 'Player 1', 320, 1),
    p2: createInitialPlayer('p2', isTwoPlayer ? 'Player 2' : 'AI Baller', 480, -1),
    ball: {
      x: 320,
      y: COURT_FLOOR_Y - 25,
      vx: 0,
      vy: 0,
      holder: 'p1',
      inFlight: false,
      isDunk: false,
      lastShooter: null,
      radius: 9,
    },
    scoreCelebrationTimer: 0,
    lastScoredPoints: 0,
    soundEvents: [],
    isTwoPlayer,
  };
}

export interface PlayerControls {
  moveLeft?: boolean;
  moveRight?: boolean;
  shootHold?: boolean;
  shootRelease?: boolean;
  crossover?: boolean;
  steal?: boolean;
  jump?: boolean;
}

export function stepBasketballEngine(
  state: BasketballGameState,
  inputs: { p1: PlayerControls; p2?: PlayerControls },
  rawDt: number,
): BasketballGameState {
  const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
  const next: BasketballGameState = {
    ...state,
    soundEvents: [],
  };

  // 1. Scored celebration reset
  if (next.status === 'scored') {
    next.scoreCelebrationTimer -= dt;
    if (next.scoreCelebrationTimer <= 0) {
      next.status = 'playing';
      // Next possession starts at center
      const nextPossession = next.possession === 'p1' ? 'p2' : 'p1';
      next.possession = nextPossession;
      next.shotClock = 14;

      next.p1.x = 320;
      next.p1.y = COURT_FLOOR_Y;
      next.p1.vx = 0;
      next.p1.vy = 0;
      next.p1.isDunking = false;
      next.p1.isShooting = false;
      next.p1.shootCharge = 0;

      next.p2.x = 480;
      next.p2.y = COURT_FLOOR_Y;
      next.p2.vx = 0;
      next.p2.vy = 0;
      next.p2.isDunking = false;
      next.p2.isShooting = false;
      next.p2.shootCharge = 0;

      const holderPlayer = nextPossession === 'p1' ? next.p1 : next.p2;
      next.ball = {
        x: holderPlayer.x + holderPlayer.facing * 12,
        y: COURT_FLOOR_Y - 25,
        vx: 0,
        vy: 0,
        holder: nextPossession,
        inFlight: false,
        isDunk: false,
        lastShooter: null,
        radius: 9,
      };
    }
    return next;
  }

  if (next.status === 'game_over') {
    return next;
  }

  // 2. Timers
  next.gameTimeRemaining = Math.max(0, next.gameTimeRemaining - dt);
  next.shotClock = Math.max(0, next.shotClock - dt);

  if (next.gameTimeRemaining <= 0) {
    next.status = 'game_over';
    next.soundEvents.push('buzzer');
    return next;
  }

  if (next.shotClock <= 0 && next.ball.holder) {
    // Shot clock turnover
    next.possession = next.possession === 'p1' ? 'p2' : 'p1';
    next.shotClock = 14;
    next.ball.holder = next.possession;
    next.soundEvents.push('buzzer');
  }

  // 3. Process Player 1 Inputs
  processPlayerMovementAndSkills(next.p1, inputs.p1, next.p2, next, dt);

  // 4. Process Player 2 Inputs or AI
  if (next.isTwoPlayer && inputs.p2) {
    processPlayerMovementAndSkills(next.p2, inputs.p2, next.p1, next, dt);
  } else {
    runAI(next.p2, next.p1, next, dt);
  }

  // 5. Update Ball Physics
  updateBallPhysics(next, dt);

  // 6. Loose ball pickup
  if (next.ball.holder === null && !next.ball.isDunk) {
    checkBallPickup(next.p1, next);
    checkBallPickup(next.p2, next);
  }

  return next;
}

function processPlayerMovementAndSkills(
  player: BasketballPlayer,
  ctrl: PlayerControls,
  opponent: BasketballPlayer,
  state: BasketballGameState,
  dt: number,
): void {
  // Stumble recovery
  if (player.stumbled) {
    player.stumbleTimer -= dt;
    if (player.stumbleTimer <= 0) {
      player.stumbled = false;
    }
    return;
  }

  // Cooldowns
  if (player.crossoverCooldown > 0) player.crossoverCooldown -= dt;
  if (player.stealCooldown > 0) player.stealCooldown -= dt;

  const hasBall = state.ball.holder === player.id;
  const targetHoop = player.id === 'p1' ? HOOPS.right : HOOPS.left;
  const distToRim = Math.hypot(player.x - targetHoop.rimX, player.y - targetHoop.y);

  // Crossover move
  if (ctrl.crossover && player.crossoverCooldown <= 0 && hasBall) {
    player.facing = (player.facing * -1) as 1 | -1;
    player.vx += player.facing * 180;
    player.crossoverCooldown = 1.0;
    state.soundEvents.push('crossover');

    // Chance to break opponent ankles if close
    if (Math.abs(player.x - opponent.x) < 70 && opponent.isGrounded) {
      opponent.stumbled = true;
      opponent.stumbleTimer = 0.8;
      opponent.vx = player.facing * 120;
    }
  }

  // Steal attempt
  if (ctrl.steal && player.stealCooldown <= 0 && !hasBall && state.ball.holder === opponent.id) {
    player.stealCooldown = 1.2;
    if (Math.abs(player.x - opponent.x) < 55) {
      // Poke ball loose!
      state.ball.holder = null;
      state.ball.inFlight = true;
      state.ball.vx = (player.x < opponent.x ? -1 : 1) * 160;
      state.ball.vy = -180;
      state.soundEvents.push('steal');
    }
  }

  // Shoot / Dunk charging & release
  if (hasBall) {
    if (ctrl.shootHold && !player.isShooting) {
      player.isShooting = true;
      player.shootCharge = 0;
      // Begin jump
      if (player.isGrounded) {
        player.vy = JUMP_IMPULSE;
        player.isGrounded = false;
        player.isJumping = true;
      }

      // Check if within dunking range
      if (distToRim < DUNK_RANGE) {
        player.isDunking = true;
      }
    }

    if (player.isShooting) {
      player.shootCharge = Math.min(1.0, player.shootCharge + dt * 1.8);

      // In dunk motion, propel toward rim
      if (player.isDunking) {
        const dunkDir = targetHoop.rimX > player.x ? 1 : -1;
        player.vx = dunkDir * 280;

        // Dunk execution frame
        if (Math.abs(player.x - targetHoop.rimX) < 45 && player.y < targetHoop.y + 55) {
          executeDunk(player, state, targetHoop);
        }
      }
    }

    if (ctrl.shootRelease && player.isShooting && !player.isDunking) {
      // Release jump shot
      executeJumpShot(player, state, targetHoop);
    }
  }

  // Movement
  let moveX = 0;
  if (ctrl.moveLeft) moveX -= 1;
  if (ctrl.moveRight) moveX += 1;

  if (moveX !== 0 && !player.isDunking) {
    player.facing = moveX as 1 | -1;
    player.vx = moveX * PLAYER_SPEED;
  } else if (!player.isDunking) {
    player.vx *= 0.8;
  }

  // Physics
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Ground check
  if (player.y >= COURT_FLOOR_Y) {
    player.y = COURT_FLOOR_Y;
    player.vy = 0;
    player.isGrounded = true;
    player.isJumping = false;
    player.isDunking = false;

    // Released on landing if still held
    if (player.isShooting && hasBall) {
      executeJumpShot(player, state, targetHoop);
    }
  }

  // Clamping to court bounds
  player.x = Math.max(30, Math.min(COURT_WIDTH - 30, player.x));

  // Sync ball position if holding
  if (state.ball.holder === player.id && !state.ball.inFlight) {
    const dribbleBounce = player.isGrounded ? Math.sin(Date.now() / 90) * 12 : 0;
    state.ball.x = player.x + player.facing * 14;
    state.ball.y = player.y - 28 + dribbleBounce;
  }
}

function executeJumpShot(
  player: BasketballPlayer,
  state: BasketballGameState,
  targetHoop: { rimX: number; y: number },
): void {
  player.isShooting = false;
  const isThreePointer = Math.abs(player.x - targetHoop.rimX) > 280;
  const points = isThreePointer ? 3 : 2;

  // Quality of release: apex is around shootCharge = 0.55
  const releaseAccuracy = 1.0 - Math.abs(player.shootCharge - 0.55) * 1.5;
  const targetX = targetHoop.rimX + (1.0 - Math.max(0.2, releaseAccuracy)) * (Math.random() - 0.5) * 45;

  const dx = targetX - player.x;
  const flightTime = 0.75;
  const vx = dx / flightTime;
  const vy = -460;

  state.ball.holder = null;
  state.ball.inFlight = true;
  state.ball.isDunk = false;
  state.ball.x = player.x + player.facing * 12;
  state.ball.y = player.y - 45;
  state.ball.vx = vx;
  state.ball.vy = vy;
  state.ball.lastShooter = player.id;
  state.lastScoredPoints = points;
  state.soundEvents.push('shoot');
}

function executeDunk(
  player: BasketballPlayer,
  state: BasketballGameState,
  targetHoop: { rimX: number; y: number },
): void {
  player.isShooting = false;
  player.isDunking = false;
  player.score += 2;
  state.lastScoredPoints = 2;

  state.ball.holder = null;
  state.ball.inFlight = true;
  state.ball.isDunk = true;
  state.ball.x = targetHoop.rimX;
  state.ball.y = targetHoop.y + 12;
  state.ball.vx = 0;
  state.ball.vy = 280; // down through net

  state.status = 'scored';
  state.scoreCelebrationTimer = 1.4;
  state.soundEvents.push('dunk');
  state.soundEvents.push('swish');
}

function runAI(
  ai: BasketballPlayer,
  player: BasketballPlayer,
  state: BasketballGameState,
  _dt: number,
): void {
  const hasBall = state.ball.holder === ai.id;
  const targetHoop = HOOPS.left;
  const distToRim = Math.hypot(ai.x - targetHoop.rimX, ai.y - targetHoop.y);

  if (hasBall) {
    // Attack basket
    if (distToRim < DUNK_RANGE + 15) {
      // Go for dunk or layup
      processPlayerMovementAndSkills(
        ai,
        { moveLeft: true, shootHold: true, shootRelease: false },
        player,
        state,
        _dt,
      );
    } else if (distToRim < 240 && Math.random() < 0.04) {
      // Pull up for jumper
      processPlayerMovementAndSkills(
        ai,
        { shootHold: true, shootRelease: true },
        player,
        state,
        _dt,
      );
    } else {
      // Dribble toward hoop
      processPlayerMovementAndSkills(
        ai,
        { moveLeft: true, crossover: Math.random() < 0.02 },
        player,
        state,
        _dt,
      );
    }
  } else {
    // Play defense
    if (state.ball.holder === player.id) {
      // Position between player and right hoop
      const targetDefX = player.x + 45;
      const moveLeft = ai.x > targetDefX;
      const moveRight = ai.x < targetDefX;
      const shouldSteal = Math.abs(ai.x - player.x) < 48 && Math.random() < 0.03;

      processPlayerMovementAndSkills(
        ai,
        { moveLeft, moveRight, steal: shouldSteal },
        player,
        state,
        _dt,
      );
    } else {
      // Pursue loose ball
      const moveLeft = ai.x > state.ball.x;
      const moveRight = ai.x < state.ball.x;
      processPlayerMovementAndSkills(ai, { moveLeft, moveRight }, player, state, _dt);
    }
  }
}

function updateBallPhysics(state: BasketballGameState, dt: number): void {
  const b = state.ball;
  if (!b.inFlight) return;

  b.vy += GRAVITY * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  // Floor bounce
  if (b.y >= COURT_FLOOR_Y - b.radius) {
    b.y = COURT_FLOOR_Y - b.radius;
    b.vy *= -0.7; // bounce damping
    b.vx *= 0.85;

    if (Math.abs(b.vy) > 80) {
      state.soundEvents.push('bounce');
    } else {
      b.vy = 0;
      b.inFlight = false;
      b.isDunk = false;
    }
  }

  // Backboard bounce
  for (const hoop of [HOOPS.left, HOOPS.right]) {
    if (Math.abs(b.x - hoop.backboardX) < 12 && b.y > hoop.y - 70 && b.y < hoop.y + 40) {
      b.vx *= -0.65;
      state.soundEvents.push('rim_hit');
    }

    // Rim collision
    if (Math.hypot(b.x - hoop.rimX, b.y - hoop.y) < 15) {
      // Check if downward score through rim
      if (b.vy > 0 && Math.abs(b.x - hoop.rimX) < 12 && b.y > hoop.y) {
        // Swish!
        const scorer = hoop === HOOPS.right ? state.p1 : state.p2;
        scorer.score += state.lastScoredPoints;
        state.status = 'scored';
        state.scoreCelebrationTimer = 1.3;
        state.soundEvents.push('swish');
        b.vx = 0;
        b.vy = 120;
        return;
      } else {
        b.vy *= -0.6;
        b.vx *= 0.6;
        state.soundEvents.push('rim_hit');
      }
    }
  }

  // Screen bounds
  if (b.x < 15 || b.x > COURT_WIDTH - 15) {
    b.vx *= -0.7;
    b.x = Math.max(15, Math.min(COURT_WIDTH - 15, b.x));
  }
}

function checkBallPickup(player: BasketballPlayer, state: BasketballGameState): void {
  const b = state.ball;
  if (Math.hypot(player.x - b.x, (player.y - 20) - b.y) < 28) {
    b.holder = player.id;
    b.inFlight = false;
    b.vx = 0;
    b.vy = 0;
    state.possession = player.id;
    state.shotClock = 14;
    state.soundEvents.push('bounce');
  }
}
