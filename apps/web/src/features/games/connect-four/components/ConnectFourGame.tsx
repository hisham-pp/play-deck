'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { STATUS_PLAYING } from '../engine/connect-four-constants';
import { formatStatusAnnouncement } from '../engine/connect-four-utils';
import { useConnectFourEngine } from '../hooks/use-connect-four-engine';
import { useConnectFourKeyboard } from '../hooks/use-connect-four-keyboard';
import { useConnectFourSession } from '../hooks/use-connect-four-session';
import type { AIDifficulty, ConnectFourDisc, GameMode } from '../types/connect-four.types';
import { ConnectFourArena } from './ConnectFourArena';
import { ConnectFourSetupModal } from './ConnectFourSetupModal';

export function ConnectFourGame() {
  const { handleGameOver } = useConnectFourSession();

  const { state, dropPiece, setMode, setDifficulty, setHumanDisc, resetRound, resetMatch } =
    useConnectFourEngine(handleGameOver);

  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const { focusedColumn, setFocusedColumn } = useConnectFourKeyboard({
    onDrop: (col) => dropPiece(col),
    onResetRound: resetRound,
    isEnabled: state.status === STATUS_PLAYING && !state.isAiThinking,
  });

  const handleStartMatch = (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    humanDisc: ConnectFourDisc;
  }) => {
    setMode(config.mode);
    setDifficulty(config.difficulty);
    setHumanDisc(config.humanDisc);
    resetMatch();
  };

  const statusAnnouncement = useMemo(() => formatStatusAnnouncement(state), [state]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 py-2 px-3 select-none">
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
        focusedColumn={focusedColumn}
        onDrop={dropPiece}
        onColumnFocus={setFocusedColumn}
        onResetRound={resetRound}
        onResetMatch={resetMatch}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Match Setup Modal */}
      <ConnectFourSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.aiDifficulty}
        currentHumanDisc={state.humanPlayerDisc}
        onStartMatch={handleStartMatch}
      />
    </div>
  );
}
