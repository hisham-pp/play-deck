'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useWhoAmIMultiplayerStore } from '@/stores/who-am-i-multiplayer.store';

import { useWhoAmI } from '../hooks/use-who-am-i';
import type { IdentityCategory } from '../types/who-am-i.types';
import { WhoAmIGameOverModal } from './WhoAmIGameOverModal';
import { WhoAmIHeadband } from './WhoAmIHeadband';
import { WhoAmILobby } from './WhoAmILobby';
import { WhoAmIQALog } from './WhoAmIQALog';
import { WhoAmIQuestionPanel } from './WhoAmIQuestionPanel';

export function WhoAmIGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useWhoAmIMultiplayerStore();

  const [selectedCategory, setSelectedCategory] = useState<IdentityCategory>('all');
  const [isSummaryDismissed, setIsSummaryDismissed] = useState<boolean>(false);

  const {
    gameState,
    localPlayerId,
    isHost,
    startGame,
    ask,
    answer,
    guess,
    pass,
    proceedToGuessing,
    restartGame,
  } = useWhoAmI();

  // Auto initialize room if none
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Detective',
        avatar: player?.avatar ?? '🕵️‍♂️',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const effectiveLocalId = localPlayerId ?? player?.id ?? 'player-local';

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] p-4 sm:p-6 w-full max-w-6xl mx-auto space-y-6">
      {/* Voice Dock */}
      {mpStore.roomCode && (
        <div className="w-full max-w-4xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {/* Lobby State */}
      {(!gameState || mpStore.status === 'lobby') && (
        <WhoAmILobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          localPlayerId={effectiveLocalId}
          isHost={isHost}
          minPlayers={3}
          maxPlayers={8}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={() => {
            setIsSummaryDismissed(false);
            startGame(selectedCategory);
          }}
        />
      )}

      {/* In-Game State */}
      {gameState && mpStore.status === 'playing' && (
        <>
          {/* Headband Arena Grid */}
          <div className="w-full">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Player Headbands ({gameState.players.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {gameState.players.map((p) => (
                <WhoAmIHeadband
                  key={p.id}
                  player={p}
                  isLocalPlayer={p.id === effectiveLocalId}
                  isActiveTurn={p.id === gameState.currentTurnPlayerId}
                />
              ))}
            </div>
          </div>

          {/* Action Question Panel */}
          {gameState.phase !== 'game-over' && (
            <WhoAmIQuestionPanel
              gameState={gameState}
              localPlayerId={effectiveLocalId}
              isHost={isHost}
              onAsk={ask}
              onAnswer={answer}
              onGuess={guess}
              onPass={pass}
              onProceedToGuessing={proceedToGuessing}
            />
          )}

          {/* Investigation Notebook & Q&A Log */}
          <WhoAmIQALog qaLog={gameState.qaLog} />

          {/* Game Over Modal */}
          {gameState.phase === 'game-over' && !isSummaryDismissed && (
            <WhoAmIGameOverModal
              players={gameState.players}
              isHost={isHost}
              onPlayAgain={() => {
                setIsSummaryDismissed(false);
                restartGame();
              }}
              onReturnToLobby={() => {
                setIsSummaryDismissed(true);
                mpStore.setStatus('lobby');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
