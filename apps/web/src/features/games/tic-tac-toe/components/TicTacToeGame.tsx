'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { MARK_O, MARK_X, MODE_MULTIPLAYER, STATUS_PLAYING } from '../engine/tic-tac-toe-constants';
import { formatStatusAnnouncement } from '../engine/tic-tac-toe-utils';
import { useTicTacToeEngine } from '../hooks/use-tic-tac-toe-engine';
import { useTicTacToeKeyboard } from '../hooks/use-tic-tac-toe-keyboard';
import { useTicTacToePlayers } from '../hooks/use-tic-tac-toe-players';
import { useTicTacToeSession } from '../hooks/use-tic-tac-toe-session';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';
import { TicTacToeActionsCard } from './TicTacToeActionsCard';
import { TicTacToeArenaBoard } from './TicTacToeArenaBoard';
import { TicTacToeInfoCard } from './TicTacToeInfoCard';
import { TicTacToePlayerCard } from './TicTacToePlayerCard';
import { TicTacToeSetupModal } from './TicTacToeSetupModal';

export function TicTacToeGame() {
  const { handleGameOver } = useTicTacToeSession();
  const { leaveRoom } = useMultiplayerStore();

  const {
    state,
    roomCode,
    myMark,
    makeMove,
    setMode,
    setDifficulty,
    setHumanMark,
    resetRound,
    resetMatch,
  } = useTicTacToeEngine(handleGameOver);

  const [isSetupOpen, setIsSetupOpen] = useState(!roomCode);

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

  const handleStartMatch = (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    humanMark: PlayerMark;
  }) => {
    if (state.mode === MODE_MULTIPLAYER && config.mode !== MODE_MULTIPLAYER) {
      leaveRoom();
    }
    setMode(config.mode);
    setDifficulty(config.difficulty);
    setHumanMark(config.humanMark);
    resetMatch();
  };

  const statusAnnouncement = useMemo(() => formatStatusAnnouncement(state), [state]);
  const isSingle = state.mode === 'single';

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-3 py-1 px-3 select-none">
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

      <div className="w-full grid grid-cols-2 md:grid-cols-[200px_minmax(0,1fr)_200px] lg:grid-cols-[220px_minmax(0,1fr)_220px] items-start justify-center gap-3 lg:gap-5">
        {/* PLAYER X STATION */}
        <div className="col-span-1 md:col-start-1 md:row-start-1 flex justify-center">
          <TicTacToePlayerCard
            mark={MARK_X}
            name={playerX.name}
            avatar={playerX.avatar}
            roleTag={playerX.role}
            score={state.scores.X}
            isActive={state.status === STATUS_PLAYING && state.turn === MARK_X}
            isMe={playerX.isMe}
            isAiThinking={isSingle && state.turn === MARK_X && state.isAiThinking}
          />
        </div>

        {/* PLAYER O STATION */}
        <div className="col-span-1 md:col-start-3 md:row-start-1 flex justify-center">
          <TicTacToePlayerCard
            mark={MARK_O}
            name={playerO.name}
            avatar={playerO.avatar}
            roleTag={playerO.role}
            score={state.scores.O}
            isActive={state.status === STATUS_PLAYING && state.turn === MARK_O}
            isMe={playerO.isMe}
            isAiThinking={isSingle && state.turn === MARK_O && state.isAiThinking}
          />
        </div>

        {/* CENTER ARENA: Max-Height Board */}
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 self-center flex items-center justify-center">
          <TicTacToeArenaBoard
            state={state}
            focusedIndex={focusedIndex}
            myMark={myMark}
            playerXName={playerX.name}
            playerOName={playerO.name}
            onMove={makeMove}
            onCellFocus={setFocusedIndex}
            onNextRound={resetRound}
            onResetMatch={resetMatch}
          />
        </div>

        {/* MATCH INFO (Left on Desktop, Bottom-Left on Mobile) */}
        <div className="col-span-1 md:col-start-1 md:row-start-2 flex justify-center">
          <TicTacToeInfoCard
            round={state.round}
            ties={state.scores.ties}
            mode={state.mode}
            roomCode={roomCode}
            aiDifficulty={state.aiDifficulty}
          />
        </div>

        {/* ACTIONS (Right on Desktop, Bottom-Right on Mobile) */}
        <div className="col-span-1 md:col-start-3 md:row-start-2 flex justify-center">
          <TicTacToeActionsCard
            mode={state.mode}
            roomCode={roomCode}
            onOpenSetup={() => setIsSetupOpen(true)}
            onResetRound={resetRound}
            onResetMatch={resetMatch}
            onLeaveRoom={leaveRoom}
          />
        </div>
      </div>

      <TicTacToeSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.aiDifficulty}
        currentHumanMark={state.humanPlayerMark}
        onStartMatch={handleStartMatch}
        onStartOnlineMatch={() => setMode(MODE_MULTIPLAYER)}
      />
    </div>
  );
}
