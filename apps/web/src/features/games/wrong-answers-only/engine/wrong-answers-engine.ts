import type {
  PlayerRoundScore,
  SubmittedWrongAnswer,
  WrongAnswersGameOptions,
  WrongAnswersPlayer,
  WrongAnswersQuestion,
  WrongAnswersRoundResult,
  WrongAnswersState,
} from '../types/wrong-answers.types';
import { getRandomQuestion } from './wrong-answers-prompts';

export const DEFAULT_OPTIONS: WrongAnswersGameOptions = {
  totalRounds: 3,
  answerTimeLimit: 45,
  votingTimeLimit: 30,
};

export const VOTE_POINTS = 1;
export const MOST_VOTED_BONUS = 3;
export const STREAK_BONUS = 2;

export function createInitialState(
  players: WrongAnswersPlayer[],
  options: Partial<WrongAnswersGameOptions> = {},
): WrongAnswersState {
  const mergedOptions: WrongAnswersGameOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const initialQuestion = getRandomQuestion();

  return {
    phase: 'answering',
    currentRound: 1,
    totalRounds: mergedOptions.totalRounds,
    currentQuestion: initialQuestion,
    answers: [],
    players: players.map((p) => ({
      ...p,
      score: 0,
      streak: 0,
      hasSubmitted: false,
      votedAnswerId: null,
      awardsReceived: [],
    })),
    timeRemaining: mergedOptions.answerTimeLimit,
    roundResult: null,
    history: [],
    options: mergedOptions,
  };
}

export function submitAnswer(
  state: WrongAnswersState,
  authorId: string,
  rawText: string,
): WrongAnswersState {
  const player = state.players.find((p) => p.id === authorId);
  if (!player) return state;

  const trimmedText = rawText.trim();
  if (!trimmedText) return state;

  const existingIndex = state.answers.findIndex((a) => a.authorId === authorId);
  let updatedAnswers: SubmittedWrongAnswer[];

  if (existingIndex >= 0) {
    updatedAnswers = state.answers.map((a, i) =>
      i === existingIndex ? { ...a, text: trimmedText } : a,
    );
  } else {
    const newAnswer: SubmittedWrongAnswer = {
      id: `ans-${authorId}-${state.currentRound}`,
      authorId: player.id,
      authorName: player.displayName,
      authorAvatar: player.avatar,
      text: trimmedText,
      voteCount: 0,
      voterIds: [],
    };
    updatedAnswers = [...state.answers, newAnswer];
  }

  const updatedPlayers = state.players.map((p) =>
    p.id === authorId ? { ...p, hasSubmitted: true } : p,
  );

  return {
    ...state,
    answers: updatedAnswers,
    players: updatedPlayers,
  };
}

export function castVote(
  state: WrongAnswersState,
  voterId: string,
  answerId: string,
): WrongAnswersState {
  const answer = state.answers.find((a) => a.id === answerId);
  if (!answer) return state;

  // Cannot vote for your own answer
  if (answer.authorId === voterId) return state;

  const voter = state.players.find((p) => p.id === voterId);
  if (!voter) return state;

  // Update answers: remove previous vote by voterId if any, add to this answer
  const updatedAnswers = state.answers.map((a) => {
    const withoutMyVote = a.voterIds.filter((id) => id !== voterId);
    if (a.id === answerId) {
      return {
        ...a,
        voterIds: [...withoutMyVote, voterId],
        voteCount: withoutMyVote.length + 1,
      };
    }
    return {
      ...a,
      voterIds: withoutMyVote,
      voteCount: withoutMyVote.length,
    };
  });

  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedAnswerId: answerId } : p,
  );

  return {
    ...state,
    answers: updatedAnswers,
    players: updatedPlayers,
  };
}

export function tallyVotesAndScore(state: WrongAnswersState): WrongAnswersState {
  const maxVotes = Math.max(0, ...state.answers.map((a) => a.voteCount));
  const winningAnswerIds =
    maxVotes > 0 ? state.answers.filter((a) => a.voteCount === maxVotes).map((a) => a.id) : [];

  const winningAuthors = new Set(
    state.answers.filter((a) => winningAnswerIds.includes(a.id)).map((a) => a.authorId),
  );

  const roundLeaderboard: PlayerRoundScore[] = state.players.map((p) => {
    const playerAnswer = state.answers.find((a) => a.authorId === p.id);
    const votesEarned = playerAnswer ? playerAnswer.voteCount * VOTE_POINTS : 0;
    const isWinner = winningAuthors.has(p.id);
    const bonusPoints = isWinner ? MOST_VOTED_BONUS : 0;
    const nextStreak = isWinner ? p.streak + 1 : 0;
    const streakBonus = isWinner && nextStreak >= 2 ? STREAK_BONUS : 0;
    const totalRoundPoints = votesEarned + bonusPoints + streakBonus;

    return {
      playerId: p.id,
      votesEarned,
      bonusPoints,
      streakBonus,
      totalRoundPoints,
    };
  });

  const updatedPlayers = state.players.map((p) => {
    const roundScore = roundLeaderboard.find((s) => s.playerId === p.id);
    if (!roundScore) return p;

    const isWinner = winningAuthors.has(p.id);
    const newStreak = isWinner ? p.streak + 1 : 0;
    const newScore = p.score + roundScore.totalRoundPoints;

    const awards = [...p.awardsReceived];
    if (isWinner && !awards.includes('Crowd Favorite')) {
      awards.push('Crowd Favorite');
    }
    if (roundScore.streakBonus > 0 && !awards.includes('On Fire')) {
      awards.push('On Fire');
    }

    return {
      ...p,
      score: newScore,
      streak: newStreak,
      awardsReceived: awards,
    };
  });

  const bestAnswer = state.answers.find((a) => winningAnswerIds.includes(a.id));

  const roundResult: WrongAnswersRoundResult = {
    roundNumber: state.currentRound,
    questionId: state.currentQuestion.id,
    winningAnswerIds,
    mostVotedText: bestAnswer?.text ?? 'No answers submitted',
    roundLeaderboard,
  };

  return {
    ...state,
    phase: 'reveal',
    players: updatedPlayers,
    roundResult,
    history: [...state.history, roundResult],
  };
}

export function advanceToNextRound(
  state: WrongAnswersState,
  forcedQuestion?: WrongAnswersQuestion,
): WrongAnswersState {
  if (state.currentRound >= state.totalRounds) {
    return {
      ...state,
      phase: 'game-over',
    };
  }

  const usedQuestionIds = [...state.history.map((h) => h.questionId), state.currentQuestion.id];
  const nextQuestion = forcedQuestion ?? getRandomQuestion(usedQuestionIds);

  const resetPlayers = state.players.map((p) => ({
    ...p,
    hasSubmitted: false,
    votedAnswerId: null,
  }));

  return {
    ...state,
    phase: 'answering',
    currentRound: state.currentRound + 1,
    currentQuestion: nextQuestion,
    answers: [],
    players: resetPlayers,
    timeRemaining: state.options.answerTimeLimit,
    roundResult: null,
  };
}
