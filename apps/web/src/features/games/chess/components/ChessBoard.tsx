'use client';

import dynamic from 'next/dynamic';
import type { KeyboardEvent } from 'react';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { ChessAccessibleGrid } from './ChessAccessibleGrid';
import type { BoardHighlights } from './three/ChessBoard3D';

/**
 * The 3D scene pulls in three.js and the renderer, so it is loaded on demand
 * and never on the server, where there is no WebGL context.
 */
const ChessScene = dynamic(() => import('./three/ChessScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-deck-400">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider font-display">
          Setting the board...
        </span>
      </div>
    </div>
  ),
});

export interface ChessBoardProps {
  state: ChessGameState;
  orientation: PieceColor;
  highlights: BoardHighlights;
  cursor: number;
  onSelectSquare: (square: number) => void;
  onFocusSquare: (square: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export function ChessBoard({
  state,
  orientation,
  highlights,
  cursor,
  onSelectSquare,
  onFocusSquare,
  onKeyDown,
}: ChessBoardProps) {
  return (
    <div className="relative w-full aspect-square max-h-[70vh] rounded-2xl overflow-hidden border border-surface-border bg-[#070b14] shadow-arcade group">
      <ChessScene
        state={state}
        orientation={orientation}
        highlights={highlights}
        onSelectSquare={onSelectSquare}
      />

      <ChessAccessibleGrid
        state={state}
        cursor={cursor}
        selected={highlights.selected}
        targets={highlights.targets}
        orientation={orientation}
        onFocusSquare={onFocusSquare}
        onActivateSquare={onSelectSquare}
        onKeyDown={onKeyDown}
      />

      <div className="absolute bottom-3 left-3 pointer-events-none px-3 py-1 rounded-full bg-surface-raised/85 border border-surface-border text-[11px] font-medium text-deck-400 backdrop-blur opacity-70 group-hover:opacity-100 transition-opacity">
        Drag to orbit · scroll to zoom · tap a piece, then its square
      </div>
    </div>
  );
}
