'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useTetrisEngine } from '../hooks/use-tetris-engine';
import { useTetrisInput } from '../hooks/use-tetris-input';
import { TetrisActionsCard } from './TetrisActionsCard';
import { TetrisArenaBoard } from './TetrisArenaBoard';
import { TetrisDPad } from './TetrisDPad';
import { TetrisHoldCard } from './TetrisHoldCard';
import { TetrisInfoCard } from './TetrisInfoCard';
import { TetrisNextQueue } from './TetrisNextQueue';
import { TetrisPlayerCard } from './TetrisPlayerCard';

export function TetrisGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { player, recordGamePlayed } = usePlayerStore();

  const handleGameOver = useCallback(
    (_finalScore: number, _linesCleared: number) => {
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
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    holdPiece,
  } = useTetrisEngine(handleGameOver);

  const { handleTouchStart, handleTouchEnd } = useTetrisInput({
    status: state.status,
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop,
    onRotateCW: rotateCW,
    onRotateCCW: rotateCCW,
    onHold: holdPiece,
    onPause: pauseGame,
    onResume: resumeGame,
    onStart: startGame,
    onRestart: restartGame,
  });

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
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-[200px_minmax(0,1fr)_200px] lg:grid-cols-[220px_minmax(0,1fr)_220px] items-start justify-center gap-3 lg:gap-5">
        {/* PILOT + HOLD (Left Column on Desktop, Top on Mobile) */}
        <div className="col-span-1 md:col-start-1 md:row-start-1 flex justify-center">
          <TetrisPlayerCard status={state.status} highScore={effectiveHighScore} />
        </div>

        <div className="col-span-1 md:col-start-1 md:row-start-2 flex flex-col gap-3 justify-center w-full">
          <TetrisHoldCard holdType={state.holdType} canHold={state.canHold} />
          <TetrisNextQueue queue={state.queue} />
        </div>

        {/* CENTER ARENA */}
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 self-center flex items-center justify-center">
          <TetrisArenaBoard
            board={state.board}
            active={state.active}
            status={state.status}
            countdown={state.countdown}
            score={state.score}
            highScore={effectiveHighScore}
            linesCleared={state.linesCleared}
            isNewHighScore={state.isNewHighScore}
            onStart={startGame}
            onResume={resumeGame}
            onRestart={restartGame}
          />
        </div>

        {/* INFO + ACTIONS (Right Column on Desktop, Bottom on Mobile) */}
        <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 flex flex-col gap-3 justify-center">
          <TetrisInfoCard
            score={state.score}
            highScore={effectiveHighScore}
            level={state.level}
            linesCleared={state.linesCleared}
          />
          <TetrisActionsCard
            status={state.status}
            onPause={pauseGame}
            onResume={resumeGame}
            onRestart={restartGame}
          />
          <TetrisDPad
            status={state.status}
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
            onRotateCW={rotateCW}
            onHold={holdPiece}
          />
        </div>
      </div>
    </div>
  );
}
