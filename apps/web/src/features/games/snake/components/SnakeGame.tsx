'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useSnakeEngine } from '../hooks/use-snake-engine';
import { useSnakeInput } from '../hooks/use-snake-input';
import type { SnakeDifficulty } from '../types/snake.types';
import { SnakeActionsCard } from './SnakeActionsCard';
import { SnakeArenaBoard } from './SnakeArenaBoard';
import { SnakeDPad } from './SnakeDPad';
import { SnakeInfoCard } from './SnakeInfoCard';
import { SnakePlayerCard } from './SnakePlayerCard';
import { SnakeSetupModal } from './SnakeSetupModal';

export function SnakeGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [theme, setTheme] = useState<'grass' | 'arcade'>('grass');

  const handleGameOver = useCallback(
    (_finalScore: number) => {
      recordGamePlayed(false, 'arcade');
      if (currentSession && player) {
        const result = endSession(undefined, false);
        if (result) {
          addRecentSession({
            ...currentSession,
            status: 'completed',
            endedAt: new Date().toISOString(),
          });
        }
      }
    },
    [currentSession, player, endSession, addRecentSession, recordGamePlayed],
  );

  const {
    state,
    stats,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    changeDirection,
    configureGame,
  } = useSnakeEngine(handleGameOver);

  const { handleTouchStart, handleTouchEnd } = useSnakeInput({
    status: state.status,
    onDirectionChange: changeDirection,
    onPause: pauseGame,
    onResume: resumeGame,
    onStart: startGame,
    onRestart: restartGame,
  });

  const handleSetupConfirm = (config: {
    difficulty: SnakeDifficulty;
    gridSize: number;
    baseSpeedMs: number;
  }) => {
    configureGame(config.gridSize, config.baseSpeedMs, config.difficulty);
    restartGame();
  };

  const effectiveHighScore = Math.max(state.highScore, stats?.highScore ?? 0);

  return (
    <div
      className="w-full max-w-6xl mx-auto flex flex-col items-center gap-3 py-1 px-3 focus:outline-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => setTheme('grass')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'grass'
                ? 'bg-[#a2d149] text-slate-900 shadow-sm font-semibold'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            🌿 Classic Grass
          </button>
          <button
            type="button"
            onClick={() => setTheme('arcade')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'arcade'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm font-semibold'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            ⚡ Cyber Dark
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-[200px_minmax(0,1fr)_200px] lg:grid-cols-[220px_minmax(0,1fr)_220px] items-start justify-center gap-3 lg:gap-5">
        {/* PILOT CARD (Left Top on Desktop, Top-Left on Mobile) */}
        <div className="col-span-1 md:col-start-1 md:row-start-1 flex justify-center">
          <SnakePlayerCard status={state.status} highScore={effectiveHighScore} />
        </div>

        {/* RUN STATS (Left Bottom on Desktop, Top-Right on Mobile) */}
        <div className="col-span-1 md:col-start-1 md:row-start-2 flex justify-center">
          <SnakeInfoCard
            score={state.score}
            highScore={effectiveHighScore}
            speedMs={state.speedMs}
            difficulty={state.difficulty}
            gridSize={state.gridSize}
          />
        </div>

        {/* CENTER ARENA: Max-Height Board */}
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 self-center flex items-center justify-center">
          <SnakeArenaBoard
            snake={state.snake}
            food={state.food}
            gridSize={state.gridSize}
            direction={state.direction}
            status={state.status}
            speedMs={state.speedMs}
            countdown={state.countdown}
            score={state.score}
            highScore={effectiveHighScore}
            isNewHighScore={state.isNewHighScore}
            theme={theme}
            onStart={startGame}
            onResume={resumeGame}
            onRestart={restartGame}
          />
        </div>

        {/* ACTIONS (Right Column on Desktop, Bottom on Mobile) */}
        <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 flex flex-col gap-3 justify-center">
          <SnakeActionsCard
            status={state.status}
            onOpenSetup={() => setIsSetupOpen(true)}
            onPause={pauseGame}
            onResume={resumeGame}
            onRestart={restartGame}
          />
          <SnakeDPad status={state.status} onDirectionChange={changeDirection} />
        </div>
      </div>

      <SnakeSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentDifficulty={state.difficulty}
        currentGridSize={state.gridSize}
        onStartGame={handleSetupConfirm}
      />
    </div>
  );
}
