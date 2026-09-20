'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useAlibiMultiplayerStore } from '@/stores/alibi-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import {
  castVote,
  createInitialState,
  startDiscussion,
  startVoting,
  tallyFinalScores,
} from '../engine/alibi-engine';
import type { AlibiState } from '../types/alibi.types';
import { AlibiLobby } from './AlibiLobby';
import { AlibiPlayingView } from './AlibiPlayingView';

export function AlibiGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useAlibiMultiplayerStore();
  const [gameState, setGameState] = useState<AlibiState | null>(null);

  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const host = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Detective',
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

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] p-4 sm:p-6 w-full max-w-5xl mx-auto space-y-6">
      {mpStore.roomCode && (
        <div className="w-full max-w-4xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {(!gameState || mpStore.status === 'lobby') && (
        <AlibiLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          isHost={isHost}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStart={handleStart}
        />
      )}

      {gameState && mpStore.status === 'playing' && (
        <AlibiPlayingView
          gameState={gameState}
          localPlayer={localPlayer}
          localId={localId}
          isHost={isHost}
          onDiscussion={() => setGameState(gameState ? startDiscussion(gameState) : null)}
          onVoting={() => setGameState(gameState ? startVoting(gameState) : null)}
          onVote={(id) => setGameState(gameState ? castVote(gameState, localId, id) : null)}
          onTally={() => setGameState(gameState ? tallyFinalScores(gameState) : null)}
        />
      )}
    </div>
  );
}
