'use client';

import React, { useCallback } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useSnakeEngine } from '../hooks/use-snake-engine';
import { useSnakeInput } from '../hooks/use-snake-input';
import { SnakeBoard } from './SnakeBoard';
import { SnakeControls } from './SnakeControls';
import { SnakeOverlay } from './SnakeOverlay';
import { SnakeScoreboard } from './SnakeScoreboard';

export function SnakeGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

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

  const { state, stats, startGame, pauseGame, resumeGame, restartGame, changeDirection } =
    useSnakeEngine(handleGameOver);

  const { handleTouchStart, handleTouchEnd } = useSnakeInput({
    status: state.status,
    onDirectionChange: changeDirection,
    onPause: pauseGame,
    onResume: resumeGame,
    onStart: startGame,
    onRestart: restartGame,
  });

  const effectiveHighScore = Math.max(state.highScore, stats?.highScore ?? 0);

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 py-2 px-4 focus:outline-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <SnakeScoreboard score={state.score} highScore={effectiveHighScore} speedMs={state.speedMs} />

      <div className="relative w-full aspect-square max-w-[min(100%,_640px,_60vh)] mx-auto">
        <SnakeBoard
          snake={state.snake}
          food={state.food}
          gridSize={state.gridSize}
          direction={state.direction}
          status={state.status}
        />
        <SnakeOverlay
          status={state.status}
          countdown={state.countdown}
          score={state.score}
          highScore={effectiveHighScore}
          isNewHighScore={state.isNewHighScore}
          onStart={startGame}
          onResume={resumeGame}
          onRestart={restartGame}
        />
      </div>

      <SnakeControls
        status={state.status}
        onDirectionChange={changeDirection}
        onPause={pauseGame}
        onResume={resumeGame}
        onRestart={restartGame}
      />
    </div>
  );
}
