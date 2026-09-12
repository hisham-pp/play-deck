'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { MODE_MULTIPLAYER, STATUS_PLAYING } from '../engine/tic-tac-toe-constants';
import { formatStatusAnnouncement } from '../engine/tic-tac-toe-utils';
import { useTicTacToeEngine } from '../hooks/use-tic-tac-toe-engine';
import { useTicTacToeKeyboard } from '../hooks/use-tic-tac-toe-keyboard';
import { useTicTacToePlayers } from '../hooks/use-tic-tac-toe-players';
import { useTicTacToeSession } from '../hooks/use-tic-tac-toe-session';
import type { GameMode } from '../types/tic-tac-toe.types';
import { MultiplayerLobbyModal } from './MultiplayerLobbyModal';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeCenterHeader } from './TicTacToeCenterHeader';
import { TicTacToeControls } from './TicTacToeControls';
import { TicTacToeOverlay } from './TicTacToeOverlay';
import { TicTacToePlayerCard } from './TicTacToePlayerCard';

export function TicTacToeGame() {
  const { handleGameOver } = useTicTacToeSession();
  const { setLobbyOpen, leaveRoom, opponent } = useMultiplayerStore();

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
    isEnabled: state.status === STATUS_PLAYING,
  });

  const { playerX, playerO } = useTicTacToePlayers({
    mode: state.mode,
    humanPlayerMark: state.humanPlayerMark,
    aiDifficulty: state.aiDifficulty,
    myMark,
    roomCode,
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
  const isSingle = state.mode === 'single';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 py-2 px-3 select-none">
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

      <div className="w-full grid grid-cols-2 md:grid-cols-[200px_minmax(0,420px)_200px] lg:grid-cols-[220px_minmax(0,440px)_220px] justify-center items-start gap-4 lg:gap-6">
        {/* LEFT: Player X Station */}
        <div className="col-span-1 md:col-auto md:order-1 flex justify-center">
          <TicTacToePlayerCard
            mark="X"
            name={playerX.name}
            avatar={playerX.avatar}
            roleTag={playerX.role}
            score={state.scores.X}
            isActive={state.status === STATUS_PLAYING && state.turn === 'X'}
            isMe={playerX.isMe}
            isAiThinking={isSingle && state.turn === 'X' && state.isAiThinking}
          />
        </div>

        {/* RIGHT: Player O Station */}
        <div className="col-span-1 md:col-auto md:order-3 flex justify-center">
          <TicTacToePlayerCard
            mark="O"
            name={playerO.name}
            avatar={playerO.avatar}
            roleTag={playerO.role}
            score={state.scores.O}
            isActive={state.status === STATUS_PLAYING && state.turn === 'O'}
            isMe={playerO.isMe}
            isAiThinking={isSingle && state.turn === 'O' && state.isAiThinking}
          />
        </div>

        {/* CENTER: Arena Board, Stats & Controls */}
        <div className="col-span-2 md:col-auto md:order-2 flex flex-col items-center gap-3.5 w-full">
          <TicTacToeCenterHeader
            round={state.round}
            ties={state.scores.ties}
            mode={state.mode}
            roomCode={roomCode}
            aiDifficulty={state.aiDifficulty}
          />

          <div className="relative w-full flex items-center justify-center">
            <TicTacToeBoard
              board={state.board}
              winningLine={state.winningLine}
              focusedIndex={focusedIndex}
              disabled={state.status !== STATUS_PLAYING || state.isAiThinking}
              onCellClick={makeMove}
              onCellFocus={setFocusedIndex}
            />

            <TicTacToeOverlay
              status={state.status}
              winner={state.winner}
              mode={state.mode}
              humanPlayerMark={state.humanPlayerMark}
              myMark={myMark}
              playerXName={playerX.name}
              playerOName={playerO.name}
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
            opponentName={opponent?.displayName || opponentName}
            onModeChange={handleModeChange}
            onDifficultyChange={setDifficulty}
            onHumanMarkChange={setHumanMark}
            onResetRound={resetRound}
            onResetMatch={resetMatch}
            onOpenMultiplayerLobby={() => setLobbyOpen(true)}
            onLeaveRoom={leaveRoom}
          />
        </div>
      </div>

      <MultiplayerLobbyModal onMatchReady={() => setMode(MODE_MULTIPLAYER)} />
    </div>
  );
}
