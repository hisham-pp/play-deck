'use client';

import { useEffect, useRef } from 'react';
import { groupSanByTurn } from '../engine/chess-notation';
import type { ChessMoveRecord } from '../types/chess.types';

export interface ChessMoveListProps {
  history: readonly ChessMoveRecord[];
  /** Ply being reviewed, or null while the live position is shown. */
  reviewPly: number | null;
  onReviewPly: (ply: number | null) => void;
}

function MoveButton({
  san,
  ply,
  isActive,
  onSelect,
}: {
  san: string | null;
  ply: number | null;
  isActive: boolean;
  onSelect: (ply: number) => void;
}) {
  if (san === null || ply === null) {
    return <span className="px-2 py-1 text-deck-600">&mdash;</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(ply)}
      aria-current={isActive ? 'true' : undefined}
      className={`px-2 py-1 rounded text-left font-mono text-xs transition-colors ${
        isActive
          ? 'bg-amber-500/20 text-amber-300 font-bold'
          : 'text-deck-200 hover:bg-surface-overlay hover:text-white'
      }`}
    >
      {san}
    </button>
  );
}

/**
 * The score sheet. Every move is a button, so a player can step back through
 * the game to look at an earlier position without taking any moves back.
 */
export function ChessMoveList({ history, reviewPly, onReviewPly }: ChessMoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const turns = groupSanByTurn(
    history.map((record) => ({ san: record.san, ply: record.ply, color: record.move.color })),
  );

  // Follow the game as it is played, unless the player is reading back.
  useEffect(() => {
    if (reviewPly !== null) return;
    const list = scrollRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [history.length, reviewPly]);

  return (
    <section
      aria-label="Move history"
      className="flex flex-col rounded-xl border border-surface-border bg-surface-raised overflow-hidden"
    >
      <header className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
          Moves
        </h3>
        {reviewPly !== null && (
          <button
            type="button"
            onClick={() => onReviewPly(null)}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
          >
            Back to live
          </button>
        )}
      </header>

      <div ref={scrollRef} className="max-h-52 overflow-y-auto px-2 py-1.5">
        {turns.length === 0 ? (
          <p className="px-1 py-3 text-xs text-deck-500">No moves yet. White opens.</p>
        ) : (
          <ol className="flex flex-col gap-0.5">
            {turns.map((turn) => (
              <li
                key={turn.moveNumber}
                className="grid grid-cols-[2rem_1fr_1fr] items-center gap-1"
              >
                <span className="text-[11px] font-mono text-deck-500 tabular-nums">
                  {turn.moveNumber}.
                </span>
                <MoveButton
                  san={turn.white}
                  ply={turn.whitePly}
                  isActive={reviewPly === turn.whitePly}
                  onSelect={onReviewPly}
                />
                <MoveButton
                  san={turn.black}
                  ply={turn.blackPly}
                  isActive={reviewPly === turn.blackPly}
                  onSelect={onReviewPly}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
