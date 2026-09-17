'use client';

import { Flag, Handshake, RefreshCw, RotateCcw, Settings2, Undo2 } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { STATUS_PLAYING } from '../engine/chess-constants';
import type { ChessGameState } from '../types/chess.types';

export interface ChessControlsProps {
  state: ChessGameState;
  onUndo: () => void;
  onFlip: () => void;
  onNewGame: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onOpenSetup: () => void;
}

const ICON = 'h-3.5 w-3.5';
const BUTTON_ROW = 'flex items-center gap-1.5';

export function ChessControls({
  state,
  onUndo,
  onFlip,
  onNewGame,
  onResign,
  onOfferDraw,
  onOpenSetup,
}: ChessControlsProps) {
  const isPlaying = state.status === STATUS_PLAYING;
  const canUndo = state.history.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className={BUTTON_ROW}
      >
        <Undo2 className={ICON} />
        <span>Take back</span>
      </Button>

      <Button variant="secondary" size="sm" onClick={onFlip} className={BUTTON_ROW}>
        <RotateCcw className={ICON} />
        <span>Flip board</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onOfferDraw}
        disabled={!isPlaying || state.drawOfferFrom !== null}
        className={BUTTON_ROW}
      >
        <Handshake className={ICON} />
        <span>Offer draw</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onResign}
        disabled={!isPlaying}
        className={BUTTON_ROW}
      >
        <Flag className={ICON} />
        <span>Resign</span>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onOpenSetup} className={BUTTON_ROW}>
          <Settings2 className={ICON} />
          <span>Setup</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onNewGame} className={BUTTON_ROW}>
          <RefreshCw className={ICON} />
          <span>New game</span>
        </Button>
      </div>
    </div>
  );
}
