'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useSudokuEngine } from '../hooks/use-sudoku-engine';
import { useSudokuKeyboard } from '../hooks/use-sudoku-keyboard';
import type { SudokuDifficulty } from '../types/sudoku.types';
import { SudokuActionsCard } from './SudokuActionsCard';
import { SudokuAnnouncer } from './SudokuAnnouncer';
import { SudokuBoard } from './SudokuBoard';
import { SudokuNumberPad } from './SudokuNumberPad';
import { SudokuOverlay } from './SudokuOverlay';
import { SudokuStatusBar } from './SudokuStatusBar';

export function SudokuGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { recordGamePlayed } = usePlayerStore();
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);

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

  const handleCompleted = useCallback(() => closeSession(true), [closeSession]);
  const handleFailed = useCallback(() => closeSession(false), [closeSession]);

  const { state, stats, controls } = useSudokuEngine({
    onCompleted: handleCompleted,
    onFailed: handleFailed,
  });

  useSudokuKeyboard(state.status, controls);

  const handlePick = useCallback(
    (difficulty?: SudokuDifficulty) => {
      setLevelMenuOpen(false);
      controls.newPuzzle(difficulty);
    },
    [controls],
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-3 py-1 select-none">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <SudokuAnnouncer state={state} />

      <div className="w-full grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] items-start">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Height-aware cap keeps the board and the number pad on one screen. */}
          <div className="w-full max-w-[min(100%,calc(100dvh-300px),560px)] flex flex-col gap-3">
            <SudokuStatusBar state={state} onPause={controls.pause} onResume={controls.resume} />

            <div className="relative w-full">
              <SudokuBoard
                state={state}
                concealed={state.status === 'paused'}
                onSelect={controls.selectCell}
              />

              <SudokuOverlay
                state={state}
                stats={stats}
                levelMenuOpen={levelMenuOpen}
                onNewPuzzle={handlePick}
                onOpenLevelMenu={() => setLevelMenuOpen(true)}
                onCloseLevelMenu={() => setLevelMenuOpen(false)}
                onReset={controls.reset}
                onResume={controls.resume}
              />
            </div>

            <SudokuNumberPad
              state={state}
              onDigit={controls.setDigit}
              onErase={controls.clearCell}
              onToggleNotes={controls.toggleNoteMode}
              onUndo={controls.undo}
              onHint={controls.hint}
            />
          </div>
        </div>

        <div className="w-full max-w-[min(100%,560px)] mx-auto lg:mx-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-90px)] lg:overflow-y-auto">
          <SudokuActionsCard
            state={state}
            stats={stats}
            onOpenLevelMenu={() => setLevelMenuOpen(true)}
            onReset={controls.reset}
            onAutoNotes={controls.autoFillCandidates}
          />
        </div>
      </div>
    </div>
  );
}
