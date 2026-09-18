'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { COUNTDOWN_SECONDS } from '../engine/word-chain-constants';
import { wordChainReducer } from '../engine/word-chain-reducer';
import { normalizeWord } from '../engine/word-chain-rules';
import { createInitialState } from '../engine/word-chain-state';
import { wordChainStatsRepository } from '../services/word-chain-stats-repository';
import { wordDictionary } from '../services/word-dictionary.service';
import type {
  WordChainRules,
  WordChainSetupPlayer,
  WordChainStats,
} from '../types/word-chain.types';
import { useWordChainClock } from './use-word-chain-clock';

export interface UseWordChainEngineOptions {
  onFinished?: (won: boolean) => void;
}

/**
 * Binds the pure reducer to React: the dictionary fetch, the turn clock, the
 * opening countdown and stats persistence. No rules live here.
 */
export function useWordChainEngine({ onFinished }: UseWordChainEngineOptions = {}) {
  const [state, dispatch] = useReducer(wordChainReducer, undefined, () => createInitialState());
  const [stats, setStats] = useState<WordChainStats | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    let active = true;
    wordChainStatsRepository.getStats().then((loaded) => {
      if (active) setStats(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  // The shard for the letter in play is fetched ahead of the answer so that
  // validation stays instant once the player hits enter.
  useEffect(() => {
    if (state.requiredPrefix) void wordDictionary.ensureLetter(state.requiredPrefix);
  }, [state.requiredPrefix]);

  const handleExpire = useCallback(() => dispatch({ type: 'timeout' }), []);
  const clock = useWordChainClock(state, handleExpire);

  const startGame = useCallback(async (rules: WordChainRules, setup: WordChainSetupPlayer[]) => {
    setIsPreparing(true);
    try {
      const startingWord = await wordDictionary.randomSeedWord();
      setCountdown(COUNTDOWN_SECONDS);
      dispatch({ type: 'start', rules, setup, startingWord });
    } finally {
      setIsPreparing(false);
    }
  }, []);

  useEffect(() => {
    if (state.status !== 'countdown') return;
    if (countdown <= 0) {
      dispatch({ type: 'begin', now: Date.now() });
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [state.status, countdown]);

  const submitWord = useCallback(async (raw: string) => {
    const word = normalizeWord(raw);
    if (word) await wordDictionary.ensureLetter(word);
    dispatch({
      type: 'submit',
      word,
      now: Date.now(),
      isKnownWord: (candidate) => wordDictionary.has(candidate),
    });
  }, []);

  const controls = {
    startGame,
    submitWord,
    pause: useCallback(() => dispatch({ type: 'pause' }), []),
    resume: useCallback(() => dispatch({ type: 'resume', now: Date.now() }), []),
    clearRejection: useCallback(() => dispatch({ type: 'clear-rejection' }), []),
    reset: useCallback(() => dispatch({ type: 'reset' }), []),
  };

  // Persist the finished game exactly once, when the status first flips.
  const settledRef = useRef(state.status);
  useEffect(() => {
    const previous = settledRef.current;
    settledRef.current = state.status;
    if (previous === state.status || state.status !== 'finished') return;

    const best = state.players.reduce(
      (top, player) => (player.score > top ? player.score : top),
      0,
    );
    const longest = state.players.reduce(
      (top, player) => (player.longestWord.length > top.length ? player.longestWord : top),
      '',
    );
    const won = state.winnerIds.length > 0;

    wordChainStatsRepository
      .recordRun({
        mode: state.rules.mode,
        won,
        chainLength: state.chain.length,
        bestScore: best,
        longestWord: longest,
      })
      .then(setStats);

    onFinished?.(won);
  }, [
    state.status,
    state.players,
    state.chain.length,
    state.rules.mode,
    state.winnerIds,
    onFinished,
  ]);

  return { state, stats, clock, countdown, isPreparing, controls };
}

export type WordChainControls = ReturnType<typeof useWordChainEngine>['controls'];
