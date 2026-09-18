import { MINI_GOLF_COURSES } from './mini-golf-courses';
import { MAX_SHOT_SPEED, updateBallPhysics, type PhysicsStepEvents } from './mini-golf-physics';
import type {
  Ball,
  GameMode,
  HoleDefinition,
  HoleScore,
  MiniGolfState,
  Player,
  PlayerScoreCard,
  Rotator,
  ScoreClassification,
} from './mini-golf-types';

export const DEFAULT_PLAYERS: Record<GameMode, Player[]> = {
  solo: [{ id: 'p1', name: 'Player 1', color: '#10b981' }],
  'vs-ai': [
    { id: 'p1', name: 'Player 1', color: '#10b981' },
    { id: 'ai-bot', name: 'Ace Bot', color: '#f59e0b', isAi: true },
  ],
  'pass-and-play': [
    { id: 'p1', name: 'Player 1', color: '#10b981' },
    { id: 'p2', name: 'Player 2', color: '#38bdf8' },
  ],
};

export function classifyScore(strokes: number, par: number): ScoreClassification {
  if (strokes === 1) return 'ace';
  const diff = strokes - par;
  if (diff <= -3) return 'albatross';
  if (diff === -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 0) return 'par';
  if (diff === 1) return 'bogey';
  if (diff === 2) return 'double-bogey';
  if (strokes >= par + 5) return 'limit';
  return 'over';
}

export function createInitialBall(tee: { x: number; y: number }): Ball {
  return {
    x: tee.x,
    y: tee.y,
    vx: 0,
    vy: 0,
    radius: 7,
    inHole: false,
    inWater: false,
    isResting: true,
    lastLie: { ...tee },
    trail: [],
  };
}

export function createInitialMiniGolfState(
  mode: GameMode = 'solo',
  customPlayers?: Player[],
  holes: HoleDefinition[] = MINI_GOLF_COURSES,
): MiniGolfState {
  const players = customPlayers ?? DEFAULT_PLAYERS[mode];
  const initialHole = holes[0];

  const scorecards: Record<string, PlayerScoreCard> = {};
  for (const player of players) {
    scorecards[player.id] = {
      player,
      holeScores: [],
      totalStrokes: 0,
      totalParDiff: 0,
      holesInOne: 0,
    };
  }

  return {
    currentHoleIndex: 0,
    holes,
    players,
    activePlayerIndex: 0,
    phase: 'aiming',
    mode,
    ball: createInitialBall(initialHole.tee),
    scorecards,
    currentStrokes: 0,
    rotatorsState: initialHole.rotators.map((r) => ({ ...r })),
    isMuted: false,
  };
}

export function executeShot(state: MiniGolfState, angle: number, power: number): MiniGolfState {
  if (state.phase !== 'aiming') return state;

  const clampedPower = Math.max(0.05, Math.min(1.0, power));
  const shotSpeed = clampedPower * MAX_SHOT_SPEED;

  const updatedBall: Ball = {
    ...state.ball,
    vx: Math.cos(angle) * shotSpeed,
    vy: Math.sin(angle) * shotSpeed,
    isResting: false,
    inHole: false,
    inWater: false,
    lastLie: { x: state.ball.x, y: state.ball.y },
    trail: [],
  };

  return {
    ...state,
    ball: updatedBall,
    phase: 'rolling',
    currentStrokes: state.currentStrokes + 1,
  };
}

