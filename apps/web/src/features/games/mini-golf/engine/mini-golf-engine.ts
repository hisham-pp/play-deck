import { FRONT_NINE_COURSES, MINI_GOLF_COURSES } from './mini-golf-courses';
import { MAX_SHOT_SPEED, updateBallPhysics, type PhysicsStepEvents } from './mini-golf-physics';
import type {
  Ball,
  CoursePreset,
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
  solo: [{ id: 'p1', name: 'Player 1', color: '#10b981', glyph: 'circle' }],
  'vs-ai': [
    { id: 'p1', name: 'Player 1', color: '#10b981', glyph: 'circle' },
    { id: 'ai-bot', name: 'Ace Bot', color: '#f59e0b', glyph: 'star', isAi: true },
  ],
  'pass-and-play': [
    { id: 'p1', name: 'Player 1', color: '#10b981', glyph: 'circle' },
    { id: 'p2', name: 'Player 2', color: '#38bdf8', glyph: 'diamond' },
  ],
  online: [{ id: 'p1', name: 'Player 1', color: '#10b981', glyph: 'circle' }],
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

export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number,
  completedIds: string[],
): number {
  if (completedIds.length >= players.length) return currentIndex;
  let next = (currentIndex + 1) % players.length;
  for (let i = 0; i < players.length; i++) {
    if (!completedIds.includes(players[next].id)) {
      return next;
    }
    next = (next + 1) % players.length;
  }
  return currentIndex;
}

