'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  COUNTDOWN_SECONDS,
  ROUND_SUMMARY_MS,
  STATUS_COUNTDOWN,
  STATUS_FINISHED,
  STATUS_ROUND_SUMMARY,
} from '../engine/anagram-constants';
import { anagramReducer } from '../engine/anagram-reducer';
import { createSeed } from '../engine/anagram-scramble';
import { createInitialState } from '../engine/anagram-state';
import { anagramStatsRepository } from '../services/anagram-stats-repository';
import type {
  AnagramRules,
  AnagramSeat,
  AnagramState,
  AnagramStats,
} from '../types/anagram-sprint.types';
import { useAnagramClock } from './use-anagram-clock';
import { useAnagramTray } from './use-anagram-tray';

export interface UseAnagramEngineOptions {
  /**
   * Whether this device decides when a word is over. Offline that is always
   * true; in a room only the host runs the clock, and guests follow its calls,
   * which is what keeps eight scoreboards identical.
   */
  isAuthority: boolean;
  onFinished?: (won: boolean, state: AnagramState) => void;
}

function bestOf(state: AnagramState): { score: number; solved: number; streak: number } {
  return state.players.reduce(
    (top, player) => ({
      score: Math.max(top.score, player.score),
      solved: Math.max(top.solved, player.solved),
      streak: Math.max(top.streak, player.bestStreak),
    }),
    { score: 0, solved: 0, streak: 0 },
  );
}

function fastestOf(state: AnagramState): number | null {
  return state.players.reduce<number | null>(
    (best, player) =>
      player.fastestMs === null || (best !== null && best <= player.fastestMs)
        ? best
        : player.fastestMs,
    null,
  );
}

/**
 * Binds the pure reducer to React: the opening countdown, the word clock, the
 * recap pause between words and stats persistence. No rules live here.
 */
export function useAnagramEngine({ isAuthority, onFinished }: UseAnagramEngineOptions) {
  const [state, dispatch] = useReducer(anagramReducer, undefined, () => createInitialState());
  const [stats, setStats] = useState<AnagramStats | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    let active = true;
    void anagramStatsRepository.getStats().then((loaded) => {
      if (active) setStats(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleExpire = useCallback(() => {
    if (isAuthority) dispatch({ type: 'expire' });
  }, [isAuthority]);

  const clock = useAnagramClock(state, handleExpire);
  const tray = useAnagramTray(state);

  const startMatch = useCallback(
    (rules: AnagramRules, seats: readonly AnagramSeat[], seed: number = createSeed()) => {
      setCountdown(COUNTDOWN_SECONDS);
      dispatch({ type: 'start', rules, seats, seed });
      return seed;
    },
    [],
  );

  useEffect(() => {
    if (state.status !== STATUS_COUNTDOWN) return;
    if (countdown <= 0) {
      dispatch({ type: 'begin', now: Date.now() });
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [state.status, countdown]);

  // The recap holds the answer up long enough to read before the next deal.
  useEffect(() => {
    if (!isAuthority || state.status !== STATUS_ROUND_SUMMARY) return;
    const timer = setTimeout(
      () => dispatch({ type: 'next-round', now: Date.now() }),
      ROUND_SUMMARY_MS,
    );
    return () => clearTimeout(timer);
  }, [isAuthority, state.status, state.roundIndex]);

  const submitAnswer = useCallback((playerId: string, word: string, elapsedMs: number) => {
    dispatch({ type: 'answer', playerId, word, elapsedMs });
  }, []);

  const controls = {
    startMatch,
    submitAnswer,
    advance: useCallback(() => dispatch({ type: 'next-round', now: Date.now() }), []),
    expire: useCallback(() => dispatch({ type: 'expire' }), []),
    clearRejection: useCallback(() => dispatch({ type: 'clear-rejection' }), []),
    load: useCallback((snapshot: AnagramState) => dispatch({ type: 'load', state: snapshot }), []),
    reset: useCallback(() => dispatch({ type: 'reset' }), []),
  };

  // Persist the finished match exactly once, when the status first flips.
  const settledRef = useRef(state.status);
  useEffect(() => {
    const previous = settledRef.current;
    settledRef.current = state.status;
    if (previous === state.status || state.status !== STATUS_FINISHED) return;

    const best = bestOf(state);
    const won = state.winnerIds.length > 0;

    void anagramStatsRepository
      .recordRun({
        mode: state.rules.mode,
        won,
        score: best.score,
        solved: best.solved,
        longestStreak: best.streak,
        fastestMs: fastestOf(state),
      })
      .then(setStats);

    onFinished?.(won, state);
  }, [state, onFinished]);

  return { state, dispatch, stats, clock, tray, countdown, controls };
}

export type AnagramControls = ReturnType<typeof useAnagramEngine>['controls'];
