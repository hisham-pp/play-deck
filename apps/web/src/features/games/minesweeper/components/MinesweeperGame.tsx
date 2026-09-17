'use client';

import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Button } from '@playdeck/ui';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { DIFFICULTY_CUSTOM, STATUS_LOST, STATUS_WON } from '../engine/minesweeper-constants';
import { useMinesweeperEngine } from '../hooks/use-minesweeper-engine';
import { useMinesweeperKeyboard } from '../hooks/use-minesweeper-keyboard';
import type { BoardDimensions, MinesweeperDifficulty } from '../types/minesweeper.types';
import { MinesweeperBoard } from './MinesweeperBoard';
import { MinesweeperControls } from './MinesweeperControls';
import { MinesweeperCustomModal } from './MinesweeperCustomModal';
import { MinesweeperHeader } from './MinesweeperHeader';
import { MinesweeperStatsModal } from './MinesweeperStatsModal';

export function MinesweeperGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { recordGamePlayed } = usePlayerStore();

  const [isFlagModeActive, setIsFlagModeActive] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [lastRunNewBest, setLastRunNewBest] = useState(false);

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
    (_diff: MinesweeperDifficulty, _elapsed: number, isNewBest: boolean) => {
      setLastRunNewBest(isNewBest);
      closeSession(true);
    },
    [closeSession],
  );

  const handleLose = useCallback(() => {
    setLastRunNewBest(false);
    closeSession(false);
  }, [closeSession]);

  const { state, stats, controls } = useMinesweeperEngine({
    onWin: handleWin,
    onLose: handleLose,
  });

  useMinesweeperKeyboard({ state, controls });

  const handleSelectDifficulty = useCallback(
    (difficulty: MinesweeperDifficulty) => {
      controls.newGame(difficulty);
    },
    [controls],
  );

  const handleCustomConfirm = useCallback(
    (config: BoardDimensions) => {
      controls.newGame(DIFFICULTY_CUSTOM, config);
    },
    [controls],
  );

  const minesRemaining = state.mines - state.flagCount;
  const initialCustomConfig = {
    rows: state.rows,
    cols: state.cols,
    mines: state.mines,
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 px-2 sm:px-4 py-2">
      {/* Top Header & Navigation */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <span>MINESWEEPER</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold uppercase">
            {state.difficulty}
          </span>
        </h1>
        <div className="w-20" />
      </div>

      {/* Game Stage Arena */}
      <div className="flex flex-col items-center w-full max-w-full">
        <div className="inline-block max-w-full">
          <MinesweeperHeader
            minesRemaining={minesRemaining}
            elapsedMs={state.elapsedMs}
            status={state.status}
            onReset={controls.resetGame}
            bestTimeMs={state.bestTimeMs}
          />
          <MinesweeperBoard
            state={state}
            onReveal={controls.revealCell}
            onToggleFlag={controls.toggleFlag}
            onChord={controls.chordCell}
            onSelect={controls.selectCell}
            isFlagModeActive={isFlagModeActive}
          />
        </div>
      </div>

      {/* Banner / Status Overlays */}
      {state.status === STATUS_WON && (
        <div className="w-full max-w-md bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Field Cleared!</span>
                {lastRunNewBest && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-deck-950 font-black rounded uppercase">
                    New Best!
                  </span>
                )}
              </div>
              <div className="text-xs text-emerald-300/80 font-mono">
                Time: {Math.floor(state.elapsedMs / 1000)} seconds
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={controls.resetGame}>
            Play Again
          </Button>
        </div>
      )}

      {state.status === STATUS_LOST && (
        <div className="w-full max-w-md bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl flex items-center justify-between shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-lg">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Detonated!</div>
              <div className="text-xs text-rose-300/80">Step carefully next time.</div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={controls.resetGame}>
            Try Again
          </Button>
        </div>
      )}

      {/* Controls and Settings Drawer */}
      <MinesweeperControls
        currentDifficulty={state.difficulty}
        onSelectDifficulty={handleSelectDifficulty}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        isFlagModeActive={isFlagModeActive}
        onToggleFlagMode={() => setIsFlagModeActive((prev) => !prev)}
      />

      {/* Modals */}
      <MinesweeperCustomModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialConfig={initialCustomConfig}
        onConfirm={handleCustomConfirm}
      />

      <MinesweeperStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
      />
    </div>
  );
}
