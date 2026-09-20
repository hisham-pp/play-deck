import type { QAEntry, SpyNetworkPlayer, SpyNetworkState } from '../types/spy-network.types';
import { getRandomLocation } from './locations-database';

const QA_DURATION = 30;
const DISCUSSION_DURATION = 60;
const SPY_CAUGHT_POINTS = 200;
const SPY_SURVIVES_POINTS = 300;
const SPY_CORRECT_GUESS_BONUS = 150;
const CORRECT_VOTE_POINTS = 100;

export function createInitialState(
  players: Array<{
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
    isBot: boolean;
  }>,
  maxRounds = 3,
): SpyNetworkState {
  const spyIndex = Math.floor(Math.random() * players.length);
  const location = getRandomLocation();

  const gamePlayers: SpyNetworkPlayer[] = players.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    isSpy: idx === spyIndex,
    votedForId: null,
    score: 0,
    isEliminated: false,
  }));

  const firstQuestioner = gamePlayers[0]!;
  const secondPlayer = gamePlayers[1] ?? gamePlayers[0]!;

  return {
    phase: 'qa',
    players: gamePlayers,
    location,
    qaLog: [],
    currentQuestionerId: firstQuestioner.id,
    currentRespondentId: secondPlayer.id,
    roundNumber: 1,
    maxRounds,
    spyGuessResult: null,
    spyGuessedLocation: null,
    timeRemaining: QA_DURATION,
  };
}

export function submitQA(
  state: SpyNetworkState,
  questionerId: string,
  respondentId: string,
  question: string,
  answer: string,
): SpyNetworkState {
  if (state.phase !== 'qa') return state;

  const questioner = state.players.find((p) => p.id === questionerId);
  const respondent = state.players.find((p) => p.id === respondentId);
  if (!questioner || !respondent) return state;

  const entry: QAEntry = {
    id: `qa-${Date.now()}`,
    questionerId,
    questionerName: questioner.displayName,
    respondentId,
    respondentName: respondent.displayName,
    question: question.trim(),
    answer: answer.trim(),
  };

  const totalPlayers = state.players.length;
  const nextQuestioner = state.players[(state.players.indexOf(questioner) + 1) % totalPlayers]!;
  const nextRespondent = state.players[(state.players.indexOf(nextQuestioner) + 1) % totalPlayers]!;

  const isEndOfRound = nextQuestioner.id === state.players[0]!.id && state.qaLog.length > 0;

  return {
    ...state,
    qaLog: [...state.qaLog, entry],
    phase: isEndOfRound ? 'discussion' : 'qa',
    currentQuestionerId: nextQuestioner.id,
    currentRespondentId: nextRespondent.id,
    timeRemaining: isEndOfRound ? DISCUSSION_DURATION : QA_DURATION,
  };
}

export function castVote(
  state: SpyNetworkState,
  voterId: string,
  suspectId: string,
): SpyNetworkState {
  if (state.phase !== 'voting') return state;

  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedForId: suspectId } : p,
  );

  const allVoted = updatedPlayers
    .filter((p) => !p.isSpy || true)
    .every((p) => p.votedForId !== null);

  return {
    ...state,
    players: updatedPlayers,
    phase: allVoted ? 'reveal' : 'voting',
  };
}

export function startVoting(state: SpyNetworkState): SpyNetworkState {
  if (state.phase !== 'discussion') return state;
  return { ...state, phase: 'voting' };
}

export function spyGuessLocation(
  state: SpyNetworkState,
  spyId: string,
  guessedLocation: string,
): SpyNetworkState {
  const spy = state.players.find((p) => p.id === spyId && p.isSpy);
  if (!spy || state.phase !== 'reveal') return state;

  const isCorrect = guessedLocation.trim().toLowerCase() === (state.location ?? '').toLowerCase();
  return {
    ...state,
    spyGuessResult: isCorrect ? 'correct' : 'wrong',
    spyGuessedLocation: guessedLocation.trim(),
  };
}

export function tallyFinalScores(state: SpyNetworkState): SpyNetworkState {
  const spy = state.players.find((p) => p.isSpy);
  if (!spy) return { ...state, phase: 'game-over' };

  const votesAgainstSpy = state.players.filter((p) => p.votedForId === spy.id).length;
  const majorityVoted = votesAgainstSpy > state.players.length / 2;

  const updatedPlayers = state.players.map((p) => {
    if (p.isSpy) {
      let score = p.score;
      if (!majorityVoted) score += SPY_SURVIVES_POINTS;
      if (state.spyGuessResult === 'correct') score += SPY_CORRECT_GUESS_BONUS;
      return { ...p, score };
    }
    if (p.votedForId === spy.id) {
      return { ...p, score: p.score + CORRECT_VOTE_POINTS };
    }
    if (majorityVoted) {
      return { ...p, score: Math.max(0, p.score + SPY_CAUGHT_POINTS) };
    }
    return p;
  });

  return { ...state, phase: 'game-over', players: updatedPlayers };
}
