'use client';

import { jumpAt, listSquares, squareToCoord } from '../../engine/board-layout';
import { FINAL_SQUARE } from '../../engine/snake-ladder-constants';

function squareTone(square: number): string {
  const { row, column } = squareToCoord(square);
  return (row + column) % 2 === 0
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-slate-800/60 border-slate-700/70';
}

function squareAccent(square: number): string {
  const jump = jumpAt(square);
  if (square === FINAL_SQUARE) return 'ring-1 ring-inset ring-amber-400/70';
  if (jump?.kind === 'ladder') return 'ring-1 ring-inset ring-amber-500/30';
  if (jump?.kind === 'snake') return 'ring-1 ring-inset ring-emerald-500/30';
  return '';
}

/**
 * The 10x10 grid itself. Rendered in DOM order top-left to bottom-right, which
 * `squareToCoord` already accounts for, so square 1 sits bottom-left.
 */
export function BoardGrid() {
  const squares = listSquares();
  const byGridOrder = [...squares].sort((a, b) => {
    const ca = squareToCoord(a);
    const cb = squareToCoord(b);
    return ca.row - cb.row || ca.column - cb.column;
  });

  return (
    <div className="grid h-full w-full grid-cols-10 grid-rows-10" aria-hidden="true">
      {byGridOrder.map((square) => (
        <div
          key={square}
          className={`relative flex items-start justify-start border p-[2px] ${squareTone(square)} ${squareAccent(square)}`}
        >
          <span className="select-none text-[8px] font-semibold leading-none text-slate-500 sm:text-[10px]">
            {square}
          </span>
          {square === FINAL_SQUARE && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-sm">
              🏁
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
