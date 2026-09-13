'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { RoomChatBox } from '@/features/chat/components/RoomChatBox';
import { MODE_MULTIPLAYER, STATUS_PLAYING } from '../engine/connect-four-constants';
import { formatStatusAnnouncement } from '../engine/connect-four-utils';
import { useConnectFourEngine } from '../hooks/use-connect-four-engine';
import { useConnectFourKeyboard } from '../hooks/use-connect-four-keyboard';
import { useConnectFourPlayers } from '../hooks/use-connect-four-players';
import { useConnectFourSession } from '../hooks/use-connect-four-session';
import type { AIDifficulty, ConnectFourDisc, GameMode } from '../types/connect-four.types';
import { ConnectFourArena } from './ConnectFourArena';
import { ConnectFourSetupModal } from './ConnectFourSetupModal';

export function ConnectFourGame() {
  const { handleGameOver } = useConnectFourSession();

  const {
    state,
    roomCode,
    myDisc,
    opponent,
    leaveRoom,
    dropPiece,
    setMode,
    setDifficulty,
    setHumanDisc,
    resetRound,
    resetMatch,
  } = useConnectFourEngine(handleGameOver);

  const [isSetupOpen, setIsSetupOpen] = useState(!roomCode);

  const isMyTurnOnline = state.mode !== MODE_MULTIPLAYER || state.turn === myDisc;

  const { focusedColumn, setFocusedColumn } = useConnectFourKeyboard({
    onDrop: (col) => dropPiece(col),
    onResetRound: resetRound,
    isEnabled: state.status === STATUS_PLAYING && !state.isAiThinking && isMyTurnOnline,
  });

  const { player1, player2 } = useConnectFourPlayers({
    mode: state.mode,
    humanPlayerDisc: state.humanPlayerDisc,
    aiDifficulty: state.aiDifficulty,
    myDisc,
    opponent,
  });

  const handleStartMatch = (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    humanDisc: ConnectFourDisc;
  }) => {
    if (state.mode === MODE_MULTIPLAYER && config.mode !== MODE_MULTIPLAYER) {
      leaveRoom();
    }
    setMode(config.mode);
    setDifficulty(config.difficulty);
    setHumanDisc(config.humanDisc);
    resetMatch();
  };

  const statusAnnouncement = useMemo(() => formatStatusAnnouncement(state), [state]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-4 py-2 px-3 select-none">
      {/* Screen Reader Live Region for Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* Navigation Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      {/* Game Stage Arena */}
      <ConnectFourArena
        state={state}
        player1={player1}
        player2={player2}
        focusedColumn={focusedColumn}
        roomCode={roomCode}
        myDisc={myDisc}
        onDrop={dropPiece}
        onColumnFocus={setFocusedColumn}
        onResetRound={resetRound}
        onResetMatch={resetMatch}
        onOpenSetup={() => setIsSetupOpen(true)}
        onLeaveRoom={leaveRoom}
      />

      {/* Match Setup Modal */}
      <ConnectFourSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.aiDifficulty}
        currentHumanDisc={state.humanPlayerDisc}
        onStartMatch={handleStartMatch}
        onStartOnlineMatch={() => setMode(MODE_MULTIPLAYER)}
      />

      {/* In-Game Multiplayer Chat */}
      {state.mode === MODE_MULTIPLAYER && roomCode && <RoomChatBox roomCode={roomCode} />}
    </div>
  );
}
