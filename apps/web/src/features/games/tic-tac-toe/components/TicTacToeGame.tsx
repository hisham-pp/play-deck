'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { MODE_MULTIPLAYER } from '../engine/tic-tac-toe-constants';
import { useTicTacToeEngine } from '../hooks/use-tic-tac-toe-engine';
import { useTicTacToeKeyboard } from '../hooks/use-tic-tac-toe-keyboard';
import { useTicTacToeSession } from '../hooks/use-tic-tac-toe-session';
import type { GameMode, TicTacToeState } from '../types/tic-tac-toe.types';
import { MultiplayerLobbyModal } from './MultiplayerLobbyModal';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeControls } from './TicTacToeControls';
import { TicTacToeOverlay } from './TicTacToeOverlay';
import { TicTacToeScoreboard } from './TicTacToeScoreboard';

function formatStatusAnnouncement(state: TicTacToeState): string {
  if (state.status === 'won') return `Game Over. Player ${state.winner} won round ${state.round}.`;
  if (state.status === 'draw') return `Game Over. Round ${state.round} ended in a draw.`;
  if (state.isAiThinking) return 'AI is thinking...';
  return `Player ${state.turn}'s turn.`;
}

export function TicTacToeGame() {
  const { handleGameOver } = useTicTacToeSession();
  const { setLobbyOpen, leaveRoom } = useMultiplayerStore();

  const {
    state,
    roomCode,
    myMark,
    opponentName,
    makeMove,
    setMode,
    setDifficulty,
    setHumanMark,
    resetRound,
    resetMatch,
  } = useTicTacToeEngine(handleGameOver);

  const { focusedIndex, setFocusedIndex } = useTicTacToeKeyboard({
    onMove: makeMove,
    onResetRound: resetRound,
    isEnabled: state.status === 'playing',
  });

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === MODE_MULTIPLAYER) {
      setLobbyOpen(true);
    } else {
      if (state.mode === MODE_MULTIPLAYER) leaveRoom();
      setMode(newMode);
    }
  };

  const statusAnnouncement = useMemo(() => formatStatusAnnouncement(state), [state]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 py-2 px-4 focus:outline-none select-none">
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

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

      <div className="relative w-full flex items-center justify-center">
        <TicTacToeBoard
          board={state.board}
          winningLine={state.winningLine}
          focusedIndex={focusedIndex}
          disabled={state.status !== 'playing' || state.isAiThinking}
          onCellClick={makeMove}
          onCellFocus={setFocusedIndex}
        />

        <TicTacToeOverlay
          status={state.status}
          winner={state.winner}
          mode={state.mode}
          humanPlayerMark={state.humanPlayerMark}
          onNextRound={resetRound}
          onResetMatch={resetMatch}
        />
      </div>

      <TicTacToeControls
        mode={state.mode}
        aiDifficulty={state.aiDifficulty}
        humanPlayerMark={state.humanPlayerMark}
        roomCode={roomCode}
        myMark={myMark}
        opponentName={opponentName}
        onModeChange={handleModeChange}
        onDifficultyChange={setDifficulty}
        onHumanMarkChange={setHumanMark}
        onResetRound={resetRound}
        onResetMatch={resetMatch}
        onOpenMultiplayerLobby={() => setLobbyOpen(true)}
        onLeaveRoom={leaveRoom}
      />

      <MultiplayerLobbyModal onMatchReady={() => setMode(MODE_MULTIPLAYER)} />
    </div>
  );
}
