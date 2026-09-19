'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { AnagramVoiceDock } from '@/features/voice/components/AnagramVoiceDock';
import {
  SCREEN_LOBBY,
  SCREEN_PLAYING,
  SCREEN_ROOM,
  useAnagramMatch,
} from '../hooks/use-anagram-match';
import { AnagramArena } from './AnagramArena';
import { AnagramLobby } from './AnagramLobby';
import { AnagramRoomLobby } from './AnagramRoomLobby';

export function AnagramSprintGame() {
  const match = useAnagramMatch();
  const { actions, screen } = match;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-1">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to games</span>
        </Link>
      </div>

      {screen === SCREEN_LOBBY && (
        <AnagramLobby onStartSolo={actions.startSolo} onOpenRoom={actions.openRoom} />
      )}

      {screen === SCREEN_ROOM && (
        <AnagramRoomLobby onStartMatch={actions.startRoomMatch} onLeave={actions.leave} />
      )}

      {screen === SCREEN_PLAYING && (
        <>
          <AnagramArena
            state={match.state}
            clock={match.clock}
            tray={match.tray}
            countdown={match.countdown}
            stats={match.stats}
            localPlayerId={match.localPlayerId}
            disconnectedIds={match.disconnectedIds}
            onSubmit={actions.submitAnswer}
            onType={match.controls.clearRejection}
            onPlayAgain={match.canReplay ? actions.playAgain : undefined}
            onChangeSetup={actions.changeSetup}
          />
          {match.isOnline && <AnagramVoiceDock anchorClassName="bottom-4 right-4" />}
        </>
      )}
    </div>
  );
}
