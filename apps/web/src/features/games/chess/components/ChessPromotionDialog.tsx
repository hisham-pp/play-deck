'use client';

import { Modal } from '@playdeck/ui';
import { toAlgebraic } from '../engine/chess-board';
import { PROMOTION_PIECES } from '../engine/chess-constants';
import type { PendingPromotion } from '../hooks/use-chess-interaction';
import type { PromotionPiece } from '../types/chess.types';
import { colorName, pieceName } from '../utils/chess-labels';

const WHITE_GLYPHS: Record<PromotionPiece, string> = {
  q: '♕',
  r: '♖',
  b: '♗',
  n: '♘',
};

const BLACK_GLYPHS: Record<PromotionPiece, string> = {
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
};

export interface ChessPromotionDialogProps {
  pending: PendingPromotion | null;
  onConfirm: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

/**
 * A pawn reaching the far rank has to become something, and which piece is the
 * player's choice, not the engine's. Underpromotion is offered on equal footing
 * with the queen because it genuinely matters -- a knight can give a check a
 * queen cannot.
 */
export function ChessPromotionDialog({ pending, onConfirm, onCancel }: ChessPromotionDialogProps) {
  const glyphs = pending?.color === 'b' ? BLACK_GLYPHS : WHITE_GLYPHS;

  return (
    <Modal
      isOpen={pending !== null}
      onClose={onCancel}
      title="Promote your pawn"
      description={
        pending
          ? `${colorName(pending.color)} pawn reaches ${toAlgebraic(pending.to)}. Choose its new piece.`
          : undefined
      }
      size="sm"
    >
      <div className="grid grid-cols-4 gap-2 py-2">
        {PROMOTION_PIECES.map((piece) => (
          <button
            key={piece}
            type="button"
            autoFocus={piece === 'q'}
            onClick={() => onConfirm(piece)}
            aria-label={`Promote to ${pieceName(piece)}`}
            className="flex flex-col items-center gap-1 rounded-xl border border-surface-border bg-surface-raised py-3 transition-colors hover:border-amber-500 hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="text-3xl leading-none text-deck-950 dark:text-white" aria-hidden>
              {glyphs[piece]}
            </span>
            <span className="text-[11px] font-semibold capitalize text-deck-400">
              {pieceName(piece)}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
