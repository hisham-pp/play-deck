'use client';

import {
  BarChart2,
  Bot,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import type { PongDifficulty, PongMode, PongState } from '../engine/pong-types';

interface PongControlsProps {
  state: PongState;
  onPauseToggle: () => void;
  onRestart: () => void;
  onModeChange: (mode: PongMode) => void;
  onDifficultyChange: (diff: PongDifficulty) => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export function PongControls({
  state,
  onPauseToggle,
  onRestart,
  onModeChange,
  onDifficultyChange,
  onOpenSettings,
  onOpenStats,
}: PongControlsProps) {
  const { soundEnabled, toggleSound } = usePreferencesStore();
  const { status, config } = state;

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-raised/80 backdrop-blur-sm border border-surface-border rounded-xl">
      {/* Mode & Difficulty Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mode Tabs */}
        <div className="flex items-center p-1 bg-surface-overlay rounded-lg border border-surface-border/80">
          <button
            type="button"
            onClick={() => onModeChange('single-player')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              config.mode === 'single-player'
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>vs AI</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('local-2p')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              config.mode === 'local-2p'
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Local 2P</span>
          </button>
        </div>

        {/* Difficulty Selector (when in Single Player) */}
        {config.mode === 'single-player' && (
          <div className="flex items-center p-1 bg-surface-overlay rounded-lg border border-surface-border/80 text-xs font-mono">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onDifficultyChange(diff)}
                className={`px-2.5 py-1 rounded capitalize transition-all cursor-pointer ${
                  config.difficulty === diff
                    ? 'bg-deck-700 text-amber-400 font-bold'
                    : 'text-deck-400 hover:text-deck-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Pause / Play */}
        <button
          type="button"
          onClick={onPauseToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-overlay hover:bg-deck-700 text-deck-200 hover:text-white border border-surface-border text-xs font-semibold transition-colors cursor-pointer"
          title={status === 'playing' ? 'Pause (Space)' : 'Resume (Space)'}
        >
          {status === 'playing' ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </button>

        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-overlay hover:bg-deck-700 text-deck-200 hover:text-white border border-surface-border text-xs font-semibold transition-colors cursor-pointer"
          title="Restart Match (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restart</span>
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => void toggleSound()}
          className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-surface-overlay hover:bg-deck-700 text-amber-400 border-surface-border'
              : 'bg-surface-overlay text-deck-500 border-surface-border/60 hover:text-deck-300'
          }`}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings Modal */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-surface-overlay hover:bg-deck-700 text-deck-200 hover:text-white border border-surface-border text-xs transition-colors cursor-pointer"
          title="Game Settings"
          aria-label="Game Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Stats Modal */}
        <button
          type="button"
          onClick={onOpenStats}
          className="p-2 rounded-lg bg-surface-overlay hover:bg-deck-700 text-deck-200 hover:text-white border border-surface-border text-xs transition-colors cursor-pointer"
          title="View Statistics"
          aria-label="View Statistics"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
