'use client';

import { Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { GameDefinition, GameSession } from '@playdeck/game-types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface GameStageProps {
  game: GameDefinition;
  status: 'idle' | 'running' | 'over';
  currentSession: GameSession | null;
  onStart: () => void;
  onScoreChange: (delta: number) => void;
  onEnd: (won: boolean) => void;
}

const FLEX_EXPAND = 'flex-1';

export function GameStage({
  game,
  status,
  currentSession,
  onStart,
  onScoreChange,
  onEnd,
}: GameStageProps) {
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-4">
          {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
        </div>
        <h3 className="text-lg font-bold text-deck-900 dark:text-white mb-2 font-display">
          Ready for Launch
        </h3>
        <p className="text-xs text-deck-500 mb-6 leading-relaxed">
          Plug-and-play game shell ready. Session state will be tracked across your local Dexie
          IndexedDB instance.
        </p>

        {game.status === 'available' ? (
          <Button onClick={onStart} variant="primary" size="lg" className="w-full gap-2">
            <Play className="w-4 h-4 fill-current" />
            <span>Play Locally</span>
          </Button>
        ) : (
          <div className="p-3 rounded-md bg-surface-overlay border border-surface-border text-xs text-deck-400">
            This game is scheduled for release in an upcoming update.
          </div>
        )}
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="flex flex-col items-center max-w-md w-full">
        <div className="p-6 rounded-lg border border-surface-border bg-surface-raised w-full mb-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <span className="text-xs font-semibold text-deck-400 uppercase">
              Turn Orchestration
            </span>
            <Badge variant="success">Active Match</Badge>
          </div>
          <div className="text-center py-6">
            <div className="text-5xl mb-2">🎮</div>
            <p className="text-sm font-semibold text-deck-800 dark:text-deck-200 mb-1">
              Local Session in Progress
            </p>
            <p className="text-xs text-deck-500">
              Session ID: <span className="font-mono">{currentSession?.id}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => onScoreChange(10)}
              className="p-2 text-xs rounded bg-surface-overlay hover:bg-surface-border text-deck-700 dark:text-deck-300 font-medium transition-colors"
            >
              +10 Points
            </button>
            <button
              onClick={() => onScoreChange(-5)}
              className="p-2 text-xs rounded bg-surface-overlay hover:bg-surface-border text-deck-700 dark:text-deck-300 font-medium transition-colors"
            >
              -5 Points
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button onClick={() => onEnd(true)} variant="primary" size="md" className={FLEX_EXPAND}>
            Complete Match (Win)
          </Button>
          <Button onClick={() => onEnd(false)} variant="outline" size="md" className={FLEX_EXPAND}>
            End (Draw/Exit)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-sm">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-2xl mb-4">
        🏆
      </div>
      <h3 className="text-xl font-bold text-deck-900 dark:text-white mb-1 font-display">
        Session Finished
      </h3>
      <p className="text-xs text-deck-500 mb-6">
        Match saved to your personal library via IndexedDB.
      </p>
      <div className="flex items-center gap-3 w-full">
        <Button onClick={onStart} variant="primary" size="md" className={FLEX_EXPAND}>
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Play Again
        </Button>
        <Link href="/library" className={FLEX_EXPAND}>
          <Button variant="secondary" size="md" className="w-full">
            View Library
          </Button>
        </Link>
      </div>
    </div>
  );
}
