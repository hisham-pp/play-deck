'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { RoomChatBox } from '@/features/chat/components/RoomChatBox';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { MODE_MULTIPLAYER, STATUS_PLAYING } from '../engine/tic-tac-toe-constants';
import { formatStatusAnnouncement } from '../engine/tic-tac-toe-utils';
import { useTicTacToeEngine } from '../hooks/use-tic-tac-toe-engine';
import { useTicTacToeKeyboard } from '../hooks/use-tic-tac-toe-keyboard';
import { useTicTacToePlayers } from '../hooks/use-tic-tac-toe-players';
import { useTicTacToeSession } from '../hooks/use-tic-tac-toe-session';
import { useTicTacToeSocial } from '../hooks/use-tic-tac-toe-social';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';
import { TicTacToeArenaGrid } from './TicTacToeArenaGrid';
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

  const { opponentId, friendStatus, handleAddFriend } = useTicTacToeSocial();

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

      <TicTacToeArenaGrid
        state={state}
        playerX={playerX}
        playerO={playerO}
        focusedIndex={focusedIndex}
        myMark={myMark}
        roomCode={roomCode}
        opponentId={opponentId}
        friendStatus={friendStatus}
        onMove={makeMove}
        onCellFocus={setFocusedIndex}
        onResetRound={resetRound}
        onResetMatch={resetMatch}
        onLeaveRoom={leaveRoom}
        onOpenSetup={() => setIsSetupOpen(true)}
        onAddFriend={handleAddFriend}
      />

      <TicTacToeSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.aiDifficulty}
        currentHumanMark={state.humanPlayerMark}
        onStartMatch={handleStartMatch}
        onStartOnlineMatch={() => setMode(MODE_MULTIPLAYER)}
      />

      {state.mode === MODE_MULTIPLAYER && roomCode && (
        <>
          <RoomChatBox roomCode={roomCode} />
          <RoomVoiceDock />
        </>
      )}
    </div>
  );
}
