'use client';

import {
  Flag,
  Handshake,
  LogOut,
  RefreshCw,
  RotateCcw,
  Settings2,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@playdeck/ui';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState } from '../types/chess.types';

export interface ChessControlsProps {
  state: ChessGameState;
  isOnline: boolean;
  /** A takeback is already waiting for an answer. */
  takebackPending: boolean;
  onUndo: () => void;
  onFlip: () => void;
  onNewGame: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onOpenSetup: () => void;
  onLeaveRoom: () => void;
}

const GHOST = 'ghost';

interface ControlProps {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'secondary' | 'ghost';
}

function Control({ Icon, label, onClick, disabled = false, variant = 'secondary' }: ControlProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1.5"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Button>
  );
}

export function ChessControls({
  state,
  isOnline,
  takebackPending,
  onUndo,
  onFlip,
  onNewGame,
  onResign,
  onOfferDraw,
  onOpenSetup,
  onLeaveRoom,
}: ChessControlsProps) {
  const isPlaying = state.status === STATUS_PLAYING;
  const hasMoves = state.history.length > 0;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Control
        Icon={Undo2}
        // Online, a takeback is a request the opponent has to accept.
        label={isOnline ? 'Ask takeback' : 'Take back'}
        onClick={onUndo}
        disabled={!hasMoves || takebackPending}
      />
      <Control Icon={RotateCcw} label="Flip board" onClick={onFlip} />
      <Control
        Icon={Handshake}
        label="Offer draw"
        onClick={onOfferDraw}
        disabled={!isPlaying || state.drawOfferFrom !== null}
        variant={GHOST}
      />
      <Control
        Icon={Flag}
        label="Resign"
        onClick={onResign}
        disabled={!isPlaying}
        variant={GHOST}
      />
      <Control Icon={RefreshCw} label="New game" onClick={onNewGame} />
      {isOnline ? (
        <Control Icon={LogOut} label="Leave room" onClick={onLeaveRoom} variant={GHOST} />
      ) : (
        <Control Icon={Settings2} label="Setup" onClick={onOpenSetup} variant={GHOST} />
      )}
    </div>
  );
}
