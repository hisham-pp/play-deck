'use client';

import { Handshake, ShieldAlert, Swords, Trophy, Undo2, type LucideIcon } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { colorName, statusHeadline } from '../utils/chess-labels';

export interface ChessStatusBannerProps {
  state: ChessGameState;
  /** The colour this screen plays online, or null at a shared board. */
  localColor: PieceColor | null;
  /** A takeback waiting for an answer (online only). */
  pendingTakebackFrom: PieceColor | null;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
  onNewGame: () => void;
}

interface RequestProps {
  Icon: LucideIcon;
  text: string;
  /** Null while this screen is the one waiting for an answer. */
  onAccept: (() => void) | null;
  onDecline: () => void;
}

/** A question one player has put to the other, with the answer buttons. */
function Request({ Icon, text, onAccept, onDecline }: RequestProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-amber-300" />
      <p className="text-xs font-semibold text-amber-200">{text}</p>
      {onAccept && (
        <div className="ml-auto flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={onDecline}>
            Decline
          </Button>
          <Button variant="primary" size="sm" onClick={onAccept}>
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}

function headlineIcon(state: ChessGameState): LucideIcon {
  if (state.status !== STATUS_PLAYING) return Trophy;
  return state.check ? ShieldAlert : Swords;
}

export function ChessStatusBanner({
  state,
  localColor,
  pendingTakebackFrom,
  onAcceptDraw,
  onDeclineDraw,
  onAcceptTakeback,
  onDeclineTakeback,
  onNewGame,
}: ChessStatusBannerProps) {
  const isOver = state.status !== STATUS_PLAYING;
  const offer = state.drawOfferFrom;
  const Icon = headlineIcon(state);
  // Online, a player cannot answer their own request.
  const isMine = (color: PieceColor) => localColor !== null && color === localColor;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 backdrop-blur-md',
          isOver && 'border-emerald-500/50 bg-emerald-950/70 text-emerald-300',
          !isOver && state.check && 'border-red-500/50 bg-red-950/70 text-red-300',
          !isOver && !state.check && 'border-surface-border bg-surface-raised/85 text-deck-200',
        )}
      >
        <Icon className="h-4 w-4" />
        <p className="text-sm font-bold">{statusHeadline(state)}</p>
        {isOver && (
          <Button variant="primary" size="sm" className="ml-auto" onClick={onNewGame}>
            New game
          </Button>
        )}
      </div>

      {offer && !isOver && (
        <Request
          Icon={Handshake}
          text={
            isMine(offer)
              ? 'Draw offered. Waiting for a reply…'
              : `${colorName(offer)} offers a draw.`
          }
          onAccept={isMine(offer) ? null : onAcceptDraw}
          onDecline={onDeclineDraw}
        />
      )}

      {pendingTakebackFrom && (
        <Request
          Icon={Undo2}
          text={
            isMine(pendingTakebackFrom)
              ? 'Takeback requested. Waiting for a reply…'
              : `${colorName(pendingTakebackFrom)} asks to take back a move.`
          }
          onAccept={isMine(pendingTakebackFrom) ? null : onAcceptTakeback}
          onDecline={onDeclineTakeback}
        />
      )}
    </div>
  );
}
