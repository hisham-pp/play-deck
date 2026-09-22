'use client';

import React, { useEffect, useState } from 'react';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useSecretMissionMultiplayerStore } from '@/stores/secret-mission-multiplayer.store';
import {
  createInitialState,
  declareMissionComplete,
  endRound,
  makeAccusation,
  resolveAccusation,
} from '../engine/secret-mission-engine';
import type { SecretMissionState } from '../types/secret-mission.types';
import { SecretMissionAccusationPanel } from './SecretMissionAccusationPanel';
import { SecretMissionBriefing } from './SecretMissionBriefing';
import { SecretMissionGameOverModal } from './SecretMissionGameOverModal';
import { SecretMissionLobby } from './SecretMissionLobby';
import { SecretMissionPendingAccusations } from './SecretMissionPendingAccusations';

export function SecretMissionGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useSecretMissionMultiplayerStore();
  const [gameState, setGameState] = useState<SecretMissionState | null>(null);

  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const host = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Agent',
        avatar: player?.avatar ?? '🕵️',
      };
      void mpStore.createRoom(host).then(() => {
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const localId = mpStore.localPlayerId ?? player?.id ?? 'player-local';
  const isHost = mpStore.isHost();
  const localPlayer = gameState?.players.find((p) => p.id === localId);

  const handleStart = () => {
    const state = createInitialState(mpStore.players);
    mpStore.setStatus('playing');
    setGameState(state);
  };

  const handleDeclareComplete = () => {
    if (!gameState) return;
    setGameState(declareMissionComplete(gameState, localId));
  };

  const handleAccuse = (suspectId: string, description: string) => {
    if (!gameState) return;
    setGameState(makeAccusation(gameState, localId, suspectId, description));
  };

  const handleResolve = (idx: number, isCorrect: boolean) => {
    if (!gameState) return;
    setGameState(resolveAccusation(gameState, idx, isCorrect));
  };

  const handleEndRound = () => {
    if (!gameState) return;
    setGameState(endRound(gameState));
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] p-4 sm:p-6 w-full max-w-5xl mx-auto space-y-6">
      {mpStore.roomCode && (
        <div className="w-full max-w-4xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {(!gameState || mpStore.status === 'lobby') && (
        <SecretMissionLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          isHost={isHost}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStart={handleStart}
        />
      )}

      {gameState && mpStore.status === 'playing' && (
        <>
          <div className="w-full flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-deck-400">
              Round {gameState.roundNumber} of {gameState.maxRounds}
            </p>
            <span className="text-xs text-amber-400 font-semibold">Phase: {gameState.phase}</span>
          </div>

          <SecretMissionBriefing localPlayer={localPlayer} />

          {!localPlayer?.isMissionComplete && gameState.phase === 'playing' && (
            <button
              onClick={handleDeclareComplete}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              ✅ Declare Mission Complete
            </button>
          )}

          <SecretMissionAccusationPanel
            players={gameState.players}
            localPlayerId={localId}
            isHost={isHost}
            onAccuse={handleAccuse}
          />

          {isHost && (
            <SecretMissionPendingAccusations
              accusations={gameState.accusations}
              onResolve={handleResolve}
            />
          )}

          {isHost && (
            <button
              onClick={handleEndRound}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors"
            >
              End Round →
            </button>
          )}
        </>
      )}

      {gameState?.phase === 'game-over' && (
        <SecretMissionGameOverModal players={gameState.players} />
      )}
    </div>
  );
}
