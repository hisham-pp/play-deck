'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useTelephoneMultiplayerStore } from '@/stores/telephone-drawing-multiplayer.store';

import { useTelephoneDrawing } from '../hooks/use-telephone-drawing';
import { TelephoneGameOverModal } from './TelephoneGameOverModal';
import { TelephoneLobby } from './TelephoneLobby';
import { TelephoneRevealStage } from './TelephoneRevealStage';
import { TelephoneTurnStage } from './TelephoneTurnStage';
import { TelephoneVotingStage } from './TelephoneVotingStage';

export function TelephoneDrawingGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useTelephoneMultiplayerStore();

  const [isSummaryDismissed, setIsSummaryDismissed] = useState<boolean>(false);

  const {
    gameState,
    localPlayerId,
    isHost,
    startGame,
    submitDrawing,
    submitDescription,
    advanceReveal,
    castVote,
    finalizeScores,
    restartGame,
  } = useTelephoneDrawing();

  // Auto initialize room if none
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Sketch Master',
        avatar: player?.avatar ?? '🎨',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        mpStore.addBot();
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const effectiveLocalId = localPlayerId ?? player?.id ?? 'player-local';

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] p-4 sm:p-6 w-full max-w-6xl mx-auto">
      {/* Voice Dock */}
      {mpStore.roomCode && (
        <div className="w-full mb-4 max-w-4xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {/* Lobby State */}
      {(!gameState || mpStore.status === 'lobby') && (
        <TelephoneLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          localPlayerId={effectiveLocalId}
          isHost={isHost}
          minPlayers={3}
          maxPlayers={8}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={() => {
            setIsSummaryDismissed(false);
            startGame();
          }}
        />
      )}

      {/* Active Game Phases */}
      {gameState && mpStore.status === 'playing' && (
        <>
          {gameState.phase === 'turn' && (
            <TelephoneTurnStage
              gameState={gameState}
              localPlayerId={effectiveLocalId}
              onSubmitDrawing={submitDrawing}
              onSubmitDescription={submitDescription}
            />
          )}

          {gameState.phase === 'reveal' && (
            <TelephoneRevealStage
              gameState={gameState}
              isHost={isHost}
              onAdvanceReveal={advanceReveal}
            />
          )}

          {gameState.phase === 'voting' && (
            <TelephoneVotingStage
              gameState={gameState}
              localPlayerId={effectiveLocalId}
              isHost={isHost}
              onCastVote={castVote}
              onFinalizeScores={finalizeScores}
            />
          )}

          {gameState.phase === 'game-over' && !isSummaryDismissed && (
            <TelephoneGameOverModal
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
