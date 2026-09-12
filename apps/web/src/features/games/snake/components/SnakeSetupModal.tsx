'use client';

import { Gauge, Play, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { DIFFICULTY_SPEEDS } from '../engine/snake-constants';
import type { SnakeDifficulty } from '../types/snake.types';

export interface SnakeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: SnakeDifficulty;
  currentGridSize: number;
  onStartGame: (config: {
    difficulty: SnakeDifficulty;
    gridSize: number;
    baseSpeedMs: number;
  }) => void;
}

const BTN_TYPE = 'button';
const ICON_SM = 'w-4 h-4';

interface DifficultyOption {
  id: SnakeDifficulty;
  label: string;
  speed: string;
  icon: typeof Sparkles;
  color: string;
}

const DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'easy',
    label: 'Casual',
    speed: 'Relaxed (175ms)',
    icon: Sparkles,
    color: 'text-emerald-400',
  },
  { id: 'normal', label: 'Classic', speed: 'Arcade (140ms)', icon: Gauge, color: 'text-amber-400' },
  { id: 'hard', label: 'Fast', speed: 'Agile (105ms)', icon: Zap, color: 'text-sky-400' },
  {
    id: 'insane',
    label: 'Insane',
    speed: 'Reflex (75ms)',
    icon: ShieldAlert,
    color: 'text-rose-400',
  },
];

const GRID_SIZES = [
  { size: 16, label: '16x16', desc: 'Compact / Fast' },
  { size: 20, label: '20x20', desc: 'Classic Standard' },
  { size: 24, label: '24x24', desc: 'Expansive Arena' },
];

export function SnakeSetupModal({
  isOpen,
  onClose,
  currentDifficulty,
  currentGridSize,
  onStartGame,
}: SnakeSetupModalProps) {
  const [difficulty, setDifficulty] = useState<SnakeDifficulty>(currentDifficulty);
  const [gridSize, setGridSize] = useState<number>(currentGridSize);

  const handleStart = () => {
    onStartGame({
      difficulty,
      gridSize,
      baseSpeedMs: DIFFICULTY_SPEEDS[difficulty],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Snake Run Setup"
      description="Select speed difficulty and arena size before entering the arena."
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Difficulty Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-deck-400 uppercase tracking-wider font-mono">
            Speed Difficulty
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTIES.map((diff) => {
              const Icon = diff.icon;
              const isSelected = difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type={BTN_TYPE}
                  onClick={() => setDifficulty(diff.id)}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                      : 'bg-surface-raised border-surface-border hover:bg-surface-overlay text-deck-400 hover:text-white',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn(ICON_SM, diff.color)} />
                    <span className="text-xs font-bold text-deck-100">{diff.label}</span>
                  </div>
                  <span className="text-[11px] text-deck-400 font-mono">{diff.speed}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Size Selection */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-border/60">
          <span className="text-[11px] font-bold text-deck-400 uppercase tracking-wider font-mono">
            Arena Dimensions
          </span>
          <div className="grid grid-cols-3 gap-2">
            {GRID_SIZES.map((g) => (
              <button
                key={g.size}
                type={BTN_TYPE}
                onClick={() => setGridSize(g.size)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all',
                  gridSize === g.size
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                    : 'bg-surface-raised border-surface-border hover:bg-surface-overlay text-deck-400 hover:text-white',
                )}
              >
                <span className="text-xs font-mono font-black">{g.label}</span>
                <span className="text-[10px] text-deck-500 mt-0.5">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button
          type={BTN_TYPE}
          variant="primary"
          onClick={handleStart}
          className="w-full gap-2 font-bold py-2.5 text-sm mt-1"
        >
          <Play className={`${ICON_SM} fill-current`} />
          <span>Enter Arena 🐍</span>
        </Button>
      </div>
    </Modal>
  );
}
