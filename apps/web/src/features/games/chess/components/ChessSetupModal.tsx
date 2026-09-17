'use client';

import { Globe, RefreshCw, Swords, Users } from 'lucide-react';
import { useState } from 'react';
import { Button, Input, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import type { PieceColor } from '../types/chess.types';

export interface ChessMatchSetup {
  whiteName: string;
  blackName: string;
  orientation: PieceColor;
  /** Turn the board to face whoever is to move. */
  autoFlip: boolean;
}

export interface ChessSetupModalProps {
  isOpen: boolean;
  current: ChessMatchSetup;
  onClose: () => void;
  onStart: (setup: ChessMatchSetup) => void;
}

const BTN = 'button';

export function ChessSetupModal({ isOpen, current, onClose, onStart }: ChessSetupModalProps) {
  const [setup, setSetup] = useState<ChessMatchSetup>(current);

  const update = <K extends keyof ChessMatchSetup>(key: K, value: ChessMatchSetup[K]) =>
    setSetup((previous) => ({ ...previous, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chess match setup"
      description="Two players, one board. Name the players and choose how the board faces."
      size="md"
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
              White
            </span>
            <Input
              value={setup.whiteName}
              maxLength={20}
              onChange={(event) => update('whiteName', event.target.value)}
              placeholder="Player 1"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
              Black
            </span>
            <Input
              value={setup.blackName}
              maxLength={20}
              onChange={(event) => update('blackName', event.target.value)}
              placeholder="Player 2"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
            Board faces
          </span>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-surface-border bg-surface-raised p-1">
            {(['w', 'b'] as const).map((color) => (
              <button
                key={color}
                type={BTN}
                onClick={() => update('orientation', color)}
                className={cn(
                  'rounded-lg py-2 text-xs font-bold transition-all',
                  setup.orientation === color && !setup.autoFlip
                    ? 'bg-amber-500 text-deck-950'
                    : 'text-deck-400 hover:bg-surface-overlay hover:text-white',
                )}
                disabled={setup.autoFlip}
              >
                {color === 'w' ? 'White' : 'Black'}
              </button>
            ))}
          </div>

          <button
            type={BTN}
            onClick={() => update('autoFlip', !setup.autoFlip)}
            aria-pressed={setup.autoFlip}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors',
              setup.autoFlip
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-surface-border bg-surface-raised hover:bg-surface-overlay',
            )}
          >
            <RefreshCw
              className={cn('h-4 w-4', setup.autoFlip ? 'text-amber-400' : 'text-deck-500')}
            />
            <span className="flex flex-col">
              <span className="text-xs font-bold text-deck-950 dark:text-white">
                Turn the board each move
              </span>
              <span className="text-[11px] text-deck-500">
                Best for pass and play: each player always looks from their own side.
              </span>
            </span>
          </button>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-surface-border bg-surface-overlay/60 px-3 py-2.5">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-deck-500" />
          <p className="text-[11px] text-deck-500">
            <span className="font-semibold text-deck-400">Online play is not here yet.</span> The
            engine already exchanges moves rather than screens, so a match can be wired to a network
            without touching the board.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1.5 text-[11px] text-deck-500">
            <Users className="h-3.5 w-3.5" />
            Local two player
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onStart(setup);
                onClose();
              }}
              className="flex items-center gap-1.5"
            >
              <Swords className="h-4 w-4" />
              <span>Start match</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
