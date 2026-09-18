'use client';

import { BarChart3, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import type { FlappyGameState } from '../engine/flappy-types';

interface FlappyHUDProps {
  state: FlappyGameState;
  soundEnabled: boolean;
  isFullscreen?: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onOpenStats: () => void;
  onToggleFullscreen?: () => void;
}

export function FlappyHUD({
  state,
  soundEnabled,
  isFullscreen = false,
  onToggleSound,
  onTogglePause,
  onOpenStats,
  onToggleFullscreen,
}: FlappyHUDProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-xl md:max-w-2xl px-3 py-2 mb-2 bg-[#111827]/85 backdrop-blur border border-deck-border/70 rounded-xl">
      {/* Left: Score & High Score */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-deck-400">
            Score
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono leading-none">
            {state.score}
          </span>
        </div>

        <div className="h-6 w-px bg-deck-border/60" />

        <div className="flex flex-col">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-deck-400">
            Best
          </span>
          <span className="text-sm font-bold text-gray-300 font-mono leading-none">
            {state.highScore}
          </span>
        </div>

        {state.difficulty.scoreMultiplier > 1 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded animate-pulse">
            2X SPD
          </span>
        )}
      </div>

      {/* Right: Controls (Stats, Sound, Pause) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenStats}
          className="p-2 text-deck-400 hover:text-deck-100 hover:bg-deck-700/60 rounded-lg transition-colors"
          title="Flight Records"
          aria-label="View Flight Records"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="p-2 text-deck-400 hover:text-deck-100 hover:bg-deck-700/60 rounded-lg transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {state.status === 'playing' && (
          <button
            type="button"
            onClick={onTogglePause}
            className="p-2 text-deck-400 hover:text-deck-100 hover:bg-deck-700/60 rounded-lg transition-colors"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {state.status === 'paused' && (
          <button
            type="button"
            onClick={onTogglePause}
            className="p-2 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            title="Resume Game"
            aria-label="Resume Game"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 text-deck-400 hover:text-deck-100 hover:bg-deck-700/60 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
