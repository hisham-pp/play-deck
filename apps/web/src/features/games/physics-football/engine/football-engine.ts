/**
 * Physics Football Game Engine
 * Pure TypeScript 2D physics soccer simulation with momentum, collision impulses,
 * goalpost physics, goal scoring, and intelligent AI bot steering.
 */

export const PITCH_WIDTH = 800;
export const PITCH_HEIGHT = 500;
export const PITCH_PADDING_X = 50;
export const PITCH_PADDING_Y = 30;

export const GOAL_Y_MIN = 175;
export const GOAL_Y_MAX = 325;
export const GOAL_DEPTH = 50;
export const POST_RADIUS = 8;

export const BALL_RADIUS = 12;
export const BALL_FRICTION = 0.988;
export const BALL_MASS = 1.0;
export const BALL_RESTITUTION = 0.82;

export const PLAYER_RADIUS = 22;
export const PLAYER_MASS = 3.5;
export const PLAYER_SPEED = 260; // px/sec
export const PLAYER_ACCEL = 1400; // px/sec^2
export const PLAYER_FRICTION = 0.92;
export const KICK_REACH = 16;
export const KICK_POWER = 520;

export interface Vector2D {
  x: number;
  y: number;
}

export interface GoalPost {
  x: number;
  y: number;
  team: 'blue' | 'red';
}

export interface FootballPlayer {
  id: string;
  name: string;
  team: 'blue' | 'red';
  isAi: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  kickCooldown: number;
  isKicking: boolean;
}

export interface FootballBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lastTouchedBy: string | null;
}

export type FootballMatchStatus = 'kickoff' | 'playing' | 'goal_scored' | 'game_over';

export interface FootballState {
  players: FootballPlayer[];
  ball: FootballBall;
  blueScore: number;
  redScore: number;
  status: FootballMatchStatus;
  winnerTeam: 'blue' | 'red' | 'draw' | null;
  timeRemainingSec: number;
  stateTimerSec: number; // For kickoff countdown or goal celebration
  targetScore: number;
  lastScorer: 'blue' | 'red' | null;
}

export interface FootballPlayerAction {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  kick: boolean;
}

export const GOALPOSTS: GoalPost[] = [
  { x: PITCH_PADDING_X, y: GOAL_Y_MIN, team: 'blue' },
  { x: PITCH_PADDING_X, y: GOAL_Y_MAX, team: 'blue' },
  { x: PITCH_WIDTH - PITCH_PADDING_X, y: GOAL_Y_MIN, team: 'red' },
  { x: PITCH_WIDTH - PITCH_PADDING_X, y: GOAL_Y_MAX, team: 'red' },
];

/**
 * Initializes match state with players placed in standard kickoff formations.
 */
export function createInitialFootballState(
  bluePlayerName = 'Blue Striker',
  redPlayerName = 'Red Bot',
  redIsAi = true,
  targetScore = 3,
  matchDurationSec = 90,
): FootballState {
  const bluePlayer: FootballPlayer = {
    id: 'p1',
    name: bluePlayerName,
    team: 'blue',
    isAi: false,
    x: PITCH_WIDTH * 0.28,
    y: PITCH_HEIGHT * 0.5,
    vx: 0,
    vy: 0,
    radius: PLAYER_RADIUS,
    kickCooldown: 0,
    isKicking: false,
  };

  const redPlayer: FootballPlayer = {
    id: 'p2',
    name: redPlayerName,
    team: 'red',
    isAi: redIsAi,
    x: PITCH_WIDTH * 0.72,
    y: PITCH_HEIGHT * 0.5,
    vx: 0,
    vy: 0,
    radius: PLAYER_RADIUS,
    kickCooldown: 0,
    isKicking: false,
  };

  const ball: FootballBall = {
    x: PITCH_WIDTH * 0.5,
    y: PITCH_HEIGHT * 0.5,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    lastTouchedBy: null,
  };

  return {
    players: [bluePlayer, redPlayer],
    ball,
    blueScore: 0,
    redScore: 0,
    status: 'kickoff',
    winnerTeam: null,
    timeRemainingSec: matchDurationSec,
    stateTimerSec: 2.0, // 2 second kickoff pause
    targetScore,
    lastScorer: null,
  };
}

/**
 * Reset player and ball positions back to center kickoff.
 */
export function resetKickoffPositions(state: FootballState): FootballState {
  return {
    ...state,
    ball: {
      x: PITCH_WIDTH * 0.5,
      y: PITCH_HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      lastTouchedBy: null,
    },
    players: state.players.map((p) => ({
      ...p,
      x: p.team === 'blue' ? PITCH_WIDTH * 0.28 : PITCH_WIDTH * 0.72,
      y: PITCH_HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      isKicking: false,
      kickCooldown: 0,
    })),
    status: 'kickoff',
    stateTimerSec: 1.8,
  };
}

