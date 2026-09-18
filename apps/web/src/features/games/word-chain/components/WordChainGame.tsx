'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { useWordChainEngine } from '../hooks/use-word-chain-engine';
import type { WordChainRules, WordChainSetupPlayer } from '../types/word-chain.types';
import { WordChainAnnouncer } from './WordChainAnnouncer';
import { WordChainHistory } from './WordChainHistory';
import { WordChainOverlay } from './WordChainOverlay';
import { WordChainPlayers } from './WordChainPlayers';
import { WordChainPrompt } from './WordChainPrompt';
import { WordChainSetupModal } from './WordChainSetupModal';
import { WordChainStatsCard } from './WordChainStatsCard';
import { WordChainStatusBar } from './WordChainStatusBar';

export function WordChainGame() {
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { recordGamePlayed } = usePlayerStore();
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  // Replaying reuses the last rules, so "Play again" never reopens the modal.
  const lastSetupRef = useRef<{ rules: WordChainRules; players: WordChainSetupPlayer[] } | null>(
    null,
  );

  const handleFinished = useCallback(
    (won: boolean) => {
      recordGamePlayed(won, 'puzzle');
      if (!currentSession) return;

      const result = endSession(undefined, !won);
      if (result) {
        addRecentSession({
          ...currentSession,
          status: 'completed',
          endedAt: new Date().toISOString(),
        });
      }
    },
    [currentSession, endSession, addRecentSession, recordGamePlayed],
  );

  const { state, stats, clock, countdown, isPreparing, controls } = useWordChainEngine({
    onFinished: handleFinished,
  });

  const handleStart = useCallback(
    (rules: WordChainRules, players: WordChainSetupPlayer[]) => {
      lastSetupRef.current = { rules, players };
      setIsSetupOpen(false);
      void controls.startGame(rules, players);
    },
    [controls],
  );

  const handlePlayAgain = useCallback(() => {
    const last = lastSetupRef.current;
    if (!last) {
      setIsSetupOpen(true);
      return;
    }
    void controls.startGame(last.rules, last.players);
  }, [controls]);

  const openSetup = useCallback(() => setIsSetupOpen(true), []);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-3 py-1">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <WordChainAnnouncer state={state} />

      <div className="w-full grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] items-start">
        <div className="flex flex-col gap-3">
          <WordChainStatusBar
            state={state}
            clock={clock}
            onPause={controls.pause}
            onResume={controls.resume}
          />

          <div className="relative rounded-xl border border-surface-border bg-surface-raised shadow-arcade min-h-[300px] flex items-center justify-center p-6 arcade-texture">
            <WordChainPrompt
              state={state}
              onSubmit={(word) => void controls.submitWord(word)}
              onType={controls.clearRejection}
            />

            <WordChainOverlay
              state={state}
              countdown={countdown}
              onResume={controls.resume}
              onPlayAgain={handlePlayAgain}
              onOpenSetup={openSetup}
            />
          </div>

          <WordChainHistory state={state} />
        </div>

        <div className="w-full flex flex-col gap-3 lg:sticky lg:top-4">
          <WordChainPlayers state={state} />
          <WordChainStatsCard stats={stats} onOpenSetup={openSetup} />
        </div>
      </div>

      <WordChainSetupModal
        isOpen={isSetupOpen}
        isPreparing={isPreparing}
        onClose={state.status === 'setup' ? undefined : () => setIsSetupOpen(false)}
        onStart={handleStart}
      />
    </div>
  );
}
