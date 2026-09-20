import type {
  IdentityCategory,
  QALogEntry,
  VoteAnswer,
  WhoAmIPlayer,
  WhoAmIState,
} from '../types/who-am-i.types';
import { getIdentitiesForCategory } from './identities-database';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function createInitialState(
  players: Array<{
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
    isBot: boolean;
  }>,
  category: IdentityCategory = 'all',
  maxRounds = 5,
): WhoAmIState {
  const pool = shuffle(getIdentitiesForCategory(category));

  const gamePlayers: WhoAmIPlayer[] = players.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    identity: pool[idx % pool.length]!,
    isSolved: false,
    solvedAtStep: null,
    score: 0,
    questionsAsked: 0,
    wrongGuesses: 0,
    awardsReceived: [],
  }));

  const firstPlayer = gamePlayers[0]!;

  return {
    phase: 'questioning',
    category,
    currentTurnPlayerId: firstPlayer.id,
    turnIndex: 0,
    roundNumber: 1,
    maxRounds,
    players: gamePlayers,
    currentQuestion: null,
    qaLog: [],
    timeRemaining: 45,
    isLastGuessCorrect: null,
  };
}

export function askQuestion(state: WhoAmIState, questionText: string): WhoAmIState {
  if (state.phase !== 'questioning') return state;

  const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
  if (!activePlayer) return state;

  const newLogEntry: QALogEntry = {
    id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    roundNumber: state.roundNumber,
    questionerId: activePlayer.id,
    questionerName: activePlayer.displayName,
    questionText: questionText.trim(),
    yesVotes: [],
    noVotes: [],
    maybeVotes: [],
  };

  const updatedPlayers = state.players.map((p) =>
    p.id === activePlayer.id ? { ...p, questionsAsked: p.questionsAsked + 1 } : p,
  );

  return {
    ...state,
    phase: 'answering',
    currentQuestion: questionText.trim(),
    players: updatedPlayers,
    qaLog: [newLogEntry, ...state.qaLog],
    timeRemaining: 25,
  };
}

export function answerQuestion(
  state: WhoAmIState,
  respondentId: string,
  answer: VoteAnswer,
): WhoAmIState {
  if (state.phase !== 'answering' || state.qaLog.length === 0) return state;

  // Active questioner cannot answer their own question
  if (respondentId === state.currentTurnPlayerId) return state;

  const currentLog = state.qaLog[0]!;
  const withoutRespondent = (list: string[]) => list.filter((id) => id !== respondentId);

  let yes = withoutRespondent(currentLog.yesVotes);
  let no = withoutRespondent(currentLog.noVotes);
  let maybe = withoutRespondent(currentLog.maybeVotes);

  if (answer === 'yes') yes = [...yes, respondentId];
  else if (answer === 'no') no = [...no, respondentId];
  else maybe = [...maybe, respondentId];

  const updatedLog: QALogEntry = {
    ...currentLog,
    yesVotes: yes,
    noVotes: no,
    maybeVotes: maybe,
  };

  const totalOtherPlayers = state.players.length - 1;
  const totalVotesCast = yes.length + no.length + maybe.length;
  const allAnswered = totalVotesCast >= totalOtherPlayers;

  return {
    ...state,
    qaLog: [updatedLog, ...state.qaLog.slice(1)],
    phase: allAnswered ? 'guessing' : 'answering',
    timeRemaining: allAnswered ? 30 : state.timeRemaining,
  };
}

export function proceedToGuessing(state: WhoAmIState): WhoAmIState {
  if (state.phase !== 'answering') return state;
  return {
    ...state,
    phase: 'guessing',
    timeRemaining: 30,
  };
}

export function isGuessMatch(guessText: string, targetName: string): boolean {
  const g = guessText
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const t = targetName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (!g || !t) return false;
  return g === t || t.includes(g) || g.includes(t);
}