/**
 * Handle 2D circle-to-circle elastic collision resolution.
 */
export function resolveCircleCollision(
  c1: { x: number; y: number; vx: number; vy: number; radius: number; mass: number },
  c2: { x: number; y: number; vx: number; vy: number; radius: number; mass: number },
  restitution = 0.8,
): { collided: boolean; normal: Vector2D } {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = c1.radius + c2.radius;

  if (distSq >= minDist * minDist || distSq === 0) {
    return { collided: false, normal: { x: 0, y: 0 } };
  }

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;

  // Separate overlapping bodies
  const overlap = minDist - dist;
  const totalMass = c1.mass + c2.mass;
  c1.x -= nx * (overlap * (c2.mass / totalMass));
  c1.y -= ny * (overlap * (c2.mass / totalMass));
  c2.x += nx * (overlap * (c1.mass / totalMass));
  c2.y += ny * (overlap * (c1.mass / totalMass));

  // Calculate relative velocity along collision normal
  const rvx = c2.vx - c1.vx;
  const rvy = c2.vy - c1.vy;
  const velAlongNormal = rvx * nx + rvy * ny;

  // Do not resolve if velocities are already separating
  if (velAlongNormal > 0) {
    return { collided: true, normal: { x: nx, y: ny } };
  }

  // Calculate impulse scalar
  const impulse = (-(1 + restitution) * velAlongNormal) / (1 / c1.mass + 1 / c2.mass);

  c1.vx -= (impulse / c1.mass) * nx;
  c1.vy -= (impulse / c1.mass) * ny;
  c2.vx += (impulse / c2.mass) * nx;
  c2.vy += (impulse / c2.mass) * ny;

  return { collided: true, normal: { x: nx, y: ny } };
}

/**
 * Steps the physics simulation by delta time (in seconds).
 */
