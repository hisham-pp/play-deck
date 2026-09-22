'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useImposterBuilderMultiplayerStore } from '@/stores/imposter-builder-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import {
  castVote,
  createInitialState,
  revealBuilds,
  startDiscussion,
  startVoting,
  tallyFinalScores,
  toggleCell,
} from '../engine/imposter-builder-engine';
import type { ImposterBuilderState } from '../types/imposter-builder.types';
import { ImposterBuilderLobby } from './ImposterBuilderLobby';
import { ImposterBuilderPlayingView } from './ImposterBuilderPlayingView';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

export function ImposterBuilderGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useImposterBuilderMultiplayerStore();
  const [gameState, setGameState] = useState<ImposterBuilderState | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]!);

  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const host = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Builder',
        avatar: player?.avatar ?? '🏗️',
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
        <ImposterBuilderLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          isHost={isHost}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStart={handleStart}
        />
      )}

      {gameState && mpStore.status === 'playing' && (
        <ImposterBuilderPlayingView
          gameState={gameState}
          localPlayer={localPlayer}
          localId={localId}
          isHost={isHost}
          colors={COLORS}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          onCellToggle={(r, c) =>
            setGameState(gameState ? toggleCell(gameState, localId, r, c, selectedColor) : null)
          }
          onReveal={() => setGameState(gameState ? revealBuilds(gameState) : null)}
          onDiscussion={() => setGameState(gameState ? startDiscussion(gameState) : null)}
          onVoting={() => setGameState(gameState ? startVoting(gameState) : null)}
          onVote={(id) =>
            setGameState(gameState ? tallyFinalScores(castVote(gameState, localId, id)) : null)
          }
        />
      )}
    </div>
  );
}
