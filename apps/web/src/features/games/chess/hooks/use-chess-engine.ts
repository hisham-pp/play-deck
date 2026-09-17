'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import { STATUS_PLAYING } from '../engine/chess-constants';
import { ChessEngine } from '../engine/chess-engine';
import type {
  ChessGameState,
  ChessMoveRecord,
  PieceColor,
  PromotionPiece,
} from '../types/chess.types';

export type ChessGameOverCallback = (state: ChessGameState) => void;

/** Picks the sound that best describes what just happened on the board. */
function soundForMove(record: ChessMoveRecord): void {
  if (record.checkmate) {
    playSound('victory');
    return;
  }
  playSound(record.move.captured ? 'capture' : 'piece-move');
}

export interface ChessControls {
  move: (from: number, to: number, promotion?: PromotionPiece) => ChessMoveRecord | null;
  undo: () => void;
  newGame: () => void;
  resign: (color: PieceColor) => void;
  offerDraw: (color: PieceColor) => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  legalTargets: (from: number) => number[];
  needsPromotion: (from: number, to: number) => boolean;
}

/**
 * Binds the framework-agnostic engine to React.
 *
 * The engine owns the game; this hook only mirrors its state into render and
 * turns changes into sound and session bookkeeping. A future online mode drives
 * the very same engine from a transport, with no change on this side.
 */
export function useChessEngine(onGameOver?: ChessGameOverCallback) {
  const engineRef = useRef<ChessEngine | null>(null);
  if (!engineRef.current) engineRef.current = new ChessEngine();
  const engine = engineRef.current;

  const [state, setState] = useState<ChessGameState>(() => engine.getState());
  const reportedRef = useRef<string | null>(null);
  const soundedPlyRef = useRef(0);

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    return unsubscribe;
  }, [engine]);

  useEffect(() => () => engine.destroy(), [engine]);

  // Sound follows the history rather than the local move call, so a move that
  // arrives from an online opponent is heard exactly like one played here.
  useEffect(() => {
    const plies = state.history.length;
    const last = state.history[plies - 1];
    if (last && plies > soundedPlyRef.current) soundForMove(last);
    soundedPlyRef.current = plies;
  }, [state.history]);

  // Report a finished game once, keyed by match so a new game can report again.
  // A takeback -- local or agreed online -- reopens the game and re-arms this.
  useEffect(() => {
    if (state.status === STATUS_PLAYING) {
      reportedRef.current = null;
      return;
    }
    if (reportedRef.current === state.matchId) return;

    reportedRef.current = state.matchId;
    onGameOver?.(state);
  }, [state, onGameOver]);

  const move = useCallback(
    (from: number, to: number, promotion?: PromotionPiece) => engine.moveTo(from, to, promotion),
    [engine],
  );

  const undo = useCallback(() => {
    if (engine.undo()) playSound('turn-pass');
  }, [engine]);

  const newGame = useCallback(() => {
    engine.newGame();
    reportedRef.current = null;
    playSound('ui-click');
  }, [engine]);

  const controls: ChessControls = {
    move,
    undo,
    newGame,
    resign: useCallback((color: PieceColor) => engine.resign(color), [engine]),
    offerDraw: useCallback((color: PieceColor) => engine.offerDraw(color), [engine]),
    acceptDraw: useCallback(() => engine.acceptDraw(), [engine]),
    declineDraw: useCallback(() => engine.declineDraw(), [engine]),
    legalTargets: useCallback((from: number) => engine.getLegalTargets(from), [engine]),
    needsPromotion: useCallback(
      (from: number, to: number) => engine.needsPromotion(from, to),
      [engine],
    ),
  };

  return { state, controls, engine };
}
