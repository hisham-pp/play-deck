import { Sparkles, Trophy, Undo2, RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import type { Game2048Status } from '../types/2048.types';

interface Game2048OverlayProps {
  status: Game2048Status;
  score: number;
  highestTile: number;
  canUndo: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onUndo: () => void;
}

export function Game2048Overlay({
  status,
  score,
  highestTile,
  canUndo,
  onContinue,
  onRestart,
  onUndo,
}: Game2048OverlayProps) {
  if (status === 'playing') {
    return null;
  }

  const isWon = status === 'won';

  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-deck-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
      {isWon ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_24px_rgba(245,158,11,0.5)]">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <span>2048 REACHED!</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h3>

          <p className="text-xs sm:text-sm text-deck-300 mt-1 max-w-xs">
            You forged the 2048 tile! Keep going for higher scores or claim victory.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <Button variant="primary" size="md" onClick={onContinue}>
              Keep Going
            </Button>
            <Button variant="outline" size="md" onClick={onRestart}>
              New Game
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_24px_rgba(244,63,94,0.4)]">
            <RotateCcw className="w-8 h-8" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
            GAME OVER
          </h3>

          <p className="text-xs sm:text-sm text-deck-400 mt-1 max-w-xs">
            No remaining moves available on the grid.
          </p>

          <div className="flex items-center gap-4 mt-3 px-4 py-2 rounded-xl bg-surface-base border border-surface-border text-xs">
            <div>
              <span className="text-deck-500 block">Score</span>
              <span className="font-mono font-bold text-white text-sm">{score}</span>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div>
              <span className="text-deck-500 block">Top Tile</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{highestTile}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button variant="primary" size="md" onClick={onRestart}>
              Try Again
            </Button>
            {canUndo && (
              <Button
                variant="outline"
                size="md"
                onClick={onUndo}
                className="flex items-center gap-1.5"
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo</span>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
