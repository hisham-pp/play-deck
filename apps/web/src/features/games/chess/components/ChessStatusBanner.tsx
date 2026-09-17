'use client';

import { Flag, Handshake, ShieldAlert, Swords, Trophy } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState } from '../types/chess.types';
import { colorName, statusHeadline } from '../utils/chess-labels';

export interface ChessStatusBannerProps {
  state: ChessGameState;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onNewGame: () => void;
}

function BannerIcon({ state }: { state: ChessGameState }) {
  if (state.status !== STATUS_PLAYING) return <Trophy className="h-4 w-4" />;
  if (state.check) return <ShieldAlert className="h-4 w-4" />;
  return <Swords className="h-4 w-4" />;
}

export function ChessStatusBanner({
  state,
  onAcceptDraw,
  onDeclineDraw,
  onNewGame,
}: ChessStatusBannerProps) {
  const isOver = state.status !== STATUS_PLAYING;
  const offer = state.drawOfferFrom;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5',
          isOver && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
          !isOver && state.check && 'border-red-500/50 bg-red-500/10 text-red-300',
          !isOver && !state.check && 'border-surface-border bg-surface-raised text-deck-200',
        )}
      >
        <BannerIcon state={state} />
        <p className="text-sm font-bold">{statusHeadline(state)}</p>

        {isOver && (
          <Button variant="primary" size="sm" className="ml-auto" onClick={onNewGame}>
            New game
          </Button>
        )}
      </div>

      {offer && !isOver && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3.5 py-2.5">
          <Handshake className="h-4 w-4 text-amber-300" />
          <p className="text-xs font-semibold text-amber-200">{colorName(offer)} offers a draw.</p>
          <div className="ml-auto flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={onDeclineDraw}>
              Decline
            </Button>
            <Button variant="primary" size="sm" onClick={onAcceptDraw}>
              Accept
            </Button>
          </div>
        </div>
      )}

      {isOver && state.result?.reason === 'resignation' && (
        <p className="flex items-center gap-1.5 px-1 text-[11px] text-deck-500">
          <Flag className="h-3 w-3" />
          Resignation ends the game at once. Take the move back to carry on.
        </p>
      )}
    </div>
  );
}
