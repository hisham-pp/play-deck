import type {
  TelephoneChainStep,
  TelephoneGameOptions,
  TelephonePlayer,
  TelephoneRoundResult,
  TelephoneState,
  TelephoneStepType,
} from '../types/telephone-drawing.types';
import { getRandomTelephonePrompt } from './telephone-prompts';

export const DEFAULT_OPTIONS: TelephoneGameOptions = {
  drawTimeLimit: 60,
  describeTimeLimit: 40,
};

export const VOTE_POINTS = 100;
export const CROWD_FAVORITE_BONUS = 200;
export const ACCURACY_BONUS = 150;

export function getStepTypeForIndex(index: number): TelephoneStepType {
  // Even steps (0, 2, 4...) are DRAWING steps
  // Odd steps (1, 3, 5...) are DESCRIBING steps
  return index % 2 === 0 ? 'draw' : 'describe';
}

export function createInitialState(
  players: TelephonePlayer[],
  initialPhrase?: string,
  options: Partial<TelephoneGameOptions> = {},
): TelephoneState {
  const mergedOptions: TelephoneGameOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const phrase = initialPhrase ?? getRandomTelephonePrompt();
  const firstPlayer = players[0];

  return {
    phase: 'turn',
    initialPhrase: phrase,
    currentStepIndex: 0,
    totalSteps: players.length,
    steps: [],
    players: players.map((p) => ({
      ...p,
      score: 0,
      votedStepIndex: null,
      awardsReceived: [],
    })),
    activePlayerId: firstPlayer ? firstPlayer.id : '',
    timeRemaining: mergedOptions.drawTimeLimit,
    revealIndex: 0,
    options: mergedOptions,
    roundResult: null,
  };
}

export function submitDrawingStep(
  state: TelephoneState,
  playerId: string,
  drawingData: string,
): TelephoneState {
  if (state.phase !== 'turn') return state;
  if (state.activePlayerId !== playerId) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const newStep: TelephoneChainStep = {
    stepIndex: state.currentStepIndex,
    type: 'draw',
    authorId: player.id,
    authorName: player.displayName,
    authorAvatar: player.avatar,
    drawingData,
    votesReceived: 0,
    voterIds: [],
  };

  const nextStepIndex = state.currentStepIndex + 1;
  const updatedSteps = [...state.steps, newStep];

  if (nextStepIndex >= state.totalSteps) {
    return {
      ...state,
      steps: updatedSteps,
      phase: 'reveal',
      revealIndex: 0,
    };
  }

  const nextPlayer = state.players[nextStepIndex % state.players.length]!;
  const nextType = getStepTypeForIndex(nextStepIndex);

  return {
    ...state,
    steps: updatedSteps,
    currentStepIndex: nextStepIndex,
    activePlayerId: nextPlayer.id,
    timeRemaining:
      nextType === 'draw' ? state.options.drawTimeLimit : state.options.describeTimeLimit,
  };
}

export function submitDescriptionStep(
  state: TelephoneState,
  playerId: string,
  rawText: string,
): TelephoneState {
  if (state.phase !== 'turn') return state;
  if (state.activePlayerId !== playerId) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const text = rawText.trim() || 'A completely mysterious doodle';

  const newStep: TelephoneChainStep = {
    stepIndex: state.currentStepIndex,
    type: 'describe',
    authorId: player.id,
    authorName: player.displayName,
    authorAvatar: player.avatar,
    description: text,
    votesReceived: 0,
    voterIds: [],
  };

  const nextStepIndex = state.currentStepIndex + 1;
  const updatedSteps = [...state.steps, newStep];

  if (nextStepIndex >= state.totalSteps) {
    return {
      ...state,
      steps: updatedSteps,
      phase: 'reveal',
      revealIndex: 0,
    };
  }

  const nextPlayer = state.players[nextStepIndex % state.players.length]!;
  const nextType = getStepTypeForIndex(nextStepIndex);

  return {
    ...state,
    steps: updatedSteps,
    currentStepIndex: nextStepIndex,
    activePlayerId: nextPlayer.id,
    timeRemaining:
      nextType === 'draw' ? state.options.drawTimeLimit : state.options.describeTimeLimit,
  };
}

