'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { use2048Engine } from '../hooks/use-2048-engine';
import { use2048Keyboard } from '../hooks/use-2048-keyboard';
import { use2048Swipe } from '../hooks/use-2048-swipe';
import { Game2048Board } from './Game2048Board';
import { Game2048Controls } from './Game2048Controls';
import { Game2048Header } from './Game2048Header';
import { Game2048Overlay } from './Game2048Overlay';
import { Game2048StatsModal } from './Game2048StatsModal';

export function Game2048() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { recordGamePlayed } = usePlayerStore();

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const closeSession = useCallback(
    (won: boolean) => {
      recordGamePlayed(won, 'puzzle');
      if (!currentSession) return;

      const result = endSession(undefined, !won);
      if (result) {
        addRecentSession({
          ...currentSession,
          status: 'completed',
          endedAt: new Date().toISOString(),
        });
      }
    },
    [currentSession, endSession, addRecentSession, recordGamePlayed],
  );

  const handleWin = useCallback(
    (_score: number, _highestTile: number) => {
      closeSession(true);
    },
    [closeSession],
  );

  const handleGameOver = useCallback(
    (_score: number, _highestTile: number) => {
      closeSession(false);
    },
    [closeSession],
  );

  const { state, stats, controls } = use2048Engine({
    onWin: handleWin,
    onGameOver: handleGameOver,
  });

  // Keyboard controls
  use2048Keyboard({
    onMove: controls.move,
    onUndo: controls.undo,
    onRestart: controls.restart,
    enabled: state.status === 'playing' || state.status === 'over',
  });

  // Mobile Touch Swipe controls
  const swipeRef = use2048Swipe<HTMLDivElement>({
    onMove: controls.move,
    enabled: state.status === 'playing',
  });

  // Link board ref to swipeRef
  const setBoardAndSwipeRef = useCallback(
    (node: HTMLDivElement | null) => {
      boardRef.current = node;
      swipeRef.current = node;
    },
    [swipeRef],
  );

  // Auto-focus board on mount for immediate keyboard readiness
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 px-2 sm:px-4 py-2">
      {/* Navigation Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold uppercase tracking-wider">
            Puzzle
          </span>
        </div>
        <div className="w-20" />
      </div>

      {/* Main Game Stage */}
      <div className="flex flex-col items-center gap-4 w-full">
        <Game2048Header
          score={state.score}
          bestScore={state.bestScore}
          lastScoreGain={state.lastScoreGain}
          moveCount={state.moveCount}
          canUndo={state.undoStack.length > 0}
          onUndo={controls.undo}
          onRestart={controls.restart}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* 2048 Arena & Overlays */}
        <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square flex items-center justify-center">
          <Game2048Board tiles={state.tiles} containerRef={setBoardAndSwipeRef} />

          <Game2048Overlay
            status={state.status}
            score={state.score}
            highestTile={state.highestTile}
            canUndo={state.undoStack.length > 0}
            onContinue={controls.continuePlaying}
            onRestart={controls.restart}
            onUndo={controls.undo}
          />
        </div>

        {/* Mobile / Screen Reader Controls & Legend */}
        <Game2048Controls onMove={controls.move} disabled={state.status !== 'playing'} />
      </div>

      {/* Records & Stats Modal */}
      <Game2048StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />
    </div>
  );
}
