'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import { findKing } from '../engine/chess-board';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState, PieceColor, PromotionPiece } from '../types/chess.types';
import type { ChessControls } from './use-chess-engine';

export interface PendingPromotion {
  from: number;
  to: number;
  color: PieceColor;
}

export interface ChessInteraction {
  /** The square whose piece is picked up, if any. */
  selected: number | null;
  /** Where keyboard focus sits, which is not the same as a selection. */
  cursor: number | null;
  targets: number[];
  captures: number[];
  lastMove: { from: number; to: number } | null;
  checkedKing: number | null;
  orientation: PieceColor;
  pendingPromotion: PendingPromotion | null;
  selectSquare: (square: number) => void;
  moveCursor: (square: number) => void;
  clearSelection: () => void;
  confirmPromotion: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  flipBoard: () => void;
  setOrientation: (color: PieceColor) => void;
}

export interface UseChessInteractionOptions {
  state: ChessGameState;
  controls: ChessControls;
  /** Turn the board to face whoever is to move, for pass-and-play. */
  autoFlip: boolean;
  /**
   * The only colour this screen may move, online. Null at a shared board,
   * where whoever is on move plays.
   */
  playerColor?: PieceColor | null;
}

type TapOutcome =
  | { kind: 'ignore' }
  | { kind: 'select' }
  | { kind: 'deselect' }
  | { kind: 'promote'; from: number }
  | { kind: 'move'; from: number };

/**
 * One gesture drives everything: picking a piece up, putting it down on a legal
 * square, swapping to another of your pieces, or cancelling. Click, tap and
 * Enter all arrive here, so the three behave identically.
 */
function resolveTap(
  square: number,
  selected: number | null,
  ownPiece: boolean,
  controls: ChessControls,
): TapOutcome {
  if (selected === null) return ownPiece ? { kind: 'select' } : { kind: 'ignore' };
  if (square === selected) return { kind: 'deselect' };
  // Switching straight to another of your own pieces saves a click.
  if (ownPiece) return { kind: 'select' };
  if (!controls.legalTargets(selected).includes(square)) return { kind: 'deselect' };
  if (controls.needsPromotion(selected, square)) return { kind: 'promote', from: selected };
  return { kind: 'move', from: selected };
}

/** Everything the board lights up, derived from the game and the current selection. */
function useBoardMarkers(state: ChessGameState, selected: number | null, controls: ChessControls) {
  const { board, turn } = state.position;

  const targets = useMemo(
    () => (selected === null ? [] : controls.legalTargets(selected)),
    [selected, controls],
  );

  // En passant captures an empty square, so captures cannot be read off the
  // board alone.
  const captures = useMemo(() => {
    if (selected === null) return [];
    return state.legalMoves
      .filter((move) => move.from === selected && move.captured !== null)
      .map((move) => move.to);
  }, [selected, state.legalMoves]);

  const lastMove = useMemo(() => {
    const record = state.history[state.history.length - 1];
    return record ? { from: record.move.from, to: record.move.to } : null;
  }, [state.history]);

  const checkedKing = useMemo(
    () => (state.check ? findKing(board, turn) : null),
    [state.check, board, turn],
  );

  return { targets, captures, lastMove, checkedKing };
}

/**
 * All of the state that belongs to *playing* the board rather than to the game
 * itself: what is picked up, where the keyboard is, which way the board faces,
 * and the promotion question that has to be answered before a move can be made.
 *
 * None of this is in the engine, which is what lets a future online mode
 * synchronize moves without dragging one player's selection onto the other
 * player's screen.
 */
export function useChessInteraction({
  state,
  controls,
  autoFlip,
  playerColor = null,
}: UseChessInteractionOptions): ChessInteraction {
  const [selected, setSelected] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<PieceColor>('w');
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const { board, turn } = state.position;
  const isPlaying =
    state.status === STATUS_PLAYING && (playerColor === null || playerColor === turn);

  useEffect(() => {
    if (playerColor) setOrientation(playerColor);
    else if (autoFlip) setOrientation(turn);
  }, [autoFlip, playerColor, turn]);

  // A move, a takeback or a new game all invalidate a selection in progress.
  useEffect(() => {
    setSelected(null);
    setPendingPromotion(null);
  }, [state.position, state.matchId]);

  const { targets, captures, lastMove, checkedKing } = useBoardMarkers(state, selected, controls);

  const clearSelection = useCallback(() => setSelected(null), []);

  /**
   * One gesture drives everything: picking a piece up, putting it down on a
   * legal square, swapping to another of your pieces, or cancelling. Click,
   * tap and Enter all arrive here, so the three behave identically.
   */
  const selectSquare = useCallback(
    (square: number) => {
      setCursor(square);
      if (!isPlaying) return;

      const tap = resolveTap(square, selected, board[square]?.color === turn, controls);
      if (tap.kind === 'select') {
        setSelected(square);
        playSound('ui-click');
      } else if (tap.kind === 'deselect') {
        setSelected(null);
      } else if (tap.kind === 'promote') {
        setPendingPromotion({ from: tap.from, to: square, color: turn });
      } else if (tap.kind === 'move') {
        controls.move(tap.from, square);
        setSelected(null);
      }
    },
    [board, controls, isPlaying, selected, turn],
  );

  const confirmPromotion = useCallback(
    (piece: PromotionPiece) => {
      if (!pendingPromotion) return;
      controls.move(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setSelected(null);
    },
    [controls, pendingPromotion],
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelected(null);
  }, []);

  const flipBoard = useCallback(() => {
    setOrientation((current) => (current === 'w' ? 'b' : 'w'));
    playSound('ui-click');
  }, []);

  return {
    selected,
    cursor,
    targets,
    captures,
    lastMove,
    checkedKing,
    orientation,
    pendingPromotion,
    selectSquare,
    moveCursor: setCursor,
    clearSelection,
    confirmPromotion,
    cancelPromotion,
    flipBoard,
    setOrientation,
  };
}