export function submitGuess(state: WhoAmIState, playerId: string, guessText: string): WhoAmIState {
  if (state.phase !== 'guessing' && state.phase !== 'questioning') return state;
  if (state.currentTurnPlayerId !== playerId) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isSolved) return state;

  const isCorrect = isGuessMatch(guessText, player.identity.name);

  // Update latest Q&A log entry with guess result
  const latestLog = state.qaLog[0];
  const updatedQaLog = latestLog
    ? [
        { ...latestLog, finalGuess: guessText.trim(), wasCorrect: isCorrect },
        ...state.qaLog.slice(1),
      ]
    : state.qaLog;

  let pointsDelta = 0;
  if (isCorrect) {
    pointsDelta = Math.max(100, 500 - player.questionsAsked * 30 - player.wrongGuesses * 40);
  } else {
    pointsDelta = -30;
  }

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      isSolved: isCorrect ? true : p.isSolved,
      solvedAtStep: isCorrect ? state.turnIndex + 1 : p.solvedAtStep,
      score: Math.max(0, p.score + pointsDelta),
      wrongGuesses: isCorrect ? p.wrongGuesses : p.wrongGuesses + 1,
      awardsReceived: isCorrect ? [...p.awardsReceived, 'Solved!'] : p.awardsReceived,
    };
  });

  return advanceToNextTurn({
    ...state,
    players: updatedPlayers,
    qaLog: updatedQaLog,
    isLastGuessCorrect: isCorrect,
  });
}

export function passTurn(state: WhoAmIState, playerId: string): WhoAmIState {
  if (state.currentTurnPlayerId !== playerId) return state;
  return advanceToNextTurn(state);
}

export function advanceToNextTurn(state: WhoAmIState): WhoAmIState {
  const unsolvedPlayers = state.players.filter((p) => !p.isSolved);

  // If everyone solved their identity, trigger game-over!
  if (unsolvedPlayers.length === 0) {
    return tallyFinalScores({
      ...state,
      phase: 'game-over',
      currentQuestion: null,
    });
  }

  const currentIdx = state.players.findIndex((p) => p.id === state.currentTurnPlayerId);
  const total = state.players.length;

  let nextIdx = (currentIdx + 1) % total;
  let stepsCount = 0;

  // Find next unsolved player
  while (state.players[nextIdx]!.isSolved && stepsCount < total) {
    nextIdx = (nextIdx + 1) % total;
    stepsCount++;
  }

  // Check round progression
  const isNewRound = nextIdx <= currentIdx;
  const nextRoundNumber = isNewRound ? state.roundNumber + 1 : state.roundNumber;

  if (nextRoundNumber > state.maxRounds) {
    return tallyFinalScores({
      ...state,
      phase: 'game-over',
      currentQuestion: null,
    });
  }

  return {
    ...state,
    phase: 'questioning',
    currentTurnPlayerId: state.players[nextIdx]!.id,
    turnIndex: state.turnIndex + 1,
    roundNumber: nextRoundNumber,
    currentQuestion: null,
    timeRemaining: 45,
  };
}

export function tallyFinalScores(state: WhoAmIState): WhoAmIState {
  const solved = state.players.filter((p) => p.isSolved);

  // Detective of the Year: player with fewest questions among solved
  let detectiveId: string | null = null;
  if (solved.length > 0) {
    const sortedByQuestions = [...solved].sort((a, b) => a.questionsAsked - b.questionsAsked);
    detectiveId = sortedByQuestions[0]!.id;
  }

  const updatedPlayers = state.players.map((p) => {
    let bonus = 0;
    const awards = [...p.awardsReceived];
    if (detectiveId && p.id === detectiveId) {
      bonus += 150;
      awards.push('Master Detective (+150 pts)');
    }
    return {
      ...p,
      score: p.score + bonus,
      awardsReceived: awards,
    };
  });

  return {
    ...state,
    phase: 'game-over',
    players: updatedPlayers,
  };
}
