'use client';

import { Globe, Sparkles, Swords, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { MODE_LOCAL_2P, MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';
import { AiSetupOptions } from './AiSetupOptions';
import { OnlineSetupView } from './OnlineSetupView';

export interface TicTacToeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  currentDifficulty: AIDifficulty;
  currentHumanMark: PlayerMark;
  onStartMatch: (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    humanMark: PlayerMark;
  }) => void;
  onStartOnlineMatch: () => void;
}

const BTN_TYPE = 'button';
const ICON_SM = 'w-4 h-4';

export function TicTacToeSetupModal({
  isOpen,
  onClose,
  currentMode,
  currentDifficulty,
  currentHumanMark,
  onStartMatch,
  onStartOnlineMatch,
}: TicTacToeSetupModalProps) {
  const [mode, setMode] = useState<GameMode>(currentMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [humanMark, setHumanMark] = useState<PlayerMark>(currentHumanMark);

  const handleStartLocalOrAi = () => {
    onStartMatch({ mode, difficulty, humanMark });
    onClose();
  };

  const handleOnlineMatchStart = () => {
    onStartOnlineMatch();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Match Setup"
      description="Choose your game mode and match configuration to enter the arena."
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-raised border border-surface-border">
          <button
            type={BTN_TYPE}
            onClick={() => setMode(MODE_SINGLE)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
              mode === MODE_SINGLE
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
            )}
          >
            <Sparkles className={ICON_SM} />
            <span>Vs AI</span>
          </button>

          <button
            type={BTN_TYPE}
            onClick={() => setMode(MODE_LOCAL_2P)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
              mode === MODE_LOCAL_2P
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
            )}
          >
            <Users className={ICON_SM} />
            <span>Local 2P</span>
          </button>

          <button
            type={BTN_TYPE}
            onClick={() => setMode(MODE_MULTIPLAYER)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
              mode === MODE_MULTIPLAYER
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
            )}
          >
            <Globe className={ICON_SM} />
            <span>Online 2P</span>
          </button>
        </div>

        {/* Mode Specific Body */}
        {mode === MODE_SINGLE && (
          <AiSetupOptions
            difficulty={difficulty}
            humanMark={humanMark}
            onDifficultyChange={setDifficulty}
            onHumanMarkChange={setHumanMark}
          />
        )}

        {mode === MODE_LOCAL_2P && (
          <div className="p-4 rounded-xl bg-surface-base/80 border border-surface-border text-center flex flex-col items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            <span className="text-xs font-semibold text-deck-200">Pass & Play on this screen</span>
            <p className="text-[11px] text-deck-400 max-w-xs">
              Player 1 starts as <span className="text-amber-400 font-bold">X</span>. Player 2 plays
              as <span className="text-cyan-400 font-bold">O</span>.
            </p>
          </div>
        )}

        {mode === MODE_MULTIPLAYER && <OnlineSetupView onStartMatch={handleOnlineMatchStart} />}

        {/* Action Button for Local or AI */}
        {mode !== MODE_MULTIPLAYER && (
          <Button
            type="button"
            variant="primary"
            onClick={handleStartLocalOrAi}
            className="w-full gap-2 font-bold py-2.5 text-sm"
          >
            <Swords className={ICON_SM} />
            <span>Enter Arena ⚔️</span>
          </Button>
        )}
      </div>
    </Modal>
  );
}
