import type {
  WordChainEntry,
  WordChainPlayer,
  WordChainRules,
  WordChainSetupPlayer,
  WordChainState,
} from '../types/word-chain.types';
import {
  MIN_WORD_LENGTH,
  MODE_POINTS,
  STATUS_COUNTDOWN,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './word-chain-constants';
import {
  acceptedMessage,
  lifeLostMessage,
  rejectionMessage,
  turnPrompt,
} from './word-chain-messages';
import { finishGame, isGameOver } from './word-chain-outcome';
import { validateChainWord, requiredPrefixFor } from './word-chain-rules';
import { scoreWord } from './word-chain-scoring';
import {
  buildStartState,
  createInitialState,
  nextAliveIndex,
  turnConstraints,
} from './word-chain-state';

export type WordChainAction =
  | { type: 'start'; rules: WordChainRules; setup: WordChainSetupPlayer[]; startingWord: string }
  | { type: 'begin'; now: number }
  | { type: 'submit'; word: string; now: number; isKnownWord: (word: string) => boolean }
  | { type: 'timeout' }
  | { type: 'pause' }
  | { type: 'resume'; now: number }
  | { type: 'clear-rejection' }
  | { type: 'reset' };

/** Hands the named seat the clock, or ends the game if there is nothing left to play. */
function settleTurn(
  state: WordChainState,
  players: WordChainPlayer[],
  turnIndex: number,
  turnCount: number,
  now: number,
): WordChainState {
  if (isGameOver(state, players, turnCount)) {
    return finishGame({ ...state, players, turnCount });
  }

  const next = turnConstraints({ ...state, players }, turnCount);
  const player = players[turnIndex];

  return {
    ...state,
    players,
    turnIndex,
    turnCount,
    round: next.round,
    turnSeconds: next.turnSeconds,
    turnStartedAt: now,
    lastRejection: null,
    message: turnPrompt(player.name, state.requiredPrefix, next.minLength),
  };
}

/** Moves the seat on after a turn has been consumed. */
function advance(
  state: WordChainState,
  players: WordChainPlayer[],
  turnCount: number,
  now: number,
): WordChainState {
  return settleTurn(state, players, nextAliveIndex(players, state.turnIndex), turnCount, now);
}

function creditPlayer(player: WordChainPlayer, word: string, points: number): WordChainPlayer {
  return {
    ...player,
    score: player.score + points,
    wordsPlayed: player.wordsPlayed + 1,
    longestWord: word.length > player.longestWord.length ? word : player.longestWord,
  };
}

function handleSubmit(
  state: WordChainState,
  action: Extract<WordChainAction, { type: 'submit' }>,
): WordChainState {
  if (state.status !== STATUS_PLAYING) return state;

  const constraints = turnConstraints(state, state.turnCount);
  const baseMinLength = Math.max(MIN_WORD_LENGTH, state.rules.minWordLength);
  const result = validateChainWord({
    word: action.word,
    requiredPrefix: state.requiredPrefix,
    usedWords: new Set(state.usedWords),
    baseMinLength,
    minLength: constraints.minLength,
    category: constraints.category,
    isKnownWord: action.isKnownWord,
  });

  if (!result.ok) {
    return {
      ...state,
      lastRejection: result.reason,
      message: rejectionMessage(result.reason, {
        minLength: constraints.minLength,
        prefix: state.requiredPrefix,
        category: constraints.category,
      }),
    };
  }

  const player = state.players[state.turnIndex];
  const elapsedMs = Math.max(0, action.now - state.turnStartedAt);
  const { points, isSpeedBonus } = scoreWord(
    result.word,
    constraints.minLength,
    elapsedMs,
    state.turnSeconds,
  );

  const entry: WordChainEntry = {
    word: result.word,
    playerId: player.id,
    playerName: player.name,
    points,
    elapsedMs,
    isSpeedBonus,
  };

  const players = state.players.map((candidate, index) =>
    index === state.turnIndex ? creditPlayer(candidate, result.word, points) : candidate,
  );

  const accepted: WordChainState = {
    ...state,
    chain: [...state.chain, entry],
    usedWords: [...state.usedWords, result.word],
    requiredPrefix: requiredPrefixFor(result.word, state.rules.variant),
    message: acceptedMessage(player.name, result.word, points),
  };

  return advance(accepted, players, state.turnCount + 1, action.now);
}

/** Points mode has no lives, so a missed turn there simply passes the seat on. */
function penalise(player: WordChainPlayer, rules: WordChainRules): WordChainPlayer {
  if (rules.mode === MODE_POINTS) return player;
  const lives = Math.max(0, player.lives - 1);
  return { ...player, lives, eliminated: lives === 0 };
}

function handleTimeout(state: WordChainState): WordChainState {
  if (state.status !== STATUS_PLAYING) return state;

  const player = state.players[state.turnIndex];
  const players = state.players.map((candidate, index) =>
    index === state.turnIndex ? penalise(candidate, state.rules) : candidate,
  );

  const turnCount = state.turnCount + 1;
  const penalised = players[state.turnIndex];

  if (isGameOver(state, players, turnCount)) {
    return finishGame({ ...state, players, turnCount });
  }

  const advanced = advance(
    state,
    players,
    turnCount,
    state.turnStartedAt + state.turnSeconds * 1000,
  );
  return {
    ...advanced,
    message: `${lifeLostMessage(player.name, penalised.lives)} ${advanced.message}`.trim(),
  };
}

export function wordChainReducer(state: WordChainState, action: WordChainAction): WordChainState {
  switch (action.type) {
    case 'start':
      return buildStartState(action.rules, action.setup, action.startingWord);
    case 'begin': {
      if (state.status !== STATUS_COUNTDOWN) return state;
      // The opening turn belongs to the first seat, not the seat after it.
      return settleTurn({ ...state, status: STATUS_PLAYING }, state.players, 0, 0, action.now);
    }
    case 'submit':
      return handleSubmit(state, action);
    case 'timeout':
      return handleTimeout(state);
    case 'pause':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;
    case 'resume':
      return state.status === STATUS_PAUSED
        ? { ...state, status: STATUS_PLAYING, turnStartedAt: action.now }
        : state;
    case 'clear-rejection':
      return state.lastRejection ? { ...state, lastRejection: null } : state;
    case 'reset':
      return createInitialState(state.rules);
    default:
      return state;
  }
}
