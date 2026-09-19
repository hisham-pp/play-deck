import type {
  HangmanBoard,
  HangmanCategory,
  HangmanPlayer,
  HangmanRejection,
  HangmanRules,
  HangmanState,
} from '../types/hangman-duel.types';
import { validateCustomWord } from './hangman-bank';
import {
  MODE_BATTLE,
  MODE_SOLO,
  SHARED_BOARD_ID,
  STATUS_GUESSING,
  STATUS_WORD_SELECT,
} from './hangman-constants';

export function createEmptyBoard(): HangmanBoard {
  return {
    guessedLetters: [],
    wrongLetters: [],
    wrongCount: 0,
    solved: false,
    out: false,
  };
}

export function createInitialBoards(
  rules: HangmanRules,
  players: HangmanPlayer[],
): Record<string, HangmanBoard> {
  if (rules.mode === MODE_BATTLE) {
    const boards: Record<string, HangmanBoard> = {};
    for (const p of players) {
      boards[p.id] = createEmptyBoard();
    }
    return boards;
  }
  return {
    [SHARED_BOARD_ID]: createEmptyBoard(),
  };
}

export function getPlayerBoard(state: HangmanState, playerId: string): HangmanBoard {
  if (state.rules.mode === MODE_BATTLE) {
    return state.boards[playerId] ?? (state.boards[playerId] = createEmptyBoard());
  }
  return state.boards[SHARED_BOARD_ID] ?? (state.boards[SHARED_BOARD_ID] = createEmptyBoard());
}

export function getNextGuesserIndex(
  players: HangmanPlayer[],
  setterIndex: number,
  currentIndex: number,
): number {
  if (players.length <= 1) return 0;
  let next = (currentIndex + 1) % players.length;
  if (next === setterIndex) {
    next = (next + 1) % players.length;
  }
  return next;
}

export function createInitialState(
  rules: HangmanRules,
  playerConfigs: { id: string; name: string }[],
): HangmanState {
  const players: HangmanPlayer[] = playerConfigs.map((p) => ({
    id: p.id,
    name: p.name,
    score: 0,
    roundsWon: 0,
    lettersFound: 0,
    wordsSolved: 0,
    roundsDefended: 0,
  }));

  const isSolo = rules.mode === MODE_SOLO;
  const setterIndex = isSolo ? -1 : 0;
  const turnIndex = isSolo ? 0 : players.length > 1 ? 1 : 0;

  return {
    status: isSolo ? STATUS_GUESSING : STATUS_WORD_SELECT,
    rules,
    players,
    round: 1,
    setterIndex,
    turnIndex,
    secret: '',
    category: rules.category,
    freeLetters: [],
    boards: createInitialBoards(rules, players),
    turnStartedAt: Date.now(),
    lastRejection: null,
    message: isSolo
      ? 'Solo round started! Guess a letter.'
      : `${players[setterIndex]?.name || 'The setter'} is choosing a word...`,
    roundOutcome: null,
    winnerIds: [],
  };
}

export function startRound(
  state: HangmanState,
  secretWord: string,
  category: HangmanCategory | null = null,
): { ok: boolean; rejection: HangmanRejection | null } {
  const validation = validateCustomWord(secretWord);
  if (!validation.valid) {
    return { ok: false, rejection: validation.rejection };
  }

  state.secret = validation.sanitized;
  state.category = category;
  state.boards = createInitialBoards(state.rules, state.players);
  state.freeLetters = [];
  state.roundOutcome = null;
  state.lastRejection = null;
  state.turnStartedAt = Date.now();
  state.status = STATUS_GUESSING;

  if (state.rules.revealFirstLetter && state.secret.length > 0) {
    const firstLetter = state.secret[0]!;
    state.freeLetters.push(firstLetter);
    for (const board of Object.values(state.boards)) {
      board.guessedLetters.push(firstLetter);
    }
  }

  const setter = state.setterIndex >= 0 ? state.players[state.setterIndex] : null;
  state.message = setter
    ? `${setter.name} has chosen a secret word! Start guessing.`
    : 'New round started! Guess a letter.';

  return { ok: true, rejection: null };
}

export function getMaskedWord(state: HangmanState, playerId: string): string[] {
  const board = getPlayerBoard(state, playerId);
  return state.secret.split('').map((char) => (board.guessedLetters.includes(char) ? char : '_'));
}

export function isBoardSolved(secret: string, board: HangmanBoard): boolean {
  if (!secret) return false;
  return secret.split('').every((char) => board.guessedLetters.includes(char));
}
