'use client';

import { Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { colorName } from '../utils/chess-labels';
import { ChessCapturedTray } from './ChessCapturedTray';

export interface ChessPlayerCardProps {
  state: ChessGameState;
  color: PieceColor;
  name: string;
}

export function ChessPlayerCard({ state, color, name }: ChessPlayerCardProps) {
  const isTurn = state.position.turn === color && state.status === STATUS_PLAYING;
  const isWinner = state.result?.winner === color;
  const inCheck = isTurn && state.check;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
        isTurn ? 'border-amber-500/60 bg-amber-500/10' : 'border-surface-border bg-surface-raised',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
          color === 'w'
            ? 'bg-[#f2e9d8] border-[#d6cbb4] text-deck-900'
            : 'bg-[#242a38] border-[#3c4356] text-white',
        )}
        aria-hidden
      >
        {isWinner ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </span>

      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-deck-950 dark:text-white">{name}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-deck-500">
            {colorName(color)}
          </span>
        </span>
        <ChessCapturedTray history={state.history} color={color} />
      </div>

      <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-wider">
        {inCheck && <span className="text-red-400">Check</span>}
        {!inCheck && isTurn && <span className="text-amber-400">To move</span>}
        {isWinner && <span className="text-emerald-400">Winner</span>}
      </span>
    </div>
  );
}