export function tickGame(
  state: MiniGolfState,
  dt: number,
): { state: MiniGolfState; events: PhysicsStepEvents } {
  const currentHole = state.holes[state.currentHoleIndex];
  if (!currentHole) {
    return {
      state,
      events: {
        hitWall: false,
        hitBumper: false,
        hitSand: false,
        hitWater: false,
        hitPortal: false,
        inHole: false,
        lipOut: false,
      },
    };
  }

  // Update rotators
  const nextRotators: Rotator[] = state.rotatorsState.map((rot) => ({
    ...rot,
    angle: rot.angle + rot.speed * dt,
  }));

  // Update ball physics
  const ballCopy: Ball = { ...state.ball, trail: [...state.ball.trail] };
  const events = updateBallPhysics(ballCopy, currentHole, nextRotators, dt);

  // 1. Water Hazard penalty drop
  if (events.hitWater) {
    const penaltyBall: Ball = {
      ...ballCopy,
      x: ballCopy.lastLie.x,
      y: ballCopy.lastLie.y,
      vx: 0,
      vy: 0,
      inWater: false,
      isResting: true,
      trail: [],
    };

    return {
      state: {
        ...state,
        ball: penaltyBall,
        rotatorsState: nextRotators,
        currentStrokes: state.currentStrokes + 1, // +1 penalty stroke
        phase: 'aiming',
      },
      events,
    };
  }

  // 2. Ball Sunk in Cup!
  if (events.inHole) {
    const activePlayer = state.players[state.activePlayerIndex];
    const par = currentHole.par;
    const strokes = state.currentStrokes;
    const classification = classifyScore(strokes, par);

    const prevScorecard = state.scorecards[activePlayer.id];
    const newHoleScore: HoleScore = {
      holeNumber: currentHole.id,
      par,
      strokes,
      classification,
    };

    const updatedScorecards = {
      ...state.scorecards,
      [activePlayer.id]: {
        ...prevScorecard,
        holeScores: [...prevScorecard.holeScores, newHoleScore],
        totalStrokes: prevScorecard.totalStrokes + strokes,
        totalParDiff: prevScorecard.totalParDiff + (strokes - par),
        holesInOne: prevScorecard.holesInOne + (strokes === 1 ? 1 : 0),
      },
    };

    return {
      state: {
        ...state,
        ball: ballCopy,
        rotatorsState: nextRotators,
        scorecards: updatedScorecards,
        phase: 'hole-clear',
        lastScoreClassification: classification,
      },
      events,
    };
  }

  // 3. Ball came to rest
  if (ballCopy.isResting && state.phase === 'rolling') {
    const maxStrokes = currentHole.par + 5;
    if (state.currentStrokes >= maxStrokes) {
      // Stroke limit reached: auto-score as limit
      const activePlayer = state.players[state.activePlayerIndex];
      const prevScorecard = state.scorecards[activePlayer.id];
      const newHoleScore: HoleScore = {
        holeNumber: currentHole.id,
        par: currentHole.par,
        strokes: maxStrokes,
        classification: 'limit',
      };

      const updatedScorecards = {
        ...state.scorecards,
        [activePlayer.id]: {
          ...prevScorecard,
          holeScores: [...prevScorecard.holeScores, newHoleScore],
          totalStrokes: prevScorecard.totalStrokes + maxStrokes,
          totalParDiff: prevScorecard.totalParDiff + 5,
        },
      };

      return {
        state: {
          ...state,
          ball: ballCopy,
          rotatorsState: nextRotators,
          scorecards: updatedScorecards,
          phase: 'hole-clear',
          lastScoreClassification: 'limit',
        },
        events,
      };
    }

    return {
      state: {
        ...state,
        ball: ballCopy,
        rotatorsState: nextRotators,
        phase: 'aiming',
      },
      events,
    };
  }

  return {
    state: {
      ...state,
      ball: ballCopy,
      rotatorsState: nextRotators,
    },
    events,
  };
}

export function advanceToNextHole(state: MiniGolfState): MiniGolfState {
  const nextHoleIndex = state.currentHoleIndex + 1;
  if (nextHoleIndex >= state.holes.length) {
    return {
      ...state,
      phase: 'course-complete',
    };
  }

  const nextHole = state.holes[nextHoleIndex];
  return {
    ...state,
    currentHoleIndex: nextHoleIndex,
    phase: 'aiming',
    currentStrokes: 0,
    ball: createInitialBall(nextHole.tee),
    rotatorsState: nextHole.rotators.map((r) => ({ ...r })),
    lastScoreClassification: undefined,
  };
}

export function restartGame(state: MiniGolfState): MiniGolfState {
  return createInitialMiniGolfState(state.mode, state.players, state.holes);
}

/**
 * Intelligent AI opponent shot calculator.
 * Calculates direct angle toward cup with distance-proportional power,
 * with slight realistic human variance.
 */
export function computeAiShot(state: MiniGolfState): { angle: number; power: number } {
  const currentHole = state.holes[state.currentHoleIndex];
  const ball = state.ball;
  const cup = currentHole.cup;

  const dx = cup.x - ball.x;
  const dy = cup.y - ball.y;
  const dist = Math.hypot(dx, dy);

  let targetAngle = Math.atan2(dy, dx);
  // Add slight +/- 0.04 rad variance to simulate natural human aim
  const variance = (Math.random() - 0.5) * 0.08;
  targetAngle += variance;

  // Power proportional to distance with room for deceleration
  const requiredSpeed = Math.sqrt(dist * 520);
  let power = Math.min(0.95, Math.max(0.18, requiredSpeed / MAX_SHOT_SPEED));

  // If in sand, give extra punch
  const inSand = currentHole.sandTraps.some(
    (trap) =>
      ball.x >= trap.x &&
      ball.x <= trap.x + ('width' in trap ? trap.width : 0) &&
      ball.y >= trap.y &&
      ball.y <= trap.y + ('height' in trap ? trap.height : 0),
  );
  if (inSand) {
    power = Math.min(1.0, power * 1.5);
  }

  return { angle: targetAngle, power };
}
