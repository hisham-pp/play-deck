export type ChallengeType =
  'tap_target' | 'color_match' | 'quick_math' | 'stop_marker' | 'direction_arrow' | 'odd_tile';

export interface ChallengeDef {
  id: string;
  type: ChallengeType;
  title: string;
  instructions: string;
  durationMs: number;
  data: Record<string, unknown>;
}

export interface PlayerScore {
  playerId: string;
  name: string;
  isAi: boolean;
  totalScore: number;
  reactionTimes: number[];
  roundScores: number[];
  currentRoundAnswer: {
    answered: boolean;
    correct: boolean;
    reactionMs: number;
    points: number;
  } | null;
}

export type ArenaStatus = 'idle' | 'countdown' | 'challenge' | 'round_result' | 'game_over';

export interface ReactionArenaState {
  status: ArenaStatus;
  round: number;
  maxRounds: number;
  players: PlayerScore[];
  currentChallenge: ChallengeDef | null;
  challengeStartTime: number;
  timeRemainingMs: number;
  lastMessage: string;
}

const CHALLENGE_POOL: ChallengeType[] = [
  'tap_target',
  'color_match',
  'quick_math',
  'stop_marker',
  'direction_arrow',
  'odd_tile',
];

export function generateChallenge(type: ChallengeType, roundNum: number): ChallengeDef {
  switch (type) {
    case 'color_match': {
      const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
      const hexColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
      const wordIdx = Math.floor(Math.random() * colors.length);
      const isMatch = Math.random() > 0.5;
      const colorIdx = isMatch ? wordIdx : (wordIdx + 1 + Math.floor(Math.random() * 3)) % 4;

      return {
        id: `challenge-${roundNum}`,
        type,
        title: 'Color Sense',
        instructions: 'Does the written WORD match the ink COLOR?',
        durationMs: 3500,
        data: {
          word: colors[wordIdx],
          inkHex: hexColors[colorIdx],
          isMatch,
        },
      };
    }

    case 'quick_math': {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      const actual = a + b;
      const isCorrect = Math.random() > 0.5;
      const shownAnswer = isCorrect ? actual : actual + (Math.random() > 0.5 ? 1 : -1);

      return {
        id: `challenge-${roundNum}`,
        type,
        title: 'Speed Math',
        instructions: 'Is the equation TRUE or FALSE?',
        durationMs: 3000,
        data: {
          equation: `${a} + ${b} = ${shownAnswer}`,
          isCorrect,
        },
      };
    }

    case 'direction_arrow': {
      const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
      const target = directions[Math.floor(Math.random() * directions.length)];

      return {
        id: `challenge-${roundNum}`,
        type,
        title: 'Reflex Arrow',
        instructions: `Hit the ${target} direction instantly!`,
        durationMs: 2800,
        data: {
          targetDirection: target,
        },
      };
    }

    case 'odd_tile': {
      const icons = ['▲', '◆', '●', '■'];
      const baseIcon = icons[Math.floor(Math.random() * icons.length)];
      let oddIcon = icons[(icons.indexOf(baseIcon) + 1) % icons.length];
      if (oddIcon === baseIcon) oddIcon = '★';
      const oddIndex = Math.floor(Math.random() * 9);

      const grid = Array.from({ length: 9 }, (_, i) => (i === oddIndex ? oddIcon : baseIcon));

      return {
        id: `challenge-${roundNum}`,
        type,
        title: 'Find Anomaly',
        instructions: 'Tap the single tile that differs from the rest!',
        durationMs: 3500,
        data: {
          grid,
          oddIndex,
        },
      };
    }

    case 'stop_marker': {
      const sweetSpotMin = 40 + Math.floor(Math.random() * 20);
      const sweetSpotMax = sweetSpotMin + 20;

      return {
        id: `challenge-${roundNum}`,
        type,
        title: 'Target Gauge',
        instructions: 'Stop the oscillating marker in the golden sweet zone!',
        durationMs: 4000,
        data: {
          sweetSpotMin,
          sweetSpotMax,
        },
      };
    }

    case 'tap_target':
    default: {
      const delayMs = 1000 + Math.floor(Math.random() * 1500);

      return {
        id: `challenge-${roundNum}`,
        type: 'tap_target',
        title: 'Lightning Strike',
        instructions: 'Wait for green signal, then strike as fast as possible!',
        durationMs: 3500,
        data: {
          signalDelayMs: delayMs,
        },
      };
    }
  }
}

export function createInitialReactionArenaState(
  players?: { name: string; isAi: boolean }[],
): ReactionArenaState {
  const defaultPlayers = players ?? [
    { name: 'You', isAi: false },
    { name: 'Reflex-Bot', isAi: true },
  ];

  return {
    status: 'idle',
    round: 1,
    maxRounds: 5,
    players: defaultPlayers.map((p, idx) => ({
      playerId: `p-${idx + 1}`,
      name: p.name,
      isAi: p.isAi,
      totalScore: 0,
      reactionTimes: [],
      roundScores: [],
      currentRoundAnswer: null,
    })),
    currentChallenge: null,
    challengeStartTime: 0,
    timeRemainingMs: 0,
    lastMessage: 'Ready your reflexes! 5 lightning-fast mini challenges ahead.',
  };
}

