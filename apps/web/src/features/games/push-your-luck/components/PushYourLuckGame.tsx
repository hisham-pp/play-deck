'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import {
  DEFAULT_BOT_SEATS,
  DEFAULT_HUMAN_SEATS,
  DEFAULT_TARGET_SCORE,
  NERVE_BALANCED,
  PHASE_PLAYING,
  SEAT_BOT,
} from '../engine/push-your-luck-constants';
import { createSeats } from '../engine/push-your-luck-state';
import { formatStatusAnnouncement } from '../engine/push-your-luck-utils';
import { usePushYourLuckEngine } from '../hooks/use-push-your-luck-engine';
import { usePushYourLuckKeyboard } from '../hooks/use-push-your-luck-keyboard';
import { usePushYourLuckSession } from '../hooks/use-push-your-luck-session';
import { PushYourLuckArena } from './PushYourLuckArena';
import { PushYourLuckResultOverlay } from './PushYourLuckResultOverlay';
import { PushYourLuckSetupModal, type PushYourLuckTableConfig } from './PushYourLuckSetupModal';

const DEFAULT_CONFIG: PushYourLuckTableConfig = {
  humanSeats: DEFAULT_HUMAN_SEATS,
  botSeats: DEFAULT_BOT_SEATS,
  nerve: NERVE_BALANCED,
  targetScore: DEFAULT_TARGET_SCORE,
};

export function PushYourLuckGame() {
  const { handleMatchOver } = usePushYourLuckSession();
  const { state, push, bank, configure, resetMatch } = usePushYourLuckEngine(handleMatchOver);

  const player = usePlayerStore((store) => store.player);
  const reducedMotion = usePreferencesStore((store) => store.reducedMotion);

  const [config, setConfig] = useState<PushYourLuckTableConfig>(DEFAULT_CONFIG);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const activeSeat = state.seats[state.activeSeat];
  const isLocalTurn =
    state.phase === PHASE_PLAYING && !state.turn.resolved && activeSeat.kind !== SEAT_BOT;

  const startMatch = useCallback(
    (next: PushYourLuckTableConfig) => {
      setConfig(next);
      configure(
        createSeats({
          humanSeats: next.humanSeats,
          botSeats: next.botSeats,
          nerve: next.nerve,
          playerName: player?.displayName,
          playerAvatar: player?.avatar,
        }),
        next.targetScore,
      );
    },
    [configure, player?.displayName, player?.avatar],
  );

  // Seat the signed-in player at the table once their profile resolves, so the
  // opening match already carries their name and avatar.
  const hasSeatedRef = useRef(false);
  useEffect(() => {
    if (hasSeatedRef.current || !player) return;
    hasSeatedRef.current = true;
    startMatch(DEFAULT_CONFIG);
  }, [player, startMatch]);

  // A rematch keeps the same table; changing the table goes through setup.
  const handleNewMatch = useCallback(() => resetMatch(), [resetMatch]);

  usePushYourLuckKeyboard({
    onPush: push,
    onBank: bank,
    onNewMatch: handleNewMatch,
    isEnabled: isLocalTurn,
  });

  const announcement = useMemo(() => formatStatusAnnouncement(state), [state]);
  const winner = state.seats.find((seat) => seat.id === state.winnerId) ?? null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 py-2 px-3 select-none">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
          Pass &amp; play · {state.seats.length} seats
        </span>
      </div>

      <PushYourLuckArena
        state={state}
        reducedMotion={reducedMotion}
        onPush={push}
        onBank={bank}
        onNewMatch={handleNewMatch}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      <PushYourLuckResultOverlay
        winner={winner}
        seats={state.seats}
        reducedMotion={reducedMotion}
        onNewMatch={handleNewMatch}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      <PushYourLuckSetupModal
        isOpen={isSetupOpen}
        current={config}
        onClose={() => setIsSetupOpen(false)}
        onStartMatch={startMatch}
      />
    </div>
  );
}
