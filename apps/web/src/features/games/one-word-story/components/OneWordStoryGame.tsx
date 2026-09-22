'use client';

import React, { useEffect } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useStoryMultiplayerStore } from '@/stores/one-word-story-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import { useOneWordStory } from '../hooks/use-one-word-story';
import { StoryBookStage } from './StoryBookStage';
import { StoryGameOverModal } from './StoryGameOverModal';
import { StoryLobby } from './StoryLobby';
import { StoryReadbackStage } from './StoryReadbackStage';
import { StoryVotingStage } from './StoryVotingStage';
import { StoryWordInput } from './StoryWordInput';

export function OneWordStoryGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useStoryMultiplayerStore();

  const {
    gameState,
    timeLeft,
    isSpeaking,
    startGame,
    submitWord,
    castVote,
    advanceToVoting,
    finalizeStory,
    restartGame,
    readAloudStory,
  } = useOneWordStory();

  // Initialize room if not in a room yet
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Storyteller',
        avatar: player?.avatar ?? '✍️',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        // Add 2 bots so min 3 players threshold is fulfilled right away
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const activePlayer = mpStore.players.find((p) => p.id === gameState?.activePlayerId);
  const isMyTurn = Boolean(gameState && gameState.activePlayerId === mpStore.localPlayerId);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] bg-[#090d16] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 font-sans select-none overflow-x-hidden">
      {/* Voice Dock for Online Rooms */}
      {mpStore.roomCode && (
        <div className="fixed top-4 right-4 z-40">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {/* Lobby Phase */}
      {(!gameState || mpStore.status === 'lobby') && (
        <StoryLobby
          roomCode={mpStore.roomCode ?? 'STORY'}
          players={mpStore.players}
          isHost={mpStore.isHost()}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={startGame}
        />
      )}

      {/* Storytelling Phase */}
      {gameState?.phase === 'storytelling' && (
        <div className="flex flex-col gap-6 w-full items-center">
          <StoryBookStage gameState={gameState} players={mpStore.players} />
          <StoryWordInput
            isMyTurn={isMyTurn}
            activePlayer={activePlayer}
            timeLeft={timeLeft}
            totalTime={gameState.turnDurationSeconds}
            onSubmitWord={submitWord}
          />
        </div>
      )}

      {/* Story Readback Phase */}
      {gameState?.phase === 'readback' && (
        <StoryReadbackStage
          gameState={gameState}
          isSpeaking={isSpeaking}
          onReadAloud={readAloudStory}
          onProceedToVoting={advanceToVoting}
        />
      )}

      {/* Voting Phase */}
      {gameState?.phase === 'voting' && (
        <StoryVotingStage
          gameState={gameState}
          players={mpStore.players}
          localPlayerId={mpStore.localPlayerId ?? ''}
          onCastVote={castVote}
          onFinalize={finalizeStory}
        />
      )}

      {/* Game Over / Ceremony Phase */}
      {gameState?.phase === 'game_over' && (
        <StoryGameOverModal
          gameState={gameState}
          players={mpStore.players}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
