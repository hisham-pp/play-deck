'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { createInitialChessState } from '../engine/chess-state';
import { useChessEngine } from '../hooks/use-chess-engine';
import { useChessInteraction, type ChessInteraction } from '../hooks/use-chess-interaction';
import { useChessKeyboard } from '../hooks/use-chess-keyboard';
import { useChessSession } from '../hooks/use-chess-session';
import type { ChessMoveRecord } from '../types/chess.types';
import { announceState } from '../utils/chess-labels';
import { homeSquare } from '../utils/chess-navigation';
import { ChessArena } from './ChessArena';
import { ChessPromotionDialog } from './ChessPromotionDialog';
import { ChessSetupModal, type ChessMatchSetup } from './ChessSetupModal';
import type { BoardHighlights } from './three/ChessBoard3D';

const DEFAULT_SETUP: ChessMatchSetup = {
  whiteName: 'White',
  blackName: 'Black',
  orientation: 'w',
  autoFlip: false,
};

/**
 * While a past move is on the board, the live selection and check markers are
 * hidden and the reviewed move is outlined instead.
 */
function buildHighlights(
  interaction: ChessInteraction,
  reviewedMove: ChessMoveRecord | null,
  reviewing: boolean,
  cursor: number,
): BoardHighlights {
  if (!reviewing) {
    return {
      selected: interaction.selected,
      targets: interaction.targets,
      captures: interaction.captures,
      lastMove: interaction.lastMove,
      check: interaction.checkedKing,
      cursor,
    };
  }
  return {
    selected: null,
    targets: [],
    captures: [],
    lastMove: reviewedMove ? { from: reviewedMove.move.from, to: reviewedMove.move.to } : null,
    check: null,
    cursor,
  };
}

export function ChessGame() {
  const { handleGameOver } = useChessSession();
  const { state, controls } = useChessEngine(handleGameOver);

  const [setup, setSetup] = useState<ChessMatchSetup>(DEFAULT_SETUP);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [reviewPly, setReviewPly] = useState<number | null>(null);

  const interaction = useChessInteraction({ state, controls, autoFlip: setup.autoFlip });
  const { orientation } = interaction;

  const cursor = interaction.cursor ?? homeSquare(orientation);

  /**
   * While a past move is being reviewed the board shows that position instead
   * of the live one. Reviewing never touches the engine, so the game is still
   * exactly where it was when the player returns to it.
   */
  const reviewState = useMemo(() => {
    if (reviewPly === null) return null;
    const record = state.history[reviewPly - 1];
    if (!record) return null;
    return createInitialChessState({ fen: record.fenAfter, matchId: state.matchId });
  }, [reviewPly, state.history, state.matchId]);

  const boardState = reviewState ?? state;

  const reviewedMove = reviewPly === null ? null : (state.history[reviewPly - 1] ?? null);

  const highlights = useMemo(
    () => buildHighlights(interaction, reviewedMove, reviewPly !== null, cursor),
    [interaction, reviewedMove, reviewPly, cursor],
  );

  // Touching the board while reading back returns the player to the live game
  // rather than quietly ignoring them.
  const selectSquare = useCallback(
    (square: number) => {
      if (reviewPly !== null) {
        setReviewPly(null);
        interaction.moveCursor(square);
        return;
      }
      interaction.selectSquare(square);
    },
    [interaction, reviewPly],
  );

  const handleKeyDown = useChessKeyboard({
    cursor,
    orientation,
    onMoveCursor: interaction.moveCursor,
    onActivate: selectSquare,
    onCancel: interaction.clearSelection,
    onFlip: interaction.flipBoard,
    onUndo: controls.undo,
  });

  const startMatch = useCallback(
    (next: ChessMatchSetup) => {
      setSetup(next);
      interaction.setOrientation(next.autoFlip ? state.position.turn : next.orientation);
      setReviewPly(null);
      controls.newGame();
    },
    [controls, interaction, state.position.turn],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl select-none flex-col gap-4 px-3 py-2">
      {/* Everything that changes on the board is narrated here. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announceState(state)}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <ChessArena
        state={state}
        boardState={boardState}
        setup={setup}
        orientation={orientation}
        highlights={highlights}
        cursor={cursor}
        reviewPly={reviewPly}
        onSelectSquare={selectSquare}
        onFocusSquare={interaction.moveCursor}
        onKeyDown={handleKeyDown}
        onReviewPly={setReviewPly}
        onUndo={controls.undo}
        onFlip={interaction.flipBoard}
        onNewGame={controls.newGame}
        onResign={() => controls.resign(state.position.turn)}
        onOfferDraw={() => controls.offerDraw(state.position.turn)}
        onAcceptDraw={controls.acceptDraw}
        onDeclineDraw={controls.declineDraw}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      <ChessPromotionDialog
        pending={interaction.pendingPromotion}
        onConfirm={interaction.confirmPromotion}
        onCancel={interaction.cancelPromotion}
      />

      <ChessSetupModal
        isOpen={isSetupOpen}
        current={setup}
        onClose={() => setIsSetupOpen(false)}
        onStart={startMatch}
      />
    </div>
  );
}
