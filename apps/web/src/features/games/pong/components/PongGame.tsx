'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { GameCategoryBadge, GameStatusBadge } from '@/components/game/GameBadge';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import type { PaddleInput, PongInputs } from '../engine/pong-types';
import { usePongEngine } from '../hooks/use-pong-engine';
import { usePongKeyboard } from '../hooks/use-pong-keyboard';
import { usePongTouch } from '../hooks/use-pong-touch';
import { PongCanvas } from './PongCanvas';
import { PongControls } from './PongControls';
import { PongMobileControls } from './PongMobileControls';
import { PongOverlay } from './PongOverlay';
import { PongScoreboard } from './PongScoreboard';
import { PongSettingsModal } from './PongSettingsModal';
import { PongStatsModal } from './PongStatsModal';

export function PongGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Mobile button override inputs
  const [mobileP1Input, setMobileP1Input] = useState<PaddleInput>({ up: false, down: false });
  const [mobileP2Input, setMobileP2Input] = useState<PaddleInput>({ up: false, down: false });

  // Touch drag state
  const { handleTouchStartOrMove, handleTouchEndOrCancel, getTouchPaddleInput } = usePongTouch();

  const handleGameOver = useCallback(
    (winner: 'left' | 'right') => {
      const won = winner === 'left';
      recordGamePlayed(won, 'arcade');

      if (currentSession && player) {
        const result = endSession(won ? player.id : undefined, !won);
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

  // Hook up keyboard
  const keyboardInputs = usePongKeyboard({
    enabled: !isSettingsOpen && !isStatsOpen,
  });

  // Combine keyboard, touch drag, and mobile buttons
  const combinedInputs: PongInputs = useMemo(() => {
    const touchP1 = getTouchPaddleInput('left');
    const touchP2 = getTouchPaddleInput('right');

    return {
      player1: {
        up: keyboardInputs.player1.up || mobileP1Input.up,
        down: keyboardInputs.player1.down || mobileP1Input.down,
        targetY: touchP1.targetY,
      },
      player2: {
        up: keyboardInputs.player2.up || mobileP2Input.up,
        down: keyboardInputs.player2.down || mobileP2Input.down,
        targetY: touchP2.targetY,
      },
    };
  }, [keyboardInputs, mobileP1Input, mobileP2Input, getTouchPaddleInput]);

  const {
    state,
    stats,
    particles,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setMode,
    setDifficulty,
    setWinningScore,
    refreshStats,
  } = usePongEngine({
    onGameOver: handleGameOver,
    inputs: combinedInputs,
  });

  const handlePauseToggle = useCallback(() => {
    if (state.status === 'playing') {
      pauseGame();
    } else if (state.status === 'paused') {
      resumeGame();
    } else if (state.status === 'ready') {
      startGame();
    }
  }, [state.status, pauseGame, resumeGame, startGame]);

  const handleMobileP1 = useCallback((dir: 'up' | 'down', active: boolean) => {
    setMobileP1Input((prev) => ({
      ...prev,
      [dir]: active,
    }));
  }, []);

  const handleMobileP2 = useCallback((dir: 'up' | 'down', active: boolean) => {
    setMobileP2Input((prev) => ({
      ...prev,
      [dir]: active,
    }));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-2 px-3 select-none">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <GameStatusBadge status="available" label="Ready to Play" />
          <GameCategoryBadge category="arcade" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center flex flex-col items-center gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display">
          Pong
        </h1>
        <p className="text-xs md:text-sm text-deck-400 max-w-md">
          The timeless paddle duel. Deflect the accelerating ball, master angular shots, and
          outrally the AI or your friend.
        </p>
      </div>

      {/* Scoreboard */}
      <PongScoreboard state={state} />

      {/* Court Arena & Canvas */}
      <div className="relative w-full">
        <PongCanvas
          state={state}
          particles={particles}
          onTouchStartOrMove={handleTouchStartOrMove}
          onTouchEndOrCancel={handleTouchEndOrCancel}
        />
        <PongOverlay
          state={state}
          onStart={startGame}
          onResume={resumeGame}
          onRestart={() => restartGame()}
        />
      </div>

      {/* Mobile Touch Directional Controls */}
      <PongMobileControls
        mode={state.config.mode}
        onP1Move={handleMobileP1}
        onP2Move={handleMobileP2}
      />

      {/* Controls & Toolbar */}
      <PongControls
        state={state}
        onPauseToggle={handlePauseToggle}
        onRestart={() => restartGame()}
        onModeChange={setMode}
        onDifficultyChange={setDifficulty}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Settings Modal */}
      <PongSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onModeChange={setMode}
        onDifficultyChange={setDifficulty}
        onWinningScoreChange={setWinningScore}
      />

      {/* Stats Modal */}
      <PongStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onStatsReset={refreshStats}
      />
    </div>
  );
}
