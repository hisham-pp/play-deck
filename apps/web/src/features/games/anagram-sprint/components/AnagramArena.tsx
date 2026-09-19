'use client';

import React from 'react';
import { STATUS_PLAYING } from '../engine/anagram-constants';
import { attemptsLeft, currentRound, findPlayer, hasAnswered } from '../engine/anagram-state';
import type { AnagramClock } from '../hooks/use-anagram-clock';
import type { AnagramTray } from '../hooks/use-anagram-tray';
import type { AnagramState, AnagramStats } from '../types/anagram-sprint.types';
import { AnagramAnnouncer } from './AnagramAnnouncer';
import { AnagramAnswerForm } from './AnagramAnswerForm';
import { AnagramOverlay } from './AnagramOverlay';
import { AnagramScoreboard } from './AnagramScoreboard';
import { AnagramStatsCard } from './AnagramStatsCard';
import { AnagramStatusBar } from './AnagramStatusBar';
import { AnagramTiles } from './AnagramTiles';

export interface AnagramArenaProps {
  state: AnagramState;
  clock: AnagramClock;
  tray: AnagramTray;
  countdown: number;
  stats: AnagramStats | null;
  localPlayerId: string | null;
  disconnectedIds?: readonly string[];
  onSubmit: (word: string) => void;
  onType: () => void;
  onPlayAgain?: () => void;
  onChangeSetup: () => void;
}

/** The play surface: letters, one input, the clock, and the standings beside it. */
export function AnagramArena({
  state,
  clock,
  tray,
  countdown,
  stats,
  localPlayerId,
  disconnectedIds,
  onSubmit,
  onType,
  onPlayAgain,
  onChangeSetup,
}: AnagramArenaProps) {
  const round = currentRound(state);
  const seat = localPlayerId ? findPlayer(state, localPlayerId) : state.players[0];
  const seatId = seat?.id ?? '';
  const guessesLeft = seatId ? attemptsLeft(state, seatId) : 0;
  const isHome = seatId ? hasAnswered(state, seatId) : false;
  const canAnswer =
    state.status === STATUS_PLAYING &&
    Boolean(round) &&
    Boolean(seat) &&
    !seat?.eliminated &&
    !isHome &&
    guessesLeft > 0;

  return (
    <div className="w-full grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] items-start">
      <div className="flex flex-col gap-3">
        <AnagramStatusBar state={state} clock={clock} />

        <div className="relative flex min-h-[340px] flex-col items-center justify-center gap-5 rounded-xl border border-surface-border bg-surface-raised p-5 shadow-arcade arcade-texture">
          <AnagramTiles letters={tray.letters} isDimmed={!canAnswer} />

          <AnagramAnswerForm
            state={state}
            canAnswer={canAnswer}
            attemptsLeft={guessesLeft}
            onSubmit={onSubmit}
            onType={onType}
            onShuffle={tray.shuffle}
          />

          <AnagramOverlay
            state={state}
            countdown={countdown}
            onPlayAgain={onPlayAgain}
            onChangeSetup={onChangeSetup}
          />
        </div>

        <AnagramAnnouncer state={state} />
      </div>

      <div className="w-full flex flex-col gap-3 lg:sticky lg:top-4">
        <AnagramScoreboard
          state={state}
          localPlayerId={localPlayerId}
          disconnectedIds={disconnectedIds}
        />
        <AnagramStatsCard stats={stats} onOpenSetup={onChangeSetup} />
      </div>
    </div>
  );
}
