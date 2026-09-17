'use client';

import type { KeyboardEvent } from 'react';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { ChessBoard } from './ChessBoard';
import { ChessControls } from './ChessControls';
import { ChessHelpCard } from './ChessHelpCard';
import { ChessMoveList } from './ChessMoveList';
import { ChessPlayerCard } from './ChessPlayerCard';
import type { ChessMatchSetup } from './ChessSetupModal';
import { ChessStatusBanner } from './ChessStatusBanner';
import type { BoardHighlights } from './three/ChessBoard3D';

export interface ChessArenaProps {
  /** The live game, which drives every panel. */
  state: ChessGameState;
  /** What the board shows, which differs from `state` while reviewing. */
  boardState: ChessGameState;
  setup: ChessMatchSetup;
  orientation: PieceColor;
  highlights: BoardHighlights;
  cursor: number;
  reviewPly: number | null;
  onSelectSquare: (square: number) => void;
  onFocusSquare: (square: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onReviewPly: (ply: number | null) => void;
  onUndo: () => void;
  onFlip: () => void;
  onNewGame: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onOpenSetup: () => void;
}

/**
 * The match layout. The far player's card sits above the board and the near
 * player's below, so the screen matches where the two of them are sitting.
 */
export function ChessArena({
  state,
  boardState,
  setup,
  orientation,
  highlights,
  cursor,
  reviewPly,
  onSelectSquare,
  onFocusSquare,
  onKeyDown,
  onReviewPly,
  onUndo,
  onFlip,
  onNewGame,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onOpenSetup,
}: ChessArenaProps) {
  const near: PieceColor = orientation;
  const far: PieceColor = orientation === 'w' ? 'b' : 'w';
  const nameOf = (color: PieceColor) => (color === 'w' ? setup.whiteName : setup.blackName);

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-3">
        <ChessPlayerCard state={state} color={far} name={nameOf(far)} />

        {reviewPly !== null && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300">
            Reviewing move {reviewPly}. Touch the board or choose “Back to live” to return.
          </p>
        )}

        <ChessBoard
          state={boardState}
          orientation={orientation}
          highlights={highlights}
          cursor={cursor}
          onSelectSquare={onSelectSquare}
          onFocusSquare={onFocusSquare}
          onKeyDown={onKeyDown}
        />

        <ChessPlayerCard state={state} color={near} name={nameOf(near)} />
      </div>

      <aside className="flex flex-col gap-3">
        <ChessStatusBanner
          state={state}
          onAcceptDraw={onAcceptDraw}
          onDeclineDraw={onDeclineDraw}
          onNewGame={onNewGame}
        />
        <ChessControls
          state={state}
          onUndo={onUndo}
          onFlip={onFlip}
          onNewGame={onNewGame}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onOpenSetup={onOpenSetup}
        />
        <ChessMoveList history={state.history} reviewPly={reviewPly} onReviewPly={onReviewPly} />
        <ChessHelpCard />
      </aside>
    </div>
  );
}