export function createInitialMiniGolfState(
  mode: GameMode = 'solo',
  customPlayers?: Player[],
  holes: HoleDefinition[] = FRONT_NINE_COURSES,
  coursePreset: CoursePreset = 'front-9',
): MiniGolfState {
  const players = customPlayers ?? DEFAULT_PLAYERS[mode];
  const initialHole = holes[0] ?? MINI_GOLF_COURSES[0];

  const scorecards: Record<string, PlayerScoreCard> = {};
  const playerBalls: Record<string, Ball> = {};
  const playerHoleStrokes: Record<string, number> = {};

  for (const player of players) {
    scorecards[player.id] = {
      player,
      holeScores: [],
      totalStrokes: 0,
      totalParDiff: 0,
      holesInOne: 0,
    };
    playerBalls[player.id] = createInitialBall(initialHole.tee);
    playerHoleStrokes[player.id] = 0;
  }

  const activePlayer = players[0];

  return {
    currentHoleIndex: 0,
    holes,
    players,
    activePlayerIndex: 0,
    phase: 'aiming',
    mode,
    coursePreset,
    ball: playerBalls[activePlayer.id] ?? createInitialBall(initialHole.tee),
    playerBalls,
    completedHolePlayerIds: [],
    playerHoleStrokes,
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

  const activePlayer = state.players[state.activePlayerIndex];
  const currentStrokes = (state.playerHoleStrokes[activePlayer.id] ?? 0) + 1;

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
    playerBalls: {
      ...state.playerBalls,
      [activePlayer.id]: updatedBall,
    },
    playerHoleStrokes: {
      ...state.playerHoleStrokes,
      [activePlayer.id]: currentStrokes,
    },
    currentStrokes,
    phase: 'rolling',
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

  // Update active ball physics
  const ballCopy: Ball = { ...state.ball, trail: [...state.ball.trail] };
  const events = updateBallPhysics(ballCopy, currentHole, nextRotators, dt);
  const activePlayer = state.players[state.activePlayerIndex];

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

    const nextStrokes = (state.playerHoleStrokes[activePlayer.id] ?? state.currentStrokes) + 1; // +1 penalty
    const updatedBalls = { ...state.playerBalls, [activePlayer.id]: penaltyBall };
    const updatedHoleStrokes = { ...state.playerHoleStrokes, [activePlayer.id]: nextStrokes };

    // In multi-player, rotate to next player after penalty drop
    if (state.players.length > 1) {
      const nextActiveIndex = getNextActivePlayerIndex(
        state.players,
        state.activePlayerIndex,
        state.completedHolePlayerIds,
      );
      const nextPlayer = state.players[nextActiveIndex];
      return {
        state: {
          ...state,
          ball: updatedBalls[nextPlayer.id],
          playerBalls: updatedBalls,
          playerHoleStrokes: updatedHoleStrokes,
          rotatorsState: nextRotators,
          activePlayerIndex: nextActiveIndex,
          currentStrokes: updatedHoleStrokes[nextPlayer.id] ?? 0,
          phase: 'aiming',
        },
        events,
      };
    }

    return {
      state: {
        ...state,
        ball: penaltyBall,
        playerBalls: updatedBalls,
        playerHoleStrokes: updatedHoleStrokes,
        rotatorsState: nextRotators,
        currentStrokes: nextStrokes,
        phase: 'aiming',
      },
      events,
    };
  }

  // 2. Ball Sunk in Cup!
  if (events.inHole) {
    const par = currentHole.par;
    const strokes = state.playerHoleStrokes[activePlayer.id] ?? state.currentStrokes;
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

    const nextCompleted = state.completedHolePlayerIds.includes(activePlayer.id)
      ? state.completedHolePlayerIds
      : [...state.completedHolePlayerIds, activePlayer.id];

    const updatedBalls = {
      ...state.playerBalls,
      [activePlayer.id]: ballCopy,
    };

    // Check if ALL players have sunk or finished the hole
    if (nextCompleted.length >= state.players.length) {
      return {
        state: {
          ...state,
          ball: ballCopy,
          playerBalls: updatedBalls,
          rotatorsState: nextRotators,
          scorecards: updatedScorecards,
          completedHolePlayerIds: nextCompleted,
          phase: 'hole-clear',
          lastScoreClassification: classification,
        },
        events,
      };
    }

    // Switch to next active unfinished player
    const nextActiveIndex = getNextActivePlayerIndex(
      state.players,
      state.activePlayerIndex,
      nextCompleted,
    );
    const nextPlayer = state.players[nextActiveIndex];

    return {
      state: {
        ...state,
        ball: updatedBalls[nextPlayer.id],
        playerBalls: updatedBalls,
        rotatorsState: nextRotators,
        scorecards: updatedScorecards,
        completedHolePlayerIds: nextCompleted,
        activePlayerIndex: nextActiveIndex,
        currentStrokes: state.playerHoleStrokes[nextPlayer.id] ?? 0,
        phase: 'aiming',
        lastScoreClassification: classification,
      },
      events,
    };
  }

  // 3. Ball came to rest
  if (ballCopy.isResting && state.phase === 'rolling') {
    const maxStrokes = currentHole.par + 5;
    const strokes = state.playerHoleStrokes[activePlayer.id] ?? state.currentStrokes;

    if (strokes >= maxStrokes) {
      // Stroke limit reached: auto-score as limit
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

      const nextCompleted = state.completedHolePlayerIds.includes(activePlayer.id)
        ? state.completedHolePlayerIds
        : [...state.completedHolePlayerIds, activePlayer.id];

      const updatedBalls = { ...state.playerBalls, [activePlayer.id]: ballCopy };

      if (nextCompleted.length >= state.players.length) {
        return {
          state: {
            ...state,
            ball: ballCopy,
            playerBalls: updatedBalls,
            rotatorsState: nextRotators,
            scorecards: updatedScorecards,
            completedHolePlayerIds: nextCompleted,
            phase: 'hole-clear',
            lastScoreClassification: 'limit',
          },
          events,
        };
      }

      const nextActiveIndex = getNextActivePlayerIndex(
        state.players,
        state.activePlayerIndex,
        nextCompleted,
      );
      const nextPlayer = state.players[nextActiveIndex];

      return {
        state: {
          ...state,
          ball: updatedBalls[nextPlayer.id],
          playerBalls: updatedBalls,
          rotatorsState: nextRotators,
          scorecards: updatedScorecards,
          completedHolePlayerIds: nextCompleted,
          activePlayerIndex: nextActiveIndex,
          currentStrokes: state.playerHoleStrokes[nextPlayer.id] ?? 0,
          phase: 'aiming',
          lastScoreClassification: 'limit',
        },
        events,
      };
    }

    const updatedBalls = { ...state.playerBalls, [activePlayer.id]: ballCopy };

    if (state.players.length > 1) {
      const nextActiveIndex = getNextActivePlayerIndex(
        state.players,
        state.activePlayerIndex,
        state.completedHolePlayerIds,
      );
      const nextPlayer = state.players[nextActiveIndex];

      return {
        state: {
          ...state,
          ball: updatedBalls[nextPlayer.id],
          playerBalls: updatedBalls,
          rotatorsState: nextRotators,
          activePlayerIndex: nextActiveIndex,
          currentStrokes: state.playerHoleStrokes[nextPlayer.id] ?? 0,
          phase: 'aiming',
        },
        events,
      };
    }

    return {
      state: {
        ...state,
        ball: ballCopy,
        playerBalls: updatedBalls,
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
  const playerBalls: Record<string, Ball> = {};
  const playerHoleStrokes: Record<string, number> = {};

  for (const player of state.players) {
    playerBalls[player.id] = createInitialBall(nextHole.tee);
    playerHoleStrokes[player.id] = 0;
  }

  const initialPlayer = state.players[0];

  return {
    ...state,
    currentHoleIndex: nextHoleIndex,
    phase: 'aiming',
    activePlayerIndex: 0,
    currentStrokes: 0,
    ball: playerBalls[initialPlayer.id] ?? createInitialBall(nextHole.tee),
    playerBalls,
    completedHolePlayerIds: [],
    playerHoleStrokes,
    rotatorsState: nextHole.rotators.map((r) => ({ ...r })),
    lastScoreClassification: undefined,
  };
}

export function restartGame(state: MiniGolfState): MiniGolfState {
  return createInitialMiniGolfState(state.mode, state.players, state.holes, state.coursePreset);
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
