'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_ONLINE } from '../engine/pen-fight-constants';
import { usePenFightEngine } from '../hooks/use-pen-fight-engine';
import { usePenFightMultiplayer } from '../hooks/use-pen-fight-multiplayer';
import { usePenFightSound } from '../hooks/use-pen-fight-sound';
import type {
  AIDifficulty,
  FlickImpulse,
  PenColor,
  PenFightMode,
  PenFightOutcome,
  PenFightPlayerId,
  PenSpeedMode,
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
    engine,
    setMode,
    setSpeedMode,
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

  const handleRemoteFlick = useCallback(
    (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
      arenaRef.current?.performFlick(playerId, direction, power);
    },
    [],
  );

  const {
    role,
    hasOpponent,
    isMyTurn,
    broadcastStartMatch,
    broadcastFlick,
    broadcastNextRound,
    broadcastRematch,
  } = usePenFightMultiplayer(engine, state.mode, state.activePlayer, handleRemoteFlick);

  const handleLocalFlick = useCallback(
    (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
      broadcastFlick(playerId, direction, power);
    },
    [broadcastFlick],
  );

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
      speedMode: PenSpeedMode;
      difficulty: AIDifficulty;
      names: Record<PenFightPlayerId, string>;
      colors: Record<PenFightPlayerId, PenColor>;
    }) => {
      setMode(config.mode);
      setSpeedMode(config.speedMode);
      setDifficulty(config.difficulty);
      startMatch();
      if (config.mode === 'online') {
        broadcastStartMatch();
      }
      setPlayerName('p1', config.names.p1);
      setPlayerName('p2', config.names.p2);
      setPlayerColor('p1', config.colors.p1);
      setPlayerColor('p2', config.colors.p2);
      arenaRef.current?.resetPositions();
      sound.playClick();
    },
    [
      setMode,
      setSpeedMode,
      setDifficulty,
      startMatch,
      broadcastStartMatch,
      setPlayerName,
      setPlayerColor,
      sound,
    ],
  );

  const handleNextRound = useCallback(() => {
    arenaRef.current?.resetPositions();
    nextRound();
    broadcastNextRound();
    sound.playClick();
  }, [nextRound, broadcastNextRound, sound]);

  const handleRematch = useCallback(() => {
    arenaRef.current?.resetPositions();
    requestRematch();
    broadcastRematch();
    sound.playClick();
  }, [requestRematch, broadcastRematch, sound]);

  const handleResetPositions = useCallback(() => {
    arenaRef.current?.resetPositions();
    sound.playClick();
  }, [sound]);

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen bg-[#05070c]">
      <PenFightArena
        ref={arenaRef}
        state={state}
        role={role}
        hasOpponent={hasOpponent}
        isMyTurn={isMyTurn()}
        onFlickTaken={flickTaken}
        onBeginSettling={beginSettling}
        onResolveRound={resolveRound}
        onLocalFlick={handleLocalFlick}
      />

      <PenFightHUD
        state={state}
        hasOpponent={hasOpponent}
        onOpenSetup={() => setIsSetupOpen(true)}
        onResetPositions={handleResetPositions}
      />

      {/* Anchored below the back link so it clears the arena HUD on both rows. */}
      {state.mode === MODE_ONLINE && (
        <RoomVoiceDock anchorClassName="left-3 top-16 sm:left-5 sm:top-20" />
      )}

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
        currentSpeedMode={state.speedMode}
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
