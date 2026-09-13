'use client';

import { Bot, Sparkles, Swords, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DISC_RED,
  DISC_YELLOW,
  MODE_LOCAL_2P,
  MODE_SINGLE,
} from '../engine/connect-four-constants';
import type { AIDifficulty, ConnectFourDisc, GameMode } from '../types/connect-four.types';

export interface ConnectFourSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  currentDifficulty: AIDifficulty;
  currentHumanDisc: ConnectFourDisc;
  onStartMatch: (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    humanDisc: ConnectFourDisc;
  }) => void;
}

const BTN_TYPE = 'button';

export function ConnectFourSetupModal({
  isOpen,
  onClose,
  currentMode,
  currentDifficulty,
  currentHumanDisc,
  onStartMatch,
}: ConnectFourSetupModalProps) {
  const [mode, setMode] = useState<GameMode>(currentMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [humanDisc, setHumanDisc] = useState<ConnectFourDisc>(currentHumanDisc);

  const handleStart = () => {
    onStartMatch({ mode, difficulty, humanDisc });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Four Match Setup"
      description="Select game mode and preferences before dropping into the arena."
      size="md"
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Mode Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-deck-400 uppercase tracking-wider font-display">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-raised border border-surface-border">
            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_LOCAL_2P)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg text-xs font-bold transition-all',
                mode === MODE_LOCAL_2P
                  ? 'bg-amber-500 text-deck-950 shadow-sm'
                  : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
              )}
            >
              <Users className="w-4 h-4" />
              <span>Local 2-Player</span>
              <span className="text-[10px] font-normal opacity-80">Pass & Play</span>
            </button>

            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_SINGLE)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg text-xs font-bold transition-all',
                mode === MODE_SINGLE
                  ? 'bg-amber-500 text-deck-950 shadow-sm'
                  : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
              )}
            >
              <Bot className="w-4 h-4" />
              <span>VS Deck AI</span>
              <span className="text-[10px] font-normal opacity-80">Single Player</span>
            </button>
          </div>
        </div>

        {/* AI Options (only visible if single player) */}
        {mode === MODE_SINGLE && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-raised border border-surface-border animate-in fade-in duration-200">
            <label className="text-xs font-semibold text-deck-400 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Difficulty</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: DIFFICULTY_EASY, label: 'Easy', desc: 'Random' },
                { id: DIFFICULTY_MEDIUM, label: 'Medium', desc: 'Tactical' },
                { id: DIFFICULTY_HARD, label: 'Hard', desc: 'Minimax' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type={BTN_TYPE}
                  onClick={() => setDifficulty(diff.id as AIDifficulty)}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-center transition-all',
                    difficulty === diff.id
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 font-bold'
                      : 'border-surface-border text-deck-400 hover:text-white hover:bg-surface-overlay',
                  )}
                >
                  <div className="text-xs">{diff.label}</div>
                  <div className="text-[10px] text-deck-500">{diff.desc}</div>
                </button>
              ))}
            </div>

            {/* Starting Disc Choice */}
            <div className="mt-2 pt-2 border-t border-surface-border/60">
              <label className="text-[11px] font-semibold text-deck-400 uppercase tracking-wider block mb-1.5">
                Play As
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type={BTN_TYPE}
                  onClick={() => setHumanDisc(DISC_RED)}
                  className={cn(
                    'py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all',
                    humanDisc === DISC_RED
                      ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                      : 'border-surface-border text-deck-400 hover:bg-surface-overlay',
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Red (First)</span>
                </button>
                <button
                  type={BTN_TYPE}
                  onClick={() => setHumanDisc(DISC_YELLOW)}
                  className={cn(
                    'py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all',
                    humanDisc === DISC_YELLOW
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                      : 'border-surface-border text-deck-400 hover:bg-surface-overlay',
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Yellow (Second)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            className="flex items-center gap-1.5"
          >
            <Swords className="w-4 h-4" />
            <span>Start Match</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
