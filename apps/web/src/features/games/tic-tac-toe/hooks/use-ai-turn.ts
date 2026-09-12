import { useEffect, useRef } from 'react';
import { computeAIMove } from '../engine/tic-tac-toe-ai';
import {
  DEFAULT_AI_THINKING_MS,
  MODE_SINGLE,
  STATUS_PLAYING,
} from '../engine/tic-tac-toe-constants';
import type { TicTacToeEngine } from '../engine/tic-tac-toe-engine';
import { getOpponentMark } from '../engine/tic-tac-toe-utils';
import type { TicTacToeState } from '../types/tic-tac-toe.types';

export function useAiTurn(engine: TicTacToeEngine, state: TicTacToeState): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isAiTurn =
      state.mode === MODE_SINGLE &&
      state.status === STATUS_PLAYING &&
      state.turn !== state.humanPlayerMark;

    if (!isAiTurn) {
      engine.setAiThinking(false);
      return;
    }

    const aiMark = getOpponentMark(state.humanPlayerMark);
    engine.setAiThinking(true);

    timeoutRef.current = setTimeout(() => {
      const current = engine.getState();
      const stillAiTurn =
        current.mode === MODE_SINGLE &&
        current.status === STATUS_PLAYING &&
        current.turn === aiMark;

      if (stillAiTurn) {
        const move = computeAIMove(current.board, aiMark, current.aiDifficulty);
        if (move >= 0) {
          engine.makeMove(move, aiMark);
        }
      }
      engine.setAiThinking(false);
    }, DEFAULT_AI_THINKING_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    engine,
    state.board,
    state.turn,
    state.status,
    state.mode,
    state.humanPlayerMark,
    state.aiDifficulty,
  ]);
}
