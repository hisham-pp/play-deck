'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTicTacToeEngine } from '../hooks/use-tic-tac-toe-engine';
import { useTicTacToeKeyboard } from '../hooks/use-tic-tac-toe-keyboard';
import { useTicTacToeSession } from '../hooks/use-tic-tac-toe-session';
import type { TicTacToeState } from '../types/tic-tac-toe.types';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeControls } from './TicTacToeControls';
import { TicTacToeOverlay } from './TicTacToeOverlay';
import { TicTacToeScoreboard } from './TicTacToeScoreboard';

function formatStatusAnnouncement(state: TicTacToeState): string {
  if (state.status === 'won') {
    return `Game Over. Player ${state.winner} won round ${state.round}.`;
  }
  if (state.status === 'draw') {
    return `Game Over. Round ${state.round} ended in a draw.`;
  }
  if (state.isAiThinking) {
    return 'AI is thinking...';
  }
  return `Player ${state.turn}'s turn.`;
}

export function TicTacToeGame() {
  const { handleGameOver } = useTicTacToeSession();

  const { state, makeMove, setMode, setDifficulty, setHumanMark, resetRound, resetMatch } =
    useTicTacToeEngine(handleGameOver);

  const { focusedIndex, setFocusedIndex } = useTicTacToeKeyboard({
    onMove: makeMove,
    onResetRound: resetRound,
    isEnabled: state.status === 'playing',
  });

  const statusAnnouncement = useMemo(() => formatStatusAnnouncement(state), [state]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 py-2 px-4 focus:outline-none select-none">
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* Navigation header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      {/* Scoreboard */}
      <TicTacToeScoreboard
        scores={state.scores}
        round={state.round}
        turn={state.turn}
        status={state.status}
        mode={state.mode}
        aiDifficulty={state.aiDifficulty}
        humanPlayerMark={state.humanPlayerMark}
        isAiThinking={state.isAiThinking}
      />

      {/* Interactive 3x3 Stage */}
      <div className="relative w-full flex items-center justify-center">
        <TicTacToeBoard
          board={state.board}
          winningLine={state.winningLine}
          focusedIndex={focusedIndex}
          disabled={state.status !== 'playing' || state.isAiThinking}
          onCellClick={makeMove}
          onCellFocus={setFocusedIndex}
        />

        {/* Victory / Draw Overlay */}
        <TicTacToeOverlay
          status={state.status}
          winner={state.winner}
          mode={state.mode}
          humanPlayerMark={state.humanPlayerMark}
          onNextRound={resetRound}
          onResetMatch={resetMatch}
        />
      </div>

      {/* Tactical Control Panel */}
      <TicTacToeControls
        mode={state.mode}
        aiDifficulty={state.aiDifficulty}
        humanPlayerMark={state.humanPlayerMark}
        onModeChange={setMode}
        onDifficultyChange={setDifficulty}
        onHumanMarkChange={setHumanMark}
        onResetRound={resetRound}
        onResetMatch={resetMatch}
      />
    </div>
  );
}
