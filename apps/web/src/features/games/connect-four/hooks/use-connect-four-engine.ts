import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import {
  MODE_SINGLE,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_WON,
} from '../engine/connect-four-constants';
import { ConnectFourEngine } from '../engine/connect-four-engine';
import { getOpponentDisc } from '../engine/connect-four-utils';
import type {
  AIDifficulty,
  ConnectFourDisc,
  ConnectFourState,
  GameMode,
} from '../types/connect-four.types';

type GameOverCallback = (
  winner: ConnectFourDisc | null,
  isDraw: boolean,
  gameState: ConnectFourState,
) => void;

function handleStateAudioAndGameOver(
  nextState: ConnectFourState,
  prevState: ConnectFourState,
  onGameOver?: GameOverCallback,
): void {
  if (nextState.lastMove && nextState.lastMove !== prevState.lastMove) {
    playSound('piece-move');
  }

  const isTerminal = nextState.status === STATUS_WON || nextState.status === STATUS_DRAW;
  if (isTerminal && prevState.status === STATUS_PLAYING) {
    if (nextState.status === STATUS_WON) {
      playSound('victory');
    }
    onGameOver?.(nextState.winner, nextState.status === STATUS_DRAW, nextState);
  }
}

export function useConnectFourEngine(onGameOver?: GameOverCallback) {
  const engineRef = useRef<ConnectFourEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ConnectFourEngine();
  }
  const engine = engineRef.current;

  const [state, setState] = useState<ConnectFourState>(() => engine.getState());
  const prevStateRef = useRef<ConnectFourState>(state);

  useEffect(() => {
    const unsubscribe = engine.subscribe((nextState) => {
      setState(nextState);
      handleStateAudioAndGameOver(nextState, prevStateRef.current, onGameOver);
      prevStateRef.current = nextState;
    });

    return () => {
      unsubscribe();
    };
  }, [engine, onGameOver]);

  useEffect(() => {
    if (state.status !== STATUS_PLAYING || state.mode !== MODE_SINGLE) {
      return;
    }

    const aiDisc = getOpponentDisc(state.humanPlayerDisc);
    if (state.turn !== aiDisc) {
      return;
    }

    engine.setAiThinking(true);
    const timer = setTimeout(() => {
      engine.triggerAIMoveSynchronously();
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [state.status, state.mode, state.turn, state.humanPlayerDisc, engine]);

  const dropPiece = useCallback(
    (column: number, player?: ConnectFourDisc): boolean => {
      if (state.isAiThinking) return false;
      return engine.dropPiece(column, player);
    },
    [engine, state.isAiThinking],
  );

  const setMode = useCallback((mode: GameMode) => engine.setMode(mode), [engine]);
  const setDifficulty = useCallback((diff: AIDifficulty) => engine.setDifficulty(diff), [engine]);
  const setHumanDisc = useCallback((disc: ConnectFourDisc) => engine.setHumanDisc(disc), [engine]);
  const resetRound = useCallback(() => engine.resetRound(), [engine]);
  const resetMatch = useCallback(() => engine.resetMatch(), [engine]);

  return {
    state,
    dropPiece,
    setMode,
    setDifficulty,
    setHumanDisc,
    resetRound,
    resetMatch,
  };
}
