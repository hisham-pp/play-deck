import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DIFFICULTY_MEDIUM,
  MARK_X,
  MODE_SINGLE,
  STATUS_DRAW,
  STATUS_WON,
} from '../engine/tic-tac-toe-constants';
import { TicTacToeEngine } from '../engine/tic-tac-toe-engine';
import { ticTacToeStatsRepository } from '../services/tic-tac-toe-stats-repository';
import type {
  AIDifficulty,
  GameMode,
  PlayerMark,
  TicTacToeState,
  TicTacToeStats,
} from '../types/tic-tac-toe.types';
import { useAiTurn } from './use-ai-turn';

export interface UseTicTacToeEngineReturn {
  state: TicTacToeState;
  stats: TicTacToeStats | null;
  makeMove: (index: number) => boolean;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: AIDifficulty) => void;
  setHumanMark: (mark: PlayerMark) => void;
  resetRound: () => void;
  resetMatch: () => void;
  refreshStats: () => Promise<void>;
}

export function useTicTacToeEngine(
  onGameOver?: (winner: PlayerMark | null, isDraw: boolean, state: TicTacToeState) => void,
): UseTicTacToeEngineReturn {
  const engineRef = useRef<TicTacToeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new TicTacToeEngine(MODE_SINGLE, DIFFICULTY_MEDIUM, MARK_X, MARK_X);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<TicTacToeState>(() => engine.getState());
  const [stats, setStats] = useState<TicTacToeStats | null>(null);
  const gameOverReportedRef = useRef<string | null>(null);

  // Subscribe to engine state mutations
  useEffect(() => {
    return engine.subscribe(setState);
  }, [engine]);

  // Load lifetime stats
  const refreshStats = useCallback(async () => {
    try {
      const data = await ticTacToeStatsRepository.getStats();
      setStats(data);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // AI automation turn lifecycle
  useAiTurn(engine, state);

  // Handle Game Over notifications
  useEffect(() => {
    if (state.status === STATUS_WON || state.status === STATUS_DRAW) {
      const key = `${state.round}-${state.moveHistory.length}-${state.status}-${state.winner}`;
      if (gameOverReportedRef.current !== key) {
        gameOverReportedRef.current = key;
        onGameOver?.(state.winner, state.status === STATUS_DRAW, state);
      }
    } else {
      gameOverReportedRef.current = null;
    }
  }, [state, onGameOver]);

  const makeMove = useCallback(
    (index: number) => {
      if (state.mode === MODE_SINGLE && state.turn !== state.humanPlayerMark) {
        return false;
      }
      return engine.makeMove(index, state.turn);
    },
    [engine, state.mode, state.turn, state.humanPlayerMark],
  );

  const setMode = useCallback((mode: GameMode) => engine.setMode(mode), [engine]);

  const setDifficulty = useCallback(
    (difficulty: AIDifficulty) => engine.setDifficulty(difficulty),
    [engine],
  );

  const setHumanMark = useCallback((mark: PlayerMark) => engine.setHumanMark(mark), [engine]);

  const resetRound = useCallback(() => engine.resetRound(), [engine]);
  const resetMatch = useCallback(() => engine.resetMatch(), [engine]);

  return {
    state,
    stats,
    makeMove,
    setMode,
    setDifficulty,
    setHumanMark,
    resetRound,
    resetMatch,
    refreshStats,
  };
}
