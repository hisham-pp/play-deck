import type {
  GuessTheLieRoundResult,
  GuessTheLieState,
  LiePlayer,
  LiePrompt,
  PromptCategory,
  SubmittedAnswer,
} from '../types/guess-the-lie.types';
import { getRandomPrompt } from './lie-prompts';

export const DEFAULT_ANSWER_TIME = 45;
export const DEFAULT_DISCUSSION_TIME = 60;
export const PTS_CORRECT_GUESS = 100;
export const PTS_FOOLED_PER_PLAYER = 50;
export const PTS_MAJORITY_BLUFF_BONUS = 150;
export const PTS_SUSPICIOUS_TRUTH_BONUS = 25;

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

export function createInitialLieState(params: {
  players: LiePlayer[];
  category?: PromptCategory | 'all';
  prompt?: LiePrompt;
  maxRounds?: number;
  answerDuration?: number;
  discussionDuration?: number;
}): GuessTheLieState {
  const maxRounds = params.maxRounds ?? Math.min(params.players.length, 5);
  const category = params.category ?? 'all';
  const prompt = params.prompt ?? getRandomPrompt(category);
  const answerDuration = params.answerDuration ?? DEFAULT_ANSWER_TIME;
  const discussionDuration = params.discussionDuration ?? DEFAULT_DISCUSSION_TIME;

  // Circular liar rotation sequence
  const roundLiarIndices = params.players.map((_, idx) => idx);
  const currentLiarIndex = roundLiarIndices[0] ?? 0;
  const currentLiar = params.players[currentLiarIndex] ?? params.players[0]!;

  const assignedPlayers = params.players.map((p) => ({
    ...p,
    role: (p.id === currentLiar.id ? 'liar' : 'truth_teller') as LiePlayer['role'],
    hasSubmitted: false,
    votedAnswerId: null,
  }));

  return {
    phase: 'briefing',
    currentRound: 1,
    maxRounds,
    category,
    currentPrompt: prompt,
    liarId: currentLiar.id,
    roundLiarIndices,
    answerDurationSeconds: answerDuration,
    discussionDurationSeconds: discussionDuration,
    phaseStartTime: Date.now(),
    phaseDurationSeconds: 6, // 6 seconds briefing role reveal
    players: assignedPlayers,
    answers: [],
    roundResult: null,
  };
}

export function registerAnswer(
  state: GuessTheLieState,
  author: LiePlayer,
  text: string,
): GuessTheLieState {
  const isLie = author.id === state.liarId;
  const newAnswer: SubmittedAnswer = {
    id: `ans-${author.id}`,
    authorId: author.id,
    authorName: author.displayName,
    authorAvatar: author.avatar,
    text: text.trim(),
    isLie,
    votesReceived: [],
  };

  const existingIdx = state.answers.findIndex((a) => a.authorId === author.id);
  const nextAnswers =
    existingIdx >= 0
      ? state.answers.map((a, idx) => (idx === existingIdx ? newAnswer : a))
      : [...state.answers, newAnswer];

  const updatedPlayers = state.players.map((p) =>
    p.id === author.id ? { ...p, hasSubmitted: true } : p,
  );

  return {
    ...state,
    players: updatedPlayers,
    answers: nextAnswers,
  };
}

export function recordVote(
  state: GuessTheLieState,
  voterId: string,
  answerId: string,
): GuessTheLieState {
  // Update voter player
  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedAnswerId: answerId } : p,
  );

  // Update answer votes received list
  const updatedAnswers = state.answers.map((a) => {
    const withoutVoter = a.votesReceived.filter((id) => id !== voterId);
    if (a.id === answerId) {
      return { ...a, votesReceived: [...withoutVoter, voterId] };
    }
    return { ...a, votesReceived: withoutVoter };
  });

  return {
    ...state,
    players: updatedPlayers,
    answers: updatedAnswers,
  };
}

export function calculateRoundScores(state: GuessTheLieState): {
  updatedPlayers: LiePlayer[];
  roundResult: GuessTheLieRoundResult;
} {
  const lieAnswer = state.answers.find((a) => a.isLie);
  const lieAnswerId = lieAnswer?.id ?? '';
  const liarPlayer = state.players.find((p) => p.id === state.liarId);

  const guesserCount = state.players.filter((p) => p.id !== state.liarId).length;
  const correctGuesserIds: string[] = [];
  const fooledGuesserIds: string[] = [];
  const pointsEarned: Record<string, number> = {};

  // Initialize 0 points for everyone
  for (const p of state.players) {
    pointsEarned[p.id] = 0;
  }

  // Tally votes from guessers
  for (const player of state.players) {
    if (player.id === state.liarId) continue; // Liar doesn't guess

    if (player.votedAnswerId === lieAnswerId) {
      correctGuesserIds.push(player.id);
      pointsEarned[player.id] = (pointsEarned[player.id] ?? 0) + PTS_CORRECT_GUESS;
    } else if (player.votedAnswerId) {
      fooledGuesserIds.push(player.id);

      // Reward innocent author who wrote a suspiciously convincing truth
      const wronglyAccusedAnswer = state.answers.find((a) => a.id === player.votedAnswerId);
      if (wronglyAccusedAnswer && wronglyAccusedAnswer.authorId !== state.liarId) {
        const authorId = wronglyAccusedAnswer.authorId;
        pointsEarned[authorId] = (pointsEarned[authorId] ?? 0) + PTS_SUSPICIOUS_TRUTH_BONUS;
      }
    }
  }

  // Calculate Liar score
  const fooledCount = fooledGuesserIds.length;
  let liarTotal = fooledCount * PTS_FOOLED_PER_PLAYER;
  let liarBonus = 0;

  // Majority bonus: fooled more than 50% of the guessers
  if (guesserCount > 0 && fooledCount > guesserCount / 2) {
    liarBonus = PTS_MAJORITY_BLUFF_BONUS;
    liarTotal += liarBonus;
  }

  pointsEarned[state.liarId] = (pointsEarned[state.liarId] ?? 0) + liarTotal;

  // Update players with cumulative scores
  const updatedPlayers = state.players.map((p) => {
    const gained = pointsEarned[p.id] ?? 0;
    return {
      ...p,
      score: p.score + gained,
    };
  });

  const roundResult: GuessTheLieRoundResult = {
    liarId: state.liarId,
    liarName: liarPlayer?.displayName ?? 'The Liar',
    lieAnswerId,
    correctGuesserIds,
    fooledGuesserIds,
    liarFooledBonus: liarBonus,
    playerPointsEarned: pointsEarned,
  };

  return { updatedPlayers, roundResult };
}

export function advanceRound(state: GuessTheLieState, nextPrompt: LiePrompt): GuessTheLieState {
  const nextRoundNum = state.currentRound + 1;
  const currentIdx = state.players.findIndex((p) => p.id === state.liarId);
  const nextIdx = (currentIdx + 1) % state.players.length;
  const nextLiar = state.players[nextIdx] ?? state.players[0]!;

  const updatedPlayers = state.players.map((p) => ({
    ...p,
    role: (p.id === nextLiar.id ? 'liar' : 'truth_teller') as LiePlayer['role'],
    hasSubmitted: false,
    votedAnswerId: null,
  }));

  return {
    ...state,
    phase: 'briefing',
    currentRound: nextRoundNum,
    currentPrompt: nextPrompt,
    liarId: nextLiar.id,
    phaseStartTime: Date.now(),
    phaseDurationSeconds: 6,
    players: updatedPlayers,
    answers: [],
    roundResult: null,
  };
}
