import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createInitialState, game2048Reducer } from '../engine/game-2048-reducer';
import { game2048Sound } from '../services/game-2048-sound.service';
import {
  DEFAULT_2048_STATS,
  game2048StatsRepository,
} from '../services/game-2048-stats-repository';
import type { Direction, Game2048Action, Game2048State, Game2048Stats } from '../types/2048.types';

interface Use2048EngineProps {
  onWin?: (score: number, highestTile: number) => void;
  onGameOver?: (score: number, highestTile: number) => void;
}

export function use2048Engine({ onWin, onGameOver }: Use2048EngineProps = {}) {
  const [state, dispatch] = useReducer(
    (prevState: Game2048State, action: Game2048Action) => game2048Reducer(prevState, action),
    0,
    (initialBest) => createInitialState(initialBest),
  );
  const [stats, setStats] = useState<Game2048Stats>(DEFAULT_2048_STATS);
  const gameEndedRecordedRef = useRef(false);
  const prevMoveCountRef = useRef(0);

  // Load persisted stats & best score on mount
  const refreshStats = useCallback(async () => {
    const loaded = await game2048StatsRepository.getStats();
    setStats(loaded);
    dispatch({ type: 'SET_BEST_SCORE', bestScore: loaded.bestScore });
  }, []);

  useEffect(() => {
    void refreshStats();
    void game2048StatsRepository.recordGameStart();
  }, [refreshStats]);

  // Audio & Persistence reactive updates
  useEffect(() => {
    if (state.moveCount > prevMoveCountRef.current) {
      prevMoveCountRef.current = state.moveCount;

      if (state.lastScoreGain > 0) {
        game2048Sound.playMerge(state.highestTile);
      } else {
        game2048Sound.playSlide();
      }

      // Sync best score to repository if exceeded
      if (state.score > stats.bestScore) {
        void game2048StatsRepository.updateBestScore(state.score);
      }
    }
  }, [state.moveCount, state.lastScoreGain, state.highestTile, state.score, stats.bestScore]);

  // Handle Win
  useEffect(() => {
    if (state.status === 'won' && !gameEndedRecordedRef.current) {
      game2048Sound.playWin();
      onWin?.(state.score, state.highestTile);
    }
  }, [state.status, state.score, state.highestTile, onWin]);

  // Handle Game Over
  useEffect(() => {
    if (state.status === 'over' && !gameEndedRecordedRef.current) {
      gameEndedRecordedRef.current = true;
      game2048Sound.playGameOver();
      void game2048StatsRepository
        .recordGameEnd(state.score, state.highestTile, state.hasWon, state.moveCount)
        .then(({ stats: updated }) => setStats(updated));
      onGameOver?.(state.score, state.highestTile);
    }
  }, [state.status, state.score, state.highestTile, state.hasWon, state.moveCount, onGameOver]);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: 'MOVE', direction });
  }, []);

  const restart = useCallback(() => {
    gameEndedRecordedRef.current = false;
    prevMoveCountRef.current = 0;
    dispatch({ type: 'RESTART' });
    void game2048StatsRepository.recordGameStart();
  }, []);

  const undo = useCallback(() => {
    if (state.status === 'over') {
      gameEndedRecordedRef.current = false;
    }
    dispatch({ type: 'UNDO' });
  }, [state.status]);

  const continuePlaying = useCallback(() => {
    dispatch({ type: 'CONTINUE' });
  }, []);

  return {
    state,
    stats,
    controls: {
      move,
      restart,
      undo,
      continuePlaying,
      refreshStats,
    },
  };
}
