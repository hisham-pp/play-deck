import type { HangmanRejection, HangmanState } from '../types/hangman-duel.types';
import {
  ALPHABET,
  MODE_BATTLE,
  MODE_SOLO,
  MODE_SPEED,
  PENALTY_WRONG_LETTER,
  PENALTY_WRONG_SOLVE,
  POINTS_PER_CORRECT_LETTER,
  POINTS_PER_EXTRA_OCCURRENCE,
  SPEED_BONUS_POINTS,
  SPEED_BONUS_THRESHOLD,
  STATUS_GUESSING,
} from './hangman-constants';
import { checkAllBoardsOut, completeRoundSolved, proceedToNextRound } from './hangman-round-close';
import {
  createEmptyBoard,
  createInitialBoards,
  createInitialState,
  getMaskedWord,
  getNextGuesserIndex,
  getPlayerBoard,
  isBoardSolved,
  startRound,
} from './hangman-state';

export {
  createEmptyBoard,
  createInitialBoards,
  createInitialState,
  getMaskedWord,
  getNextGuesserIndex,
  getPlayerBoard,
  isBoardSolved,
  startRound,
  completeRoundSolved,
  checkAllBoardsOut,
  proceedToNextRound,
};

interface LetterGuessValidation {
  valid: boolean;
  letter: string;
  rejection: HangmanRejection | null;
}

function validateLetterGuess(
  state: HangmanState,
  playerId: string,
  rawLetter: string,
): LetterGuessValidation {
  const invalid = (rejection: HangmanRejection | null): LetterGuessValidation => ({
    valid: false,
    letter: '',
    rejection,
  });

  if (state.status !== STATUS_GUESSING) return invalid(null);

  const letter = rawLetter.trim().toLowerCase();
  if (letter.length !== 1 || !ALPHABET.includes(letter)) {
    state.lastRejection = 'not-a-letter';
    return invalid('not-a-letter');
  }

  if (state.rules.mode !== MODE_BATTLE && state.rules.mode !== MODE_SOLO) {
    const currentGuesser = state.players[state.turnIndex];
    if (!currentGuesser || currentGuesser.id !== playerId) {
      state.lastRejection = 'not-your-turn';
      return invalid('not-your-turn');
    }
  }

  const board = getPlayerBoard(state, playerId);
  if (board.out || board.solved) return invalid(null);

  if (board.guessedLetters.includes(letter) || board.wrongLetters.includes(letter)) {
    state.lastRejection = 'already-guessed';
    return invalid('already-guessed');
  }

  return { valid: true, letter, rejection: null };
}

function applyLetterHit(state: HangmanState, playerId: string, letter: string, now: number): void {
  const board = getPlayerBoard(state, playerId);
  board.guessedLetters.push(letter);
  state.lastRejection = null;

  const player = state.players.find((p) => p.id === playerId);
  if (player) {
    player.lettersFound++;
    const occurrences = state.secret.split('').filter((c) => c === letter).length;
    let points = POINTS_PER_CORRECT_LETTER + (occurrences - 1) * POINTS_PER_EXTRA_OCCURRENCE;

    if (state.rules.mode === MODE_SPEED) {
      const elapsed = (now - state.turnStartedAt) / 1000;
      if (elapsed <= state.rules.turnSeconds * SPEED_BONUS_THRESHOLD) {
        points += SPEED_BONUS_POINTS;
      }
    }

    player.score += points;
    state.message = `${player.name} guessed '${letter.toUpperCase()}' (+${points} pts)!`;
  }

  if (isBoardSolved(state.secret, board)) {
    board.solved = true;
    completeRoundSolved(state, playerId);
  }
}

function applyLetterMiss(state: HangmanState, playerId: string, letter: string): void {
  const board = getPlayerBoard(state, playerId);
  board.wrongLetters.push(letter);
  board.wrongCount++;
  state.lastRejection = null;

  const player = state.players.find((p) => p.id === playerId);
  if (player) {
    player.score = Math.max(0, player.score - PENALTY_WRONG_LETTER);
    state.message = `${player.name} missed with '${letter.toUpperCase()}'.`;
  }

  if (board.wrongCount >= state.rules.allowedMisses) {
    board.out = true;
    checkAllBoardsOut(state);
  }
}

function advanceTurnIfNeeded(state: HangmanState, now: number): void {
  if (state.status === STATUS_GUESSING && state.rules.mode !== MODE_BATTLE) {
    state.turnIndex = getNextGuesserIndex(state.players, state.setterIndex, state.turnIndex);
    state.turnStartedAt = now;
  }
}

export function submitLetterGuess(
  state: HangmanState,
  playerId: string,
  rawLetter: string,
  now: number = Date.now(),
): {
  success: boolean;
  isCorrect: boolean;
  rejection: HangmanRejection | null;
} {
  const validation = validateLetterGuess(state, playerId, rawLetter);
  if (!validation.valid) {
    return { success: false, isCorrect: false, rejection: validation.rejection };
  }

  const isHit = state.secret.includes(validation.letter);
  if (isHit) {
    applyLetterHit(state, playerId, validation.letter, now);
  } else {
    applyLetterMiss(state, playerId, validation.letter);
  }

  advanceTurnIfNeeded(state, now);
  return { success: true, isCorrect: isHit, rejection: null };
}

export function submitWordSolve(
  state: HangmanState,
  playerId: string,
  rawGuess: string,
  now: number = Date.now(),
): {
  success: boolean;
  isCorrect: boolean;
  rejection: HangmanRejection | null;
} {
  if (state.status !== STATUS_GUESSING) {
    return { success: false, isCorrect: false, rejection: null };
  }

  const guess = rawGuess.trim().toLowerCase();
  if (guess.length !== state.secret.length) {
    state.lastRejection = 'wrong-length';
    return { success: false, isCorrect: false, rejection: 'wrong-length' };
  }

  const board = getPlayerBoard(state, playerId);
  if (board.out || board.solved) {
    return { success: false, isCorrect: false, rejection: null };
  }

  const isMatch = guess === state.secret;
  if (isMatch) {
    board.solved = true;
    for (const char of state.secret) {
      if (!board.guessedLetters.includes(char)) {
        board.guessedLetters.push(char);
      }
    }
    completeRoundSolved(state, playerId);
    return { success: true, isCorrect: true, rejection: null };
  }

  board.wrongCount++;
  const player = state.players.find((p) => p.id === playerId);
  if (player) {
    player.score = Math.max(0, player.score - PENALTY_WRONG_SOLVE);
    state.message = `${player.name} made an incorrect word solve attempt!`;
  }

  if (board.wrongCount >= state.rules.allowedMisses) {
    board.out = true;
    checkAllBoardsOut(state);
  }

  advanceTurnIfNeeded(state, now);
  return { success: true, isCorrect: false, rejection: null };
}
