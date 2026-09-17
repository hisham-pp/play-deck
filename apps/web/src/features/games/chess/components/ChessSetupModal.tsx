'use client';

import { Globe, RefreshCw, Swords, Users } from 'lucide-react';
import { useState } from 'react';
import { Button, Input, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import type { PieceColor } from '../types/chess.types';
import { ChessOnlineSetup } from './ChessOnlineSetup';

export type ChessPlayMode = 'local' | 'online';

export interface ChessMatchSetup {
  mode: ChessPlayMode;
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
  /** Starts a game at this screen. */
  onStart: (setup: ChessMatchSetup) => void;
  /** Both players are in an online room and the game can begin. */
  onOnlineReady: () => void;
}

const BTN = 'button';
const LABEL = 'text-xs font-semibold uppercase tracking-wider text-deck-400 font-display';
const TOGGLE_ON = 'bg-amber-500 text-deck-950 shadow-sm';
const TOGGLE_OFF = 'text-deck-400 hover:bg-surface-overlay hover:text-white';

const MODES: { id: ChessPlayMode; label: string; hint: string; Icon: typeof Users }[] = [
  { id: 'local', label: 'Pass & play', hint: 'Two players, one screen', Icon: Users },
  { id: 'online', label: 'Online 1v1', hint: 'Room code, voice & chat', Icon: Globe },
];

interface LocalOptionsProps {
  setup: ChessMatchSetup;
  update: <K extends keyof ChessMatchSetup>(key: K, value: ChessMatchSetup[K]) => void;
}

function LocalOptions({ setup, update }: LocalOptionsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {(['whiteName', 'blackName'] as const).map((key) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className={LABEL}>{key === 'whiteName' ? 'White' : 'Black'}</span>
            <Input
              value={setup[key]}
              maxLength={20}
              onChange={(event) => update(key, event.target.value)}
              placeholder={key === 'whiteName' ? 'Player 1' : 'Player 2'}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className={LABEL}>Board faces</span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-surface-border bg-surface-raised p-1">
          {(['w', 'b'] as const).map((color) => (
            <button
              key={color}
              type={BTN}
              onClick={() => update('orientation', color)}
              disabled={setup.autoFlip}
              className={cn(
                'rounded-lg py-2 text-xs font-bold transition-all',
                setup.orientation === color && !setup.autoFlip ? TOGGLE_ON : TOGGLE_OFF,
              )}
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
              Each player always looks from their own side.
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

export function ChessSetupModal({
  isOpen,
  current,
  onClose,
  onStart,
  onOnlineReady,
}: ChessSetupModalProps) {
  const [setup, setSetup] = useState<ChessMatchSetup>(current);

  const update = <K extends keyof ChessMatchSetup>(key: K, value: ChessMatchSetup[K]) =>
    setSetup((previous) => ({ ...previous, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chess match setup"
      description="Play at this screen, or open a room and play a friend online with voice and chat."
      size="md"
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-surface-border bg-surface-raised p-1">
          {MODES.map(({ id, label, hint, Icon }) => (
            <button
              key={id}
              type={BTN}
              onClick={() => update('mode', id)}
              aria-pressed={setup.mode === id}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-bold transition-all',
                setup.mode === id ? TOGGLE_ON : TOGGLE_OFF,
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span className="text-[10px] font-normal opacity-80">{hint}</span>
            </button>
          ))}
        </div>

        {setup.mode === 'online' ? (
          <ChessOnlineSetup
            onReady={() => {
              onOnlineReady();
              onClose();
            }}
          />
        ) : (
          <>
            <LocalOptions setup={setup} update={update} />
            <div className="flex justify-end gap-2 pt-1">
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
          </>
        )}
      </div>
    </Modal>
  );
}
