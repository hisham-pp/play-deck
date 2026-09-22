'use client';

import React, { useEffect, useState } from 'react';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useSpyNetworkMultiplayerStore } from '@/stores/spy-network-multiplayer.store';
import {
  castVote,
  createInitialState,
  spyGuessLocation,
  startVoting,
  submitQA,
  tallyFinalScores,
} from '../engine/spy-network-engine';
import type { SpyNetworkState } from '../types/spy-network.types';
import { SpyNetworkLobby } from './SpyNetworkLobby';
import { SpyNetworkPlayingView } from './SpyNetworkPlayingView';

export function SpyNetworkGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useSpyNetworkMultiplayerStore();
  const [gameState, setGameState] = useState<SpyNetworkState | null>(null);
  const [spyGuess, setSpyGuess] = useState('');

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

  const handleSubmitQA = (question: string, answer: string) => {
    if (!gameState?.currentQuestionerId || !gameState.currentRespondentId) return;
    setGameState(
      submitQA(
        gameState,
        gameState.currentQuestionerId,
        gameState.currentRespondentId,
        question,
        answer,
      ),
    );
  };

  const handleSpyGuess = () => {
    if (!gameState || !localPlayer?.isSpy) return;
    setGameState(tallyFinalScores(spyGuessLocation(gameState, localId, spyGuess)));
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] p-4 sm:p-6 w-full max-w-5xl mx-auto space-y-6">
      {mpStore.roomCode && (
        <div className="w-full max-w-4xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {(!gameState || mpStore.status === 'lobby') && (
        <SpyNetworkLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          isHost={isHost}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStart={handleStart}
        />
      )}

      {gameState && mpStore.status === 'playing' && (
        <SpyNetworkPlayingView
          gameState={gameState}
          localPlayer={localPlayer}
          localId={localId}
          isHost={isHost}
          spyGuess={spyGuess}
          onSubmitQA={handleSubmitQA}
          onStartVoting={() => setGameState(gameState ? startVoting(gameState) : null)}
          onVote={(id) => setGameState(gameState ? castVote(gameState, localId, id) : null)}
          onSpyGuessChange={setSpyGuess}
          onSpyGuessSubmit={handleSpyGuess}
          onTally={() => setGameState(gameState ? tallyFinalScores(gameState) : null)}
        />
      )}
    </div>
  );
}
