'use client';

import React from 'react';
import { Modal } from '@playdeck/ui';
import { WINNING_SCORE_OPTIONS } from '../engine/pong-constants';
import type { PongDifficulty, PongMode, PongState } from '../engine/pong-types';

interface PongSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PongState;
  onModeChange: (mode: PongMode) => void;
  onDifficultyChange: (diff: PongDifficulty) => void;
  onWinningScoreChange: (score: number) => void;
}

export function PongSettingsModal({
  isOpen,
  onClose,
  state,
  onModeChange,
  onDifficultyChange,
  onWinningScoreChange,
}: PongSettingsModalProps) {
  const { config } = state;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pong Match Settings">
      <div className="flex flex-col gap-5 py-2">
        {/* Game Mode */}
        <div>
          <label className="text-xs font-semibold text-deck-300 uppercase tracking-wider block mb-2">
            Game Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onModeChange('single-player')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                config.mode === 'single-player'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
                  : 'bg-surface-raised border-surface-border text-deck-400 hover:text-white'
              }`}
            >
              vs AI
            </button>
            <button
              type="button"
              onClick={() => onModeChange('local-2p')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                config.mode === 'local-2p'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
                  : 'bg-surface-raised border-surface-border text-deck-400 hover:text-white'
              }`}
            >
              Local 2P
            </button>
            <button
              type="button"
              onClick={() => onModeChange('online')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                config.mode === 'online'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
                  : 'bg-surface-raised border-surface-border text-deck-400 hover:text-white'
              }`}
            >
              Online 1v1
            </button>
          </div>
        </div>

        {/* AI Difficulty (if Single Player) */}
        {config.mode === 'single-player' && (
          <div>
            <label className="text-xs font-semibold text-deck-300 uppercase tracking-wider block mb-2">
              AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDifficultyChange(d)}
                  className={`py-2 px-3 rounded-xl border text-xs capitalize transition-all cursor-pointer ${
                    config.difficulty === d
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
                      : 'bg-surface-raised border-surface-border text-deck-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-deck-400 mt-1.5">
              {config.difficulty === 'easy' && 'Casual pace with generous reaction delays.'}
              {config.difficulty === 'medium' && 'Balanced rallies tracking approaching balls.'}
              {config.difficulty === 'hard' && 'Advanced physics prediction with angle deflection.'}
            </p>
          </div>
        )}

        {/* Target Winning Score */}
        <div>
          <label className="text-xs font-semibold text-deck-300 uppercase tracking-wider block mb-2">
            Target Score (First to reach wins)
          </label>
          <div className="grid grid-cols-4 gap-2 font-mono">
            {WINNING_SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => onWinningScoreChange(score)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  config.winningScore === score
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                    : 'bg-surface-raised border-surface-border text-deck-400 hover:text-white'
                }`}
              >
                {score} pts
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-surface-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-deck-950 font-bold text-xs shadow-arcade cursor-pointer transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
