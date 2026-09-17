'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useBallBounceGame } from '../hooks/use-ball-bounce-game';
import { useFullscreen } from '../hooks/use-fullscreen';
import { BallBounceHud } from './BallBounceHud';
import { BallBounceOverlay } from './BallBounceOverlay';

/** Locks page scrolling / pull-to-refresh while the full-screen game is mounted. */
function useScrollLock() {
  useEffect(() => {
    const { body, documentElement: html } = document;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      overscroll: html.style.overscrollBehavior,
    };
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.overscroll;
    };
  }, []);
}

export function BallBounceGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { recordGamePlayed } = usePlayerStore();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleGameOver = useCallback(() => {
    void recordGamePlayed(false, 'arcade');
    if (!currentSession) return;
    const result = endSession(undefined, false);
    if (result) {
      addRecentSession({
        ...currentSession,
        status: 'completed',
        endedAt: new Date().toISOString(),
      });
    }
  }, [currentSession, endSession, addRecentSession, recordGamePlayed]);

  const { stageRef, canvasRef, hud, stats, controls } = useBallBounceGame({
    onGameOver: handleGameOver,
  });
  const fullscreen = useFullscreen(rootRef);
  useScrollLock();

  const togglePause = useCallback(() => {
    if (hud.status === 'paused') controls.resume();
    else controls.pause();
  }, [hud.status, controls]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col bg-[#05070d] text-white select-none overscroll-none"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <BallBounceHud hud={hud} onTogglePause={togglePause} fullscreen={fullscreen} />

      <div
        ref={stageRef}
        className={cn(
          'relative flex-1 min-h-0 touch-none',
          hud.status === 'playing' && 'cursor-none',
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full"
          role="img"
          aria-label={`Ball Bounce board. Level ${hud.level}, score ${hud.score}, ${hud.lives} lives.`}
        />
        <BallBounceOverlay
          hud={hud}
          stats={stats}
          onStart={controls.start}
          onResume={controls.resume}
          onRestart={controls.restart}
        />
      </div>
    </div>
  );
}