export function startArenaMatch(state: ReactionArenaState): ReactionArenaState {
  const challenge = generateChallenge(CHALLENGE_POOL[0], 1);

  return {
    ...state,
    status: 'challenge',
    round: 1,
    currentChallenge: challenge,
    challengeStartTime: Date.now(),
    timeRemainingMs: challenge.durationMs,
    lastMessage: `Round 1: ${challenge.title}! ${challenge.instructions}`,
    players: state.players.map((p) => ({
      ...p,
      totalScore: 0,
      reactionTimes: [],
      roundScores: [],
      currentRoundAnswer: null,
    })),
  };
}

export function evaluatePlayerResponse(
  state: ReactionArenaState,
  playerId: string,
  answer: unknown,
  reactionMs: number,
): ReactionArenaState {
  if (state.status !== 'challenge' || !state.currentChallenge) {
    return state;
  }

  const playerIdx = state.players.findIndex((p) => p.playerId === playerId);
  if (playerIdx === -1 || state.players[playerIdx].currentRoundAnswer?.answered) {
    return state;
  }

  const ch = state.currentChallenge;
  let correct = false;

  switch (ch.type) {
    case 'color_match': {
      correct = answer === ch.data.isMatch;
      break;
    }
    case 'quick_math': {
      correct = answer === ch.data.isCorrect;
      break;
    }
    case 'direction_arrow': {
      correct = answer === ch.data.targetDirection;
      break;
    }
    case 'odd_tile': {
      correct = answer === ch.data.oddIndex;
      break;
    }
    case 'stop_marker': {
      const val = typeof answer === 'number' ? answer : 0;
      const min = typeof ch.data.sweetSpotMin === 'number' ? ch.data.sweetSpotMin : 40;
      const max = typeof ch.data.sweetSpotMax === 'number' ? ch.data.sweetSpotMax : 60;
      correct = val >= min && val <= max;
      break;
    }
    case 'tap_target': {
      const delay = typeof ch.data.signalDelayMs === 'number' ? ch.data.signalDelayMs : 1000;
      correct = reactionMs >= delay; // False start check
      break;
    }
  }

  // Calculate score: Base 50 for correct + up to 50 speed bonus
  let points = 0;
  if (correct) {
    const speedRatio = Math.max(0, 1 - reactionMs / ch.durationMs);
    points = Math.round(50 + speedRatio * 50);
  }

  const updatedPlayers = state.players.map((p, idx) => {
    if (idx !== playerIdx) return p;
    return {
      ...p,
      totalScore: p.totalScore + points,
      reactionTimes: [...p.reactionTimes, reactionMs],
      roundScores: [...p.roundScores, points],
      currentRoundAnswer: {
        answered: true,
        correct,
        reactionMs,
        points,
      },
    };
  });

  // Check if all players answered
  const allAnswered = updatedPlayers.every((p) => p.currentRoundAnswer?.answered);

  let nextStatus: ArenaStatus = state.status;
  let msg = state.lastMessage;

  if (allAnswered) {
    nextStatus = 'round_result';
    msg = `Round ${state.round} finished!`;
  }

  return {
    ...state,
    players: updatedPlayers,
    status: nextStatus,
    lastMessage: msg,
  };
}

export function nextArenaRound(state: ReactionArenaState): ReactionArenaState {
  if (state.round >= state.maxRounds) {
    return {
      ...state,
      status: 'game_over',
      lastMessage: 'Match complete! Final reflex standings tallied.',
    };
  }

  const nextRoundNum = state.round + 1;
  const challengeType = CHALLENGE_POOL[(nextRoundNum - 1) % CHALLENGE_POOL.length];
  const challenge = generateChallenge(challengeType, nextRoundNum);

  return {
    ...state,
    round: nextRoundNum,
    status: 'challenge',
    currentChallenge: challenge,
    challengeStartTime: Date.now(),
    timeRemainingMs: challenge.durationMs,
    lastMessage: `Round ${nextRoundNum}: ${challenge.title}! ${challenge.instructions}`,
    players: state.players.map((p) => ({
      ...p,
      currentRoundAnswer: null,
    })),
  };
}

/**
 * Generate bot answer with human-like reflex speed distribution.
 */
export function getBotResponse(challenge: ChallengeDef): { answer: unknown; reactionMs: number } {
  // Typical human reflex: 240ms to 480ms + decision overhead
  const baseReaction = 320 + Math.floor(Math.random() * 260);

  switch (challenge.type) {
    case 'color_match':
      return {
        answer: Math.random() < 0.85 ? challenge.data.isMatch : !challenge.data.isMatch,
        reactionMs: baseReaction + 300,
      };
    case 'quick_math':
      return {
        answer: Math.random() < 0.85 ? challenge.data.isCorrect : !challenge.data.isCorrect,
        reactionMs: baseReaction + 400,
      };
    case 'direction_arrow':
      return {
        answer: challenge.data.targetDirection,
        reactionMs: baseReaction + 180,
      };
    case 'odd_tile':
      return {
        answer: challenge.data.oddIndex,
        reactionMs: baseReaction + 450,
      };
    case 'stop_marker': {
      const min =
        typeof challenge.data.sweetSpotMin === 'number' ? challenge.data.sweetSpotMin : 45;
      return {
        answer: min + 5,
        reactionMs: baseReaction + 500,
      };
    }
    case 'tap_target':
    default: {
      const delay =
        typeof challenge.data.signalDelayMs === 'number' ? challenge.data.signalDelayMs : 1200;
      return {
        answer: true,
        reactionMs: delay + baseReaction,
      };
    }
  }
}
