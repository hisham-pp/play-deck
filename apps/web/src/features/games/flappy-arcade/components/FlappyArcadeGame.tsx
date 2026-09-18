'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { GameCategoryBadge, GameStatusBadge } from '@/components/game/GameBadge';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useFlappyControls } from '../hooks/use-flappy-controls';
import { useFlappyEngine } from '../hooks/use-flappy-engine';
import { FlappyCanvas } from './FlappyCanvas';
import { FlappyGameOverModal } from './FlappyGameOverModal';
import { FlappyHUD } from './FlappyHUD';
import { FlappyStatsModal } from './FlappyStatsModal';

export function FlappyArcadeGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const handleGameOver = useCallback(
    (score: number) => {
      // Record game in player profile
      recordGamePlayed(score >= 10, 'arcade');

      if (currentSession && player) {
        const result = endSession(score >= 10 ? player.id : undefined, score < 10);
        if (result) {
          addRecentSession({
            ...currentSession,
            status: 'completed',
            endedAt: new Date().toISOString(),
          });
        }
      }
    },
    [recordGamePlayed, currentSession, player, endSession, addRecentSession],
  );

  const { state, stats, flap, pauseGame, resumeGame, restartGame, refreshStats } = useFlappyEngine({
    onGameOver: handleGameOver,
    soundEnabled,
  });

  // Enable keyboard controls when modals are closed
  useFlappyControls({
    enabled: !isStatsOpen,
    onFlap: flap,
  });

  const handleTogglePause = () => {
    if (state.status === 'playing') {
      pauseGame();
    } else if (state.status === 'paused') {
      resumeGame();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-3">
      {/* Top Breadcrumb & Metadata Navigation */}
      <div className="flex items-center justify-between w-full max-w-[480px] mb-3">
        <Link
          href="/games"
          className="flex items-center gap-1.5 text-xs font-semibold text-deck-400 hover:text-deck-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </Link>

        <div className="flex items-center gap-2">
          <GameCategoryBadge category="arcade" />
          <GameStatusBadge status="available" />
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div className="relative flex flex-col items-center w-full">
        <FlappyHUD
          state={state}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onTogglePause={handleTogglePause}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        <div className="relative w-full flex justify-center">
          <FlappyCanvas state={state} onFlap={flap} />

          {state.status === 'game-over' && (
            <FlappyGameOverModal
              score={state.score}
              highScore={state.highScore}
              onRestart={restartGame}
            />
          )}
        </div>

        {/* Instructions Footer */}
        <div className="flex items-center justify-between w-full max-w-[480px] mt-3 px-2 text-[11px] text-deck-400 font-medium">
          <span>[SPACE] or [TAP] to Fly</span>
          <span>Avoid Conduits & Boundaries</span>
        </div>
      </div>

      {/* Statistics Modal */}
      <FlappyStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onStatsReset={refreshStats}
      />
    </div>
  );
}