export function advanceReveal(state: TelephoneState): TelephoneState {
  if (state.phase !== 'reveal') return state;

  // Reveal index: 0 = initial phrase, 1..N = chain steps
  const nextReveal = state.revealIndex + 1;
  if (nextReveal > state.steps.length) {
    return {
      ...state,
      phase: 'voting',
    };
  }

  return {
    ...state,
    revealIndex: nextReveal,
  };
}

export function castMutationVote(
  state: TelephoneState,
  voterId: string,
  stepIndex: number,
): TelephoneState {
  if (state.phase !== 'voting') return state;

  const targetStep = state.steps.find((s) => s.stepIndex === stepIndex);
  if (!targetStep) return state;

  // Cannot vote for your own step
  if (targetStep.authorId === voterId) return state;

  const updatedSteps = state.steps.map((s) => {
    const withoutMyVote = s.voterIds.filter((id) => id !== voterId);
    if (s.stepIndex === stepIndex) {
      return {
        ...s,
        voterIds: [...withoutMyVote, voterId],
        votesReceived: withoutMyVote.length + 1,
      };
    }
    return {
      ...s,
      voterIds: withoutMyVote,
      votesReceived: withoutMyVote.length,
    };
  });

  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedStepIndex: stepIndex } : p,
  );

  return {
    ...state,
    steps: updatedSteps,
    players: updatedPlayers,
  };
}

export function tallyFinalScores(state: TelephoneState): TelephoneState {
  const maxVotes = Math.max(0, ...state.steps.map((s) => s.votesReceived));
  const winningSteps = maxVotes > 0 ? state.steps.filter((s) => s.votesReceived === maxVotes) : [];

  const winningAuthorIds = new Set(winningSteps.map((s) => s.authorId));

  // Determine accuracy match: check if words from initial phrase exist in final description
  const finalStep = state.steps[state.steps.length - 1];
  const finalDesc = finalStep?.description?.toLowerCase() ?? '';
  const initialWords = state.initialPhrase
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const matchedWords = initialWords.filter((w) => finalDesc.includes(w));
  const isAccurate = matchedWords.length >= 2;

  const updatedPlayers = state.players.map((p) => {
    let earnedPoints = 0;
    const awards: string[] = [];

    // Points from votes on any step created by player
    for (const step of state.steps) {
      if (step.authorId === p.id) {
        earnedPoints += step.votesReceived * VOTE_POINTS;
      }
    }

    if (winningAuthorIds.has(p.id)) {
      earnedPoints += CROWD_FAVORITE_BONUS;
      awards.push('Funniest Mutation');
    }

    if (isAccurate && finalStep?.authorId === p.id) {
      earnedPoints += ACCURACY_BONUS;
      awards.push('Accuracy Master');
    }

    // Award best artist if drawing step got most votes
    const topDrawing = state.steps
      .filter((s) => s.type === 'draw')
      .sort((a, b) => b.votesReceived - a.votesReceived)[0];

    if (topDrawing && topDrawing.authorId === p.id && topDrawing.votesReceived > 0) {
      awards.push('Master Doodler');
    }

    return {
      ...p,
      score: p.score + earnedPoints,
      awardsReceived: awards,
    };
  });

  const roundResult: TelephoneRoundResult = {
    initialPhrase: state.initialPhrase,
    finalDescription: finalStep?.description,
    mostMutatedStepIndex: winningSteps[0]?.stepIndex,
    bestArtistId: state.steps.find((s) => s.type === 'draw')?.authorId,
  };

  return {
    ...state,
    phase: 'game-over',
    players: updatedPlayers,
    roundResult,
  };
}
