import { RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MODE_LOCAL_2P, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';
import { SinglePlayerOptions } from './SinglePlayerOptions';

interface TicTacToeControlsProps {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayerMark: PlayerMark;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onHumanMarkChange: (mark: PlayerMark) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
}

const BTN_TYPE = 'button';

export function TicTacToeControls({
  mode,
  aiDifficulty,
  humanPlayerMark,
  onModeChange,
  onDifficultyChange,
  onHumanMarkChange,
  onResetRound,
  onResetMatch,
}: TicTacToeControlsProps) {
  return (
    <div className="w-full max-w-[min(100%,_420px)] mx-auto flex flex-col gap-3">
      {/* 1. Game Mode Selector */}
      <div className="p-1 rounded-xl bg-surface-raised border border-surface-border flex items-center gap-1">
        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_SINGLE)}
          className={cn(
            'flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150',
            mode === MODE_SINGLE
              ? 'bg-amber-500 text-deck-950 shadow-sm font-bold'
              : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vs AI</span>
        </button>

        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_LOCAL_2P)}
          className={cn(
            'flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150',
            mode === MODE_LOCAL_2P
              ? 'bg-amber-500 text-deck-950 shadow-sm font-bold'
              : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Local 2-Player</span>
        </button>
      </div>

      {/* 2. Single Player Options */}
      {mode === MODE_SINGLE && (
        <SinglePlayerOptions
          aiDifficulty={aiDifficulty}
          humanPlayerMark={humanPlayerMark}
          onDifficultyChange={onDifficultyChange}
          onHumanMarkChange={onHumanMarkChange}
        />
      )}

      {/* 3. Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onResetRound}
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs text-deck-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Round (R)</span>
        </Button>

        <Button
          onClick={onResetMatch}
          variant="ghost"
          size="sm"
          className="text-xs text-deck-500 hover:text-deck-300"
        >
          <Trophy className="w-3.5 h-3.5 mr-1" />
          <span>Reset Match</span>
        </Button>
      </div>
    </div>
  );
}
