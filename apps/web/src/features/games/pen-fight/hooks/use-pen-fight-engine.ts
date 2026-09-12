'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PenFightEngine } from '../engine/pen-fight-engine';
import { penFightStatsRepository } from '../services/pen-fight-stats-repository';
import type {
  AIDifficulty,
  PenColor,
  PenFightMode,
  PenFightOutcome,
  PenFightPlayerId,
  PenFightState,
  PenFightStats,
  PenSpeedMode,
} from '../types/pen-fight.types';

export interface UsePenFightEngineReturn {
  state: PenFightState;
  stats: PenFightStats | null;
  engine: PenFightEngine;
  setMode: (mode: PenFightMode) => void;
  setSpeedMode: (speedMode: PenSpeedMode) => void;
  setDifficulty: (difficulty: AIDifficulty) => void;
  setPlayerName: (playerId: PenFightPlayerId, name: string) => void;
  setPlayerColor: (playerId: PenFightPlayerId, color: PenColor) => void;
  startMatch: () => void;
  flickTaken: () => void;
  beginSettling: () => void;
  resolveRound: (winner: PenFightOutcome) => void;
  nextRound: () => void;
  requestRematch: () => void;
}

export function usePenFightEngine(
  onMatchOver?: (winner: PenFightOutcome, state: PenFightState) => void,
): UsePenFightEngineReturn {
  const engineRef = useRef<PenFightEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new PenFightEngine();
  }
  const engine = engineRef.current;

  const [state, setState] = useState<PenFightState>(() => engine.getState());
  const [stats, setStats] = useState<PenFightStats | null>(null);
  const matchOverReportedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    penFightStatsRepository.getStats().then((loaded) => {
      if (isMounted) setStats(loaded);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => engine.subscribe(setState), [engine]);

  useEffect(() => {
    if (state.phase === 'match-over' && !matchOverReportedRef.current) {
      matchOverReportedRef.current = true;
      const won = state.matchWinner === 'p1';
      penFightStatsRepository
        .recordMatch(won, state.players.p1.roundWins, state.players.p2.roundWins)
        .then((s) => penFightStatsRepository.recordFlicks(state.totalFlicks).then(() => s))
        .then(setStats);
      onMatchOver?.(state.matchWinner, state);
    } else if (state.phase !== 'match-over') {
      matchOverReportedRef.current = false;
    }
  }, [state, onMatchOver]);

  const setMode = useCallback((mode: PenFightMode) => engine.setMode(mode), [engine]);
  const setSpeedMode = useCallback(
    (speedMode: PenSpeedMode) => engine.setSpeedMode(speedMode),
    [engine],
  );
  const setDifficulty = useCallback(
    (difficulty: AIDifficulty) => engine.setDifficulty(difficulty),
    [engine],
  );
  const setPlayerName = useCallback(
    (playerId: PenFightPlayerId, name: string) => engine.setPlayerName(playerId, name),
    [engine],
  );
  const setPlayerColor = useCallback(
    (playerId: PenFightPlayerId, color: PenColor) => engine.setPlayerColor(playerId, color),
    [engine],
  );
  const startMatch = useCallback(() => engine.startMatch(), [engine]);
  const flickTaken = useCallback(() => engine.flickTaken(), [engine]);
  const beginSettling = useCallback(() => engine.beginSettling(), [engine]);
  const resolveRound = useCallback(
    (winner: PenFightOutcome) => engine.resolveRound(winner),
    [engine],
  );
  const nextRound = useCallback(() => engine.nextRound(), [engine]);
  const requestRematch = useCallback(() => engine.requestRematch(), [engine]);

  return {
    state,
    stats,
    engine,
    setMode,
    setSpeedMode,
    setDifficulty,
    setPlayerName,
    setPlayerColor,
    startMatch,
    flickTaken,
    beginSettling,
    resolveRound,
    nextRound,
    requestRematch,
  };
}
