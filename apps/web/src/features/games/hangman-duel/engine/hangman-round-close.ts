import type { HangmanState } from '../types/hangman-duel.types';
import { getRandomWord } from './hangman-bank';
import {
  MODE_SOLO,
  POINTS_FOR_SOLVE,
  POINTS_PER_SPARE_MISS,
  SETTER_DEFENCE_POINTS,
  SETTER_POINTS_PER_HIDDEN_LETTER,
  STATUS_FINISHED,
  STATUS_ROUND_OVER,
  STATUS_WORD_SELECT,
} from './hangman-constants';
import {
  createInitialBoards,
  getNextGuesserIndex,
  getPlayerBoard,
  startRound,
} from './hangman-state';

export function completeRoundSolved(state: HangmanState, solverId: string): void {
  state.status = STATUS_ROUND_OVER;
  const solver = state.players.find((p) => p.id === solverId);
  const board = getPlayerBoard(state, solverId);

  const spareMisses = Math.max(0, state.rules.allowedMisses - board.wrongCount);
  const bonus = POINTS_FOR_SOLVE + spareMisses * POINTS_PER_SPARE_MISS;

  const awarded: Record<string, number> = {};
  if (solver) {
    solver.score += bonus;
    solver.roundsWon++;
    solver.wordsSolved++;
    awarded[solver.id] = bonus;
  }

  state.roundOutcome = {
    word: state.secret,
    category: state.category,
    setterId: state.setterIndex >= 0 ? (state.players[state.setterIndex]?.id ?? null) : null,
    setterName: state.setterIndex >= 0 ? (state.players[state.setterIndex]?.name ?? null) : null,
    solvedById: solver?.id ?? null,
    solvedByName: solver?.name ?? null,
    unrevealed: 0,
    awarded,
  };

  state.message = solver
    ? `🎉 ${solver.name} solved the word "${state.secret.toUpperCase()}"! (+${bonus} pts)`
    : `Round over! Word was "${state.secret.toUpperCase()}".`;
}

export function checkAllBoardsOut(state: HangmanState): void {
  const allBoards = Object.values(state.boards);
  const allLost = allBoards.every((b) => b.out);
  if (!allLost) return;

  state.status = STATUS_ROUND_OVER;
  const setter = state.setterIndex >= 0 ? state.players[state.setterIndex] : null;

  const primaryBoard = allBoards[0]!;
  const unrevealed = state.secret
    .split('')
    .filter((c) => !primaryBoard.guessedLetters.includes(c)).length;

  const awarded: Record<string, number> = {};
  if (setter) {
    const setterReward = SETTER_DEFENCE_POINTS + unrevealed * SETTER_POINTS_PER_HIDDEN_LETTER;
    setter.score += setterReward;
    setter.roundsDefended++;
    awarded[setter.id] = setterReward;
    state.message = `🛡️ Word defended! ${setter.name} earned ${setterReward} points for stumpers.`;
  } else {
    state.message = `Round over! The secret word was "${state.secret.toUpperCase()}".`;
  }

  state.roundOutcome = {
    word: state.secret,
    category: state.category,
    setterId: setter?.id ?? null,
    setterName: setter?.name ?? null,
    solvedById: null,
    solvedByName: null,
    unrevealed,
    awarded,
  };
}

export function proceedToNextRound(state: HangmanState, rng: () => number = Math.random): void {
  if (state.round >= state.rules.totalRounds) {
    state.status = STATUS_FINISHED;
    const highestScore = Math.max(...state.players.map((p) => p.score));
    state.winnerIds = state.players.filter((p) => p.score === highestScore).map((p) => p.id);
    state.message = 'Match finished! Check the final podium.';
    return;
  }

  state.round++;
  const isSolo = state.rules.mode === MODE_SOLO;

  if (isSolo) {
    const bankWord = getRandomWord(state.rules.category, state.rules.difficulty, rng);
    startRound(state, bankWord.word, bankWord.category);
  } else {
    state.setterIndex = (state.setterIndex + 1) % state.players.length;
    state.turnIndex = getNextGuesserIndex(state.players, state.setterIndex, state.setterIndex);
    state.status = STATUS_WORD_SELECT;
    state.secret = '';
    state.boards = createInitialBoards(state.rules, state.players);
    state.message = `${state.players[state.setterIndex]?.name || 'Next player'} is selecting a word...`;
  }
}