export function stepFootballGame(
  state: FootballState,
  actions: Record<string, FootballPlayerAction>,
  dt: number,
): FootballState {
  if (state.status === 'game_over') {
    return state;
  }

  const clampedDt = Math.min(dt, 0.05);

  // 1. Handle State Timers (Kickoff countdown or Goal celebration)
  if (state.status === 'kickoff') {
    const nextTimer = state.stateTimerSec - clampedDt;
    if (nextTimer <= 0) {
      return { ...state, status: 'playing', stateTimerSec: 0 };
    }
    return { ...state, stateTimerSec: nextTimer };
  }

  if (state.status === 'goal_scored') {
    const nextTimer = state.stateTimerSec - clampedDt;
    if (nextTimer <= 0) {
      // Check if match won
      if (
        state.blueScore >= state.targetScore ||
        state.redScore >= state.targetScore ||
        state.timeRemainingSec <= 0
      ) {
        let winner: 'blue' | 'red' | 'draw' = 'draw';
        if (state.blueScore > state.redScore) winner = 'blue';
        else if (state.redScore > state.blueScore) winner = 'red';
        return {
          ...state,
          status: 'game_over',
          winnerTeam: winner,
        };
      }
      return resetKickoffPositions(state);
    }
    return { ...state, stateTimerSec: nextTimer };
  }

  // Active Playing State
  const nextTimeRemaining = Math.max(0, state.timeRemainingSec - clampedDt);

  const players = state.players.map((p) => ({ ...p }));
  const ball: FootballBall = { ...state.ball };

  // 2. Update Players (Acceleration, Drag, Kicks)
  for (const player of players) {
    const act = actions[player.id] || { moveX: 0, moveY: 0, kick: false };

    // Movement impulse
    const len = Math.hypot(act.moveX, act.moveY);
    if (len > 0.01) {
      const dirX = act.moveX / len;
      const dirY = act.moveY / len;
      player.vx += dirX * PLAYER_ACCEL * clampedDt;
      player.vy += dirY * PLAYER_ACCEL * clampedDt;

      // Clamp max velocity
      const currentSpeed = Math.hypot(player.vx, player.vy);
      if (currentSpeed > PLAYER_SPEED) {
        player.vx = (player.vx / currentSpeed) * PLAYER_SPEED;
        player.vy = (player.vy / currentSpeed) * PLAYER_SPEED;
      }
    }

    // Player friction
    player.vx *= Math.pow(PLAYER_FRICTION, clampedDt * 60);
    player.vy *= Math.pow(PLAYER_FRICTION, clampedDt * 60);

    // Update position
    player.x += player.vx * clampedDt;
    player.y += player.vy * clampedDt;

    // Boundary constraints for players (must stay on main pitch, not inside goal netting)
    const minX = PITCH_PADDING_X + player.radius;
    const maxX = PITCH_WIDTH - PITCH_PADDING_X - player.radius;
    const minY = PITCH_PADDING_Y + player.radius;
    const maxY = PITCH_HEIGHT - PITCH_PADDING_Y - player.radius;

    if (player.x < minX) {
      player.x = minX;
      player.vx = 0;
    } else if (player.x > maxX) {
      player.x = maxX;
      player.vx = 0;
    }

    if (player.y < minY) {
      player.y = minY;
      player.vy = 0;
    } else if (player.y > maxY) {
      player.y = maxY;
      player.vy = 0;
    }

    // Kick cooldown
    player.kickCooldown = Math.max(0, player.kickCooldown - clampedDt);
    player.isKicking = act.kick && player.kickCooldown <= 0;

    if (player.isKicking) {
      player.kickCooldown = 0.35; // 350ms cooldown between kicks

      // Check kick collision with ball
      const dx = ball.x - player.x;
      const dy = ball.y - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < player.radius + ball.radius + KICK_REACH && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        ball.vx = nx * KICK_POWER;
        ball.vy = ny * KICK_POWER;
        ball.lastTouchedBy = player.id;
      }
    }
  }

  // 3. Player vs Player Collisions
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      resolveCircleCollision(
        {
          x: players[i].x,
          y: players[i].y,
          vx: players[i].vx,
          vy: players[i].vy,
          radius: players[i].radius,
          mass: PLAYER_MASS,
        },
        {
          x: players[j].x,
          y: players[j].y,
          vx: players[j].vx,
          vy: players[j].vy,
          radius: players[j].radius,
          mass: PLAYER_MASS,
        },
        0.5,
      );
    }
  }

  // 4. Player vs Ball Collisions
  for (const player of players) {
    const ballObj = {
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy,
      radius: ball.radius,
      mass: BALL_MASS,
    };
    const playerObj = {
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      radius: player.radius,
      mass: PLAYER_MASS,
    };

    const res = resolveCircleCollision(playerObj, ballObj, BALL_RESTITUTION);
    if (res.collided) {
      player.x = playerObj.x;
      player.y = playerObj.y;
      player.vx = playerObj.vx;
      player.vy = playerObj.vy;

      ball.x = ballObj.x;
      ball.y = ballObj.y;
      ball.vx = ballObj.vx;
      ball.vy = ballObj.vy;
      ball.lastTouchedBy = player.id;
    }
  }

  // 5. Ball vs Goalposts Collisions
  for (const post of GOALPOSTS) {
    const postObj = {
      x: post.x,
      y: post.y,
      vx: 0,
      vy: 0,
      radius: POST_RADIUS,
      mass: 10000, // Immovable post
    };
    const ballObj = {
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy,
      radius: ball.radius,
      mass: BALL_MASS,
    };

    const res = resolveCircleCollision(postObj, ballObj, BALL_RESTITUTION);
    if (res.collided) {
      ball.x = ballObj.x;
      ball.y = ballObj.y;
      ball.vx = ballObj.vx;
      ball.vy = ballObj.vy;
    }
  }

  // 6. Ball Physics (Friction, Motion, Pitch & Goal Boundary Collisions)
  ball.vx *= Math.pow(BALL_FRICTION, clampedDt * 60);
  ball.vy *= Math.pow(BALL_FRICTION, clampedDt * 60);

  ball.x += ball.vx * clampedDt;
  ball.y += ball.vy * clampedDt;

  const topY = PITCH_PADDING_Y + ball.radius;
  const botY = PITCH_HEIGHT - PITCH_PADDING_Y - ball.radius;
  const leftX = PITCH_PADDING_X + ball.radius;
  const rightX = PITCH_WIDTH - PITCH_PADDING_X - ball.radius;

  // Top and bottom boundary bounces
  if (ball.y < topY) {
    ball.y = topY;
    ball.vy = -ball.vy * BALL_RESTITUTION;
  } else if (ball.y > botY) {
    ball.y = botY;
    ball.vy = -ball.vy * BALL_RESTITUTION;
  }

  // Left side walls (above and below goal opening)
  const inGoalMouthY = ball.y >= GOAL_Y_MIN && ball.y <= GOAL_Y_MAX;

  if (!inGoalMouthY) {
    // Normal wall collision on sides
    if (ball.x < leftX) {
      ball.x = leftX;
      ball.vx = -ball.vx * BALL_RESTITUTION;
    } else if (ball.x > rightX) {
      ball.x = rightX;
      ball.vx = -ball.vx * BALL_RESTITUTION;
    }
  } else {
    // In goal mouth region: Ball can enter the goal nets!
    // Left goal back net
    const leftGoalNetX = PITCH_PADDING_X - GOAL_DEPTH + ball.radius;
    if (ball.x < leftGoalNetX) {
      ball.x = leftGoalNetX;
      ball.vx = -ball.vx * 0.4;
    }
    // Right goal back net
    const rightGoalNetX = PITCH_WIDTH - PITCH_PADDING_X + GOAL_DEPTH - ball.radius;
    if (ball.x > rightGoalNetX) {
      ball.x = rightGoalNetX;
      ball.vx = -ball.vx * 0.4;
    }
  }

  // 7. Goal Detection
  let nextStatus: FootballMatchStatus = state.status;
  let nextBlueScore = state.blueScore;
  let nextRedScore = state.redScore;
  let nextLastScorer = state.lastScorer;
  let nextStateTimer = state.stateTimerSec;

  // Ball fully crossed left goal line -> Goal for Red team!
  if (ball.x < PITCH_PADDING_X - 10 && inGoalMouthY) {
    nextRedScore += 1;
    nextLastScorer = 'red';
    nextStatus = 'goal_scored';
    nextStateTimer = 2.2;
  }
  // Ball fully crossed right goal line -> Goal for Blue team!
  else if (ball.x > PITCH_WIDTH - PITCH_PADDING_X + 10 && inGoalMouthY) {
    nextBlueScore += 1;
    nextLastScorer = 'blue';
    nextStatus = 'goal_scored';
    nextStateTimer = 2.2;
  }

  // Match time expiration
  if (nextTimeRemaining <= 0 && nextStatus === 'playing') {
    let winner: 'blue' | 'red' | 'draw' = 'draw';
    if (nextBlueScore > nextRedScore) winner = 'blue';
    else if (nextRedScore > nextBlueScore) winner = 'red';

    return {
      ...state,
      players,
      ball,
      blueScore: nextBlueScore,
      redScore: nextRedScore,
      status: 'game_over',
      winnerTeam: winner,
      timeRemainingSec: 0,
      lastScorer: nextLastScorer,
    };
  }

  return {
    ...state,
    players,
    ball,
    blueScore: nextBlueScore,
    redScore: nextRedScore,
    status: nextStatus,
    timeRemainingSec: nextTimeRemaining,
    stateTimerSec: nextStateTimer,
    lastScorer: nextLastScorer,
  };
}

