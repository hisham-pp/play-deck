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

function useFullscreen(target: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  React.useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [target]);

  const toggle = useCallback(() => {
    const el = target.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void el.requestFullscreen?.().catch(() => undefined);
    }
  }, [target]);

  return { isFullscreen, toggle };
}

export function FlappyArcadeGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(stageRef);

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
    onToggleFullscreen: fullscreen.toggle,
  });

  const handleTogglePause = () => {
    if (state.status === 'playing') {
      pauseGame();
    } else if (state.status === 'paused') {
      resumeGame();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-2 md:px-4 py-3">
      {/* Top Breadcrumb & Metadata Navigation (hidden in fullscreen) */}
      {!fullscreen.isFullscreen && (
        <div className="flex items-center justify-between w-full max-w-xl md:max-w-2xl mb-3 px-1">
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
      )}

      {/* Main Game Stage Container */}
      <div
        ref={stageRef}
        className={`relative flex flex-col items-center justify-center w-full select-none overflow-hidden transition-all ${
          fullscreen.isFullscreen
            ? 'fixed inset-0 z-50 h-screen w-screen bg-[#090d16] p-2 md:p-4'
            : 'max-w-xl md:max-w-2xl rounded-2xl border border-deck-border/60 bg-[#090d16] p-2 md:p-3 shadow-2xl'
        }`}
      >
        <FlappyHUD
          state={state}
          soundEnabled={soundEnabled}
          isFullscreen={fullscreen.isFullscreen}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onTogglePause={handleTogglePause}
          onToggleFullscreen={fullscreen.toggle}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        <div
          className={`relative w-full flex items-center justify-center ${
            fullscreen.isFullscreen
              ? 'h-[calc(100vh-76px)]'
              : 'h-[min(76vh,680px)] md:h-[min(84vh,820px)]'
          }`}
        >
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
        {!fullscreen.isFullscreen && (
          <div className="flex items-center justify-between w-full max-w-xl md:max-w-2xl mt-2.5 px-2 text-[11px] text-deck-400 font-medium">
            <span>[SPACE] or [TAP] to Fly</span>
            <span>[F] Fullscreen</span>
            <span>Avoid Conduits & Boundaries</span>
          </div>
        )}
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
