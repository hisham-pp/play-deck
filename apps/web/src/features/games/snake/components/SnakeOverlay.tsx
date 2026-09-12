'use client';

import { Play, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SnakeGameStatus } from '../types/snake.types';

interface SnakeOverlayProps {
  status: SnakeGameStatus;
  countdown: number;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function SnakeOverlay({
  status,
  countdown,
  score,
  highScore,
  isNewHighScore,
  onStart,
  onResume,
  onRestart,
}: SnakeOverlayProps) {
  if (status === 'playing') return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center animate-fade-in">
      {status === 'idle' && (
        <div className="flex flex-col items-center max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-3 shadow-arcade">
            🐍
          </div>
          <h2 className="text-xl font-bold text-white font-display mb-1">Cyber Snake</h2>
          <p className="text-xs text-deck-400 mb-5 leading-relaxed">
            Eat energy pellets to grow and increase your score. Avoid walls and your own tail.
          </p>
          <Button onClick={onStart} variant="primary" size="lg" className="w-full gap-2">
            <Play className="w-4 h-4 fill-current" />
            <span>Start Game</span>
          </Button>
        </div>
      )}

      {status === 'countdown' && (
        <div className="flex flex-col items-center">
          <span className="text-7xl font-black font-display text-amber-500 animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </span>
          <span className="text-xs text-deck-400 uppercase tracking-widest mt-3 font-semibold">
            Get Ready
          </span>
        </div>
      )}

      {status === 'paused' && (
        <div className="flex flex-col items-center max-w-xs">
          <h3 className="text-xl font-bold text-white font-display mb-4">Game Paused</h3>
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={onResume} variant="primary" size="md" className="gap-2">
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game</span>
            </Button>
            <Button onClick={onRestart} variant="secondary" size="md" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </Button>
          </div>
        </div>
      )}

      {status === 'game-over' && (
        <div className="flex flex-col items-center max-w-xs">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">
            Collision Detected
          </span>
          <h3 className="text-2xl font-black text-white font-display mb-3">GAME OVER</h3>

          <div className="p-4 rounded-xl border border-surface-border bg-surface-raised w-full mb-5 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-deck-400 uppercase">Final Score</span>
              <span className="text-2xl font-mono font-black text-amber-500">{score}</span>
            </div>
            <div className="h-8 w-px bg-surface-border" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-deck-400 uppercase">High Score</span>
              <span className="text-2xl font-mono font-black text-deck-200">{highScore}</span>
            </div>
          </div>

          {isNewHighScore && (
            <div className="mb-4">
              <Badge variant="warning" className="gap-1 px-3 py-1 text-xs">
                <Trophy className="w-3 h-3" />
                <span>New Personal Best!</span>
              </Badge>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            <Button onClick={onRestart} variant="primary" size="lg" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </Button>
            <Link href="/games" className="w-full">
              <Button variant="outline" size="md" className="w-full">
                Back to Games
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
