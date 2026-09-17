import { computeAiInput } from './pong-ai';
import {
  AI_DIFFICULTY_SPEEDS,
  BALL_INITIAL_SPEED,
  BALL_RADIUS,
  DEFAULT_PADDLE_SPEED,
  DEFAULT_PONG_CONFIG,
  PADDLE_HEIGHT,
  PADDLE_OFFSET_X,
  PADDLE_WIDTH,
  PONG_ARENA_HEIGHT,
  PONG_ARENA_WIDTH,
  SERVE_DELAY_SECONDS,
} from './pong-constants';
import { updateBallPhysics, updatePaddlePosition } from './pong-physics';
import type {
  Ball,
  Paddle,
  PongConfig,
  PongEvent,
  PongInputs,
  PongSide,
  PongState,
} from './pong-types';

export function createPaddle(x: number, arenaHeight: number = PONG_ARENA_HEIGHT): Paddle {
  return {
    x,
    y: (arenaHeight - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    vy: 0,
    score: 0,
  };
}

/**
 * Creates a stationary ball ready to be served towards the opponent.
 */
export function createBallForServe(
  serverSide: PongSide,
  speed: number = BALL_INITIAL_SPEED,
  arenaWidth: number = PONG_ARENA_WIDTH,
  arenaHeight: number = PONG_ARENA_HEIGHT,
  fixedAngle?: number,
): Ball {
  const angle = fixedAngle !== undefined ? fixedAngle : ((Math.random() * 40 - 20) * Math.PI) / 180; // -20 to +20 degrees

  // If server is left, ball serves towards right (+vx); if server is right, ball serves towards left (-vx)
  const dir = serverSide === 'left' ? 1 : -1;
  const vx = dir * Math.abs(Math.cos(angle) * speed);
  const vy = Math.sin(angle) * speed;

  return {
    x: arenaWidth / 2,
    y: arenaHeight / 2,
    radius: BALL_RADIUS,
    vx,
    vy,
    speed,
  };
}

export function createInitialPongState(customConfig?: Partial<PongConfig>): PongState {
  const config: PongConfig = {
    ...DEFAULT_PONG_CONFIG,
    ...customConfig,
  };

  const p1X = PADDLE_OFFSET_X;
  const p2X = PONG_ARENA_WIDTH - PADDLE_OFFSET_X - PADDLE_WIDTH;

  const player1 = createPaddle(p1X);
  const player2 = createPaddle(p2X);
  const serverSide: PongSide = 'left';
  const ball = createBallForServe(serverSide);

  return {
    status: 'ready',
    player1,
    player2,
    ball,
    servePending: true,
    serverSide,
    serveCountdown: SERVE_DELAY_SECONDS,
    rally: 0,
    highestRallyInGame: 0,
    winner: null,
    config,
  };
}

export interface StepResult {
  state: PongState;
  events: PongEvent[];
}

/**
 * Deterministic game physics tick.
 */
export function stepPongGame(
  prevState: PongState,
  inputs: PongInputs,
  dt: number,
  customServeAngle?: number,
): StepResult {
  if (prevState.status !== 'playing') {
    return { state: prevState, events: [] };
  }

  const { config, player1, player2, ball, rally, highestRallyInGame, serverSide } = prevState;
  const allEvents: PongEvent[] = [];

  // Determine paddle 2 input (Local 2P human vs AI)
  const p1Speed = config.paddleSpeed || DEFAULT_PADDLE_SPEED;
  let effectiveP2Input = inputs.player2;
  let p2Speed = config.paddleSpeed || DEFAULT_PADDLE_SPEED;

  if (config.mode === 'single-player') {
    effectiveP2Input = computeAiInput(player2, ball, config.difficulty);
    p2Speed = AI_DIFFICULTY_SPEEDS[config.difficulty];
  }

  // Update paddles
  const updatedP1 = updatePaddlePosition(player1, inputs.player1, p1Speed, dt);
  const updatedP2 = updatePaddlePosition(player2, effectiveP2Input, p2Speed, dt);

  // Serve delay countdown handling
  if (prevState.servePending) {
    const nextCountdown = prevState.serveCountdown - dt;

    if (nextCountdown <= 0) {
      allEvents.push({
        type: 'serve-launched',
        side: serverSide,
        ballSpeed: ball.speed,
      });

      return {
        state: {
          ...prevState,
          player1: updatedP1,
          player2: updatedP2,
          servePending: false,
          serveCountdown: 0,
        },
        events: allEvents,
      };
    }

    return {
      state: {
        ...prevState,
        player1: updatedP1,
        player2: updatedP2,
        serveCountdown: nextCountdown,
      },
      events: allEvents,
    };
  }

  // Ball in motion
  const {
    ball: nextBall,
    rally: nextRally,
    events: physicsEvents,
  } = updateBallPhysics(ball, updatedP1, updatedP2, rally, dt);

  allEvents.push(...physicsEvents);

  const newHighestRally = Math.max(highestRallyInGame, nextRally);

  // Check scoring events
  const pointScoredEvent = physicsEvents.find((e) => e.type === 'point-scored');
  if (pointScoredEvent && pointScoredEvent.scorer) {
    const scorer = pointScoredEvent.scorer;
    const nextP1Score = scorer === 'left' ? updatedP1.score + 1 : updatedP1.score;
    const nextP2Score = scorer === 'right' ? updatedP2.score + 1 : updatedP2.score;

    const scoredP1 = { ...updatedP1, score: nextP1Score };
    const scoredP2 = { ...updatedP2, score: nextP2Score };

    // Check Win condition
    const isP1Win = nextP1Score >= config.winningScore;
    const isP2Win = nextP2Score >= config.winningScore;

    if (isP1Win || isP2Win) {
      const winner: PongSide = isP1Win ? 'left' : 'right';
      allEvents.push({
        type: 'game-won',
        winner,
        rally: newHighestRally,
      });

      return {
        state: {
          ...prevState,
          status: 'game-over',
          player1: scoredP1,
          player2: scoredP2,
          rally: 0,
          highestRallyInGame: newHighestRally,
          winner,
        },
        events: allEvents,
      };
    }

    // Prepare next serve towards the conceding player
    const nextServerSide: PongSide = scorer === 'left' ? 'right' : 'left';
    const freshBall = createBallForServe(
      nextServerSide,
      BALL_INITIAL_SPEED,
      PONG_ARENA_WIDTH,
      PONG_ARENA_HEIGHT,
      customServeAngle,
    );

    return {
      state: {
        ...prevState,
        player1: scoredP1,
        player2: scoredP2,
        ball: freshBall,
        servePending: true,
        serverSide: nextServerSide,
        serveCountdown: SERVE_DELAY_SECONDS,
        rally: 0,
        highestRallyInGame: newHighestRally,
      },
      events: allEvents,
    };
  }

  return {
    state: {
      ...prevState,
      player1: updatedP1,
      player2: updatedP2,
      ball: nextBall,
      rally: nextRally,
      highestRallyInGame: newHighestRally,
    },
    events: allEvents,
  };
}

export function startOrResumePong(state: PongState): PongState {
  if (state.status === 'playing') return state;
  return {
    ...state,
    status: 'playing',
  };
}

export function pausePongGame(state: PongState): PongState {
  if (state.status !== 'playing') return state;
  return {
    ...state,
    status: 'paused',
  };
}

export function restartPongGame(state: PongState, newConfig?: Partial<PongConfig>): PongState {
  const mergedConfig = {
    ...state.config,
    ...newConfig,
  };
  const fresh = createInitialPongState(mergedConfig);
  return {
    ...fresh,
    status: 'playing',
  };
}
