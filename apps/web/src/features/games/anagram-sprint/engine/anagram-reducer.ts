import type {
  AnagramRoundResult,
  AnagramRules,
  AnagramSeat,
  AnagramState,
} from '../types/anagram-sprint.types';
import { STATUS_COUNTDOWN, STATUS_PLAYING, STATUS_ROUND_SUMMARY } from './anagram-constants';
import { closeRound } from './anagram-round-close';
import {
  attemptsLeft,
  buildStartState,
  createInitialState,
  currentRound,
  everyoneIsDone,
  findPlayer,
  hasAnswered,
} from './anagram-state';
import { checkAnswer, costsAnAttempt } from './anagram-validator';

export type AnagramAction =
  | { type: 'start'; rules: AnagramRules; seats: readonly AnagramSeat[]; seed: number }
  | { type: 'begin'; now: number }
  /** `elapsedMs` is measured on the answering device, so a lagging peer is not punished. */
  | { type: 'answer'; playerId: string; word: string; elapsedMs: number }
  | { type: 'expire' }
  | { type: 'next-round'; now: number }
  | { type: 'clear-rejection' }
  | { type: 'load'; state: AnagramState }
  | { type: 'reset' };

function rejectionMessage(reason: string, answerLength: number): string {
  if (reason === 'wrong-letters') return `Use every letter — ${answerLength} of them, no more.`;
  if (reason === 'no-attempts-left') return 'No guesses left on this word.';
  if (reason === 'too-late') return 'That word is already settled.';
  return 'Not a word these letters make.';
}

function handleAnswer(
  state: AnagramState,
  action: Extract<AnagramAction, { type: 'answer' }>,
): AnagramState {
  const round = currentRound(state);
  const player = findPlayer(state, action.playerId);
  if (state.status !== STATUS_PLAYING || !round || !player || player.eliminated) return state;

  if (hasAnswered(state, action.playerId)) {
    return { ...state, lastRejection: 'too-late', message: rejectionMessage('too-late', 0) };
  }
  if (attemptsLeft(state, action.playerId) === 0) {
    return {
      ...state,
      lastRejection: 'no-attempts-left',
      message: rejectionMessage('no-attempts-left', 0),
    };
  }

  const check = checkAnswer(action.word, round.entry.word);

  if (!check.ok) {
    const spend = costsAnAttempt(check.reason);
    return {
      ...state,
      attemptsUsed: spend
        ? {
            ...state.attemptsUsed,
            [action.playerId]: (state.attemptsUsed[action.playerId] ?? 0) + 1,
          }
        : state.attemptsUsed,
      lastRejection: check.reason ?? null,
      message: rejectionMessage(check.reason ?? '', round.entry.word.length),
    };
  }

  // Points and placement are filled in when the round settles, once every
  // answer is in and the whole field can be ranked by the clock.
  const result: AnagramRoundResult = {
    playerId: action.playerId,
    word: check.word,
    elapsedMs: Math.max(0, Math.round(action.elapsedMs)),
    placement: 0,
    points: 0,
    speedBonus: 0,
    streakBonus: 0,
  };

  const answered: AnagramState = {
    ...state,
    results: [...state.results, result],
    lastRejection: null,
    message: `${player.name} has it.`,
  };

  return everyoneIsDone(answered) ? closeRound(answered) : answered;
}

function handleNextRound(state: AnagramState, now: number): AnagramState {
  if (state.status !== STATUS_ROUND_SUMMARY) return state;
  const nextIndex = state.roundIndex + 1;
  if (nextIndex >= state.plan.length) return state;

  return {
    ...state,
    status: STATUS_PLAYING,
    roundIndex: nextIndex,
    roundStartedAt: now,
    attemptsUsed: {},
    results: [],
    lastRejection: null,
    message: '',
  };
}

export function anagramReducer(state: AnagramState, action: AnagramAction): AnagramState {
  switch (action.type) {
    case 'start':
      return buildStartState(action.rules, action.seats, action.seed);
    case 'begin':
      return state.status === STATUS_COUNTDOWN
        ? { ...state, status: STATUS_PLAYING, roundStartedAt: action.now, message: '' }
        : state;
    case 'answer':
      return handleAnswer(state, action);
    case 'expire':
      return state.status === STATUS_PLAYING ? closeRound(state) : state;
    case 'next-round':
      return handleNextRound(state, action.now);
    case 'clear-rejection':
      return state.lastRejection ? { ...state, lastRejection: null } : state;
    case 'load':
      return action.state;
    case 'reset':
      return createInitialState(state.rules);
    default:
      return state;
  }
}