/**
 * Intelligent AI bot controller for Football.
 * Handles defensive positioning, ball interception, angle alignment, and shooting.
 */
export function getFootballBotAction(
  bot: FootballPlayer,
  state: FootballState,
): FootballPlayerAction {
  if (state.status !== 'playing') {
    return { moveX: 0, moveY: 0, kick: false };
  }

  const ball = state.ball;
  const isRed = bot.team === 'red';

  // Own goal position to defend
  const ownGoalX = isRed ? PITCH_WIDTH - PITCH_PADDING_X : PITCH_PADDING_X;

  const distToBall = Math.hypot(ball.x - bot.x, ball.y - bot.y);
  const ballInDefensiveZone = isRed ? ball.x > PITCH_WIDTH * 0.6 : ball.x < PITCH_WIDTH * 0.4;

  let moveX: number;
  let moveY: number;
  let kick = false;

  // If close enough to kick
  if (distToBall < bot.radius + ball.radius + KICK_REACH + 6) {
    // Only kick if facing toward opponent goal or clearing defensive danger
    const towardGoal = isRed ? ball.x < bot.x : ball.x > bot.x;
    if (towardGoal || ballInDefensiveZone) {
      kick = true;
    }
  }

  // Navigation Logic
  if (isRed) {
    // Red Bot attacks leftwards (toward x = 0)
    // If bot is behind the ball (ball is to the left of bot), move straight at ball to strike it toward goal
    if (ball.x < bot.x + 10) {
      const angle = Math.atan2(ball.y - bot.y, ball.x - bot.x);
      moveX = Math.cos(angle);
      moveY = Math.sin(angle);
    } else {
      // Ball is behind bot (near red goal) -> Recover positioning behind ball!
      const retreatX = Math.min(ball.x + 50, ownGoalX - 30);
      const retreatY = ball.y;
      const angle = Math.atan2(retreatY - bot.y, retreatX - bot.x);
      moveX = Math.cos(angle);
      moveY = Math.sin(angle);
    }
  } else {
    // Blue Bot attacks rightwards (toward x = PITCH_WIDTH)
    if (ball.x > bot.x - 10) {
      const angle = Math.atan2(ball.y - bot.y, ball.x - bot.x);
      moveX = Math.cos(angle);
      moveY = Math.sin(angle);
    } else {
      const retreatX = Math.max(ball.x - 50, ownGoalX + 30);
      const retreatY = ball.y;
      const angle = Math.atan2(retreatY - bot.y, retreatX - bot.x);
      moveX = Math.cos(angle);
      moveY = Math.sin(angle);
    }
  }

  // Slight predictive lead
  if (distToBall > 100) {
    moveX = moveX + Math.sign(ball.vx) * 0.2;
    moveY = moveY + Math.sign(ball.vy) * 0.2;
  }

  return { moveX, moveY, kick };
}
