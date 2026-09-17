import { RotateCcw, Trophy, Undo2, Award } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@playdeck/ui';

interface Game2048HeaderProps {
  score: number;
  bestScore: number;
  lastScoreGain: number;
  moveCount: number;
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onOpenStats: () => void;
}

export function Game2048Header({
  score,
  bestScore,
  lastScoreGain,
  moveCount,
  canUndo,
  onUndo,
  onRestart,
  onOpenStats,
}: Game2048HeaderProps) {
  const [floatingScore, setFloatingScore] = useState<number | null>(null);

  useEffect(() => {
    if (lastScoreGain > 0) {
      setFloatingScore(lastScoreGain);
      const timer = setTimeout(() => setFloatingScore(null), 600);
      return () => clearTimeout(timer);
    }
  }, [lastScoreGain]);

  return (
    <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col gap-3">
      {/* Top Banner: Title & Score Pills */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <span>2048</span>
          </h2>
          <p className="text-[11px] text-deck-400 font-medium">Join tiles, reach 2048!</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Current Score Pill */}
          <div className="relative flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] px-3 py-1.5 rounded-xl bg-surface-raised border border-surface-border shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-deck-400">
              Score
            </span>
            <span className="text-base sm:text-lg font-black font-display text-white">{score}</span>

            {/* Floating +Score animation */}
            {floatingScore && (
              <span className="absolute -top-3 text-xs font-black text-amber-400 animate-bounce duration-500 pointer-events-none">
                +{floatingScore}
              </span>
            )}
          </div>

          {/* Best Score Pill */}
          <div className="flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] px-3 py-1.5 rounded-xl bg-surface-raised border border-amber-500/30 shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5" />
              Best
            </span>
            <span className="text-base sm:text-lg font-black font-display text-amber-400">
              {bestScore}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-bar: Moves counter & Quick Actions */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-deck-400">
          <span className="px-2 py-0.5 rounded bg-deck-900 border border-deck-800 text-deck-300 font-mono">
            {moveCount} moves
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenStats}
            title="View Statistics"
            className="h-8 px-2 text-deck-400 hover:text-white"
          >
            <Award className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo Move (U / Ctrl+Z)"
            className="h-8 px-2.5 text-xs text-deck-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            title="Restart Game (R)"
            className="h-8 px-2.5 text-xs text-deck-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
