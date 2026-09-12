'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { usePenFightEngine } from '../hooks/use-pen-fight-engine';
import { usePenFightSound } from '../hooks/use-pen-fight-sound';
import type {
  AIDifficulty,
  PenColor,
  PenFightMode,
  PenFightOutcome,
  PenFightPlayerId,
} from '../types/pen-fight.types';
import type { PenFightArenaHandle } from './PenFightArena';
import { PenFightHUD } from './PenFightHUD';
import { PenFightResultOverlay } from './PenFightResultOverlay';
import { PenFightSetupModal } from './PenFightSetupModal';

const PenFightArena = dynamic(() => import('./PenFightArena').then((mod) => mod.PenFightArena), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#05070c]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      <span className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
        Setting up the arena…
      </span>
    </div>
  ),
});

export function PenFightGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const arenaRef = useRef<PenFightArenaHandle | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const sound = usePenFightSound();
  const resultSoundKeyRef = useRef<string | null>(null);

  const handleMatchOver = useCallback(
    (winner: PenFightOutcome) => {
      recordGamePlayed(winner === 'p1', 'arcade');
    },
    [recordGamePlayed],
  );

  const {
    state,
    setMode,
    setDifficulty,
    setPlayerName,
    setPlayerColor,
    startMatch,
    flickTaken,
    beginSettling,
    resolveRound,
    nextRound,
    requestRematch,
  } = usePenFightEngine(handleMatchOver);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (state.phase !== 'round-over' && state.phase !== 'match-over') {
      resultSoundKeyRef.current = null;
      return;
    }
    const key = `${state.round}-${state.phase}`;
    if (resultSoundKeyRef.current === key) return;
    resultSoundKeyRef.current = key;
    if (state.phase === 'match-over') {
      sound.playMatchWin();
    } else {
      sound.playRoundWin();
    }
  }, [state.phase, state.round, sound]);

  const handleStartMatch = useCallback(
    (config: {
      mode: PenFightMode;
      difficulty: AIDifficulty;
      names: Record<PenFightPlayerId, string>;
      colors: Record<PenFightPlayerId, PenColor>;
    }) => {
      setMode(config.mode);
      setDifficulty(config.difficulty);
      startMatch();
      setPlayerName('p1', config.names.p1);
      setPlayerName('p2', config.names.p2);
      setPlayerColor('p1', config.colors.p1);
      setPlayerColor('p2', config.colors.p2);
      arenaRef.current?.resetPositions();
      sound.playClick();
    },
    [setMode, setDifficulty, startMatch, setPlayerName, setPlayerColor, sound],
  );

  const handleNextRound = useCallback(() => {
    arenaRef.current?.resetPositions();
    nextRound();
    sound.playClick();
  }, [nextRound, sound]);

  const handleRematch = useCallback(() => {
    arenaRef.current?.resetPositions();
    requestRematch();
    sound.playClick();
  }, [requestRematch, sound]);

  const handleResetPositions = useCallback(() => {
    arenaRef.current?.resetPositions();
    sound.playClick();
  }, [sound]);

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen bg-[#05070c]">
      <PenFightArena
        ref={arenaRef}
        state={state}
        onFlickTaken={flickTaken}
        onBeginSettling={beginSettling}
        onResolveRound={resolveRound}
      />

      <PenFightHUD
        state={state}
        onOpenSetup={() => setIsSetupOpen(true)}
        onResetPositions={handleResetPositions}
      />

      <PenFightResultOverlay
        state={state}
        onNextRound={handleNextRound}
        onRematch={handleRematch}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      <PenFightSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.difficulty}
        playerNames={{
          p1:
            state.players.p1.displayName === 'Player 1'
              ? (player?.displayName ?? 'Player 1')
              : state.players.p1.displayName,
          p2: state.players.p2.displayName,
        }}
        playerColors={{ p1: state.players.p1.color, p2: state.players.p2.color }}
        onStartMatch={handleStartMatch}
      />
    </div>
  );
}
