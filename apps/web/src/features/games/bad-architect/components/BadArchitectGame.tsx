'use client';

import React, { useEffect } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useArchitectMultiplayerStore } from '@/stores/bad-architect-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import { useBadArchitect } from '../hooks/use-bad-architect';
import { ArchitectGameOverModal } from './ArchitectGameOverModal';
import { ArchitectLobby } from './ArchitectLobby';
import { ArchitectView } from './ArchitectView';
import { ArchitectVotingStage } from './ArchitectVotingStage';
import { BuilderCanvas } from './BuilderCanvas';
import { RevealStage } from './RevealStage';

export function BadArchitectGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useArchitectMultiplayerStore();

  const {
    gameState,
    timeLeft,
    localGrid,
    selectedColor,
    setSelectedColor,
    setCellColor,
    clearCanvas,
    startGame,
    submitBuild,
    advanceToVoting,
    castVote,
    finalizeRound,
    nextRound,
    restartGame,
  } = useBadArchitect();

  // Initialize room if not in a room yet
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Master Builder',
        avatar: player?.avatar ?? '📐',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        // Add 2 bots so standard 3 players roster is ready
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const isArchitect = Boolean(gameState && gameState.architectId === mpStore.localPlayerId);
  const architectPlayer =
    mpStore.players.find((p) => p.id === gameState?.architectId) ?? mpStore.players[0]!;
  const builders = mpStore.players.filter((p) => p.id !== gameState?.architectId);
  const submittedBuilderIds = Object.keys(gameState?.submissions ?? {});
  const isSubmitted = Boolean(
    gameState && mpStore.localPlayerId && gameState.submissions[mpStore.localPlayerId],
  );

  // Next architect index
  const nextArchitectIndex = gameState
    ? (gameState.roundArchitectIndices[gameState.currentRound % gameState.players.length] ?? 0)
    : 0;
  const nextArchitect = gameState ? (gameState.players[nextArchitectIndex] ?? null) : null;

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
        <ArchitectLobby
          roomCode={mpStore.roomCode ?? 'ARCH'}
          players={mpStore.players}
          isHost={mpStore.isHost()}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={startGame}
        />
      )}

      {/* Briefing / Building Phase */}
      {gameState && (gameState.phase === 'briefing' || gameState.phase === 'building') && (
        <>
          {isArchitect ? (
            <ArchitectView
              blueprint={gameState.blueprint}
              timeLeft={timeLeft}
              phase={gameState.phase}
              builders={builders}
              submittedBuilderIds={submittedBuilderIds}
              isHost={mpStore.isHost()}
              onCallTime={() => submitBuild(localGrid)}
            />
          ) : (
            <BuilderCanvas
              grid={localGrid}
              timeLeft={timeLeft}
              architect={architectPlayer}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              onCellClick={setCellColor}
              onClear={clearCanvas}
              onSubmit={submitBuild}
              isSubmitted={isSubmitted}
            />
          )}
        </>
      )}

      {/* Reveal Stage */}
      {gameState?.phase === 'reveal' && (
        <RevealStage
          blueprint={gameState.blueprint}
          architect={architectPlayer}
          builders={builders}
          submissions={gameState.submissions}
          isHost={mpStore.isHost()}
          onAdvanceToVoting={advanceToVoting}
        />
      )}

      {/* Voting Stage */}
      {gameState?.phase === 'voting' && (
        <ArchitectVotingStage
          blueprint={gameState.blueprint}
          builders={builders}
          submissions={gameState.submissions}
          votes={gameState.votes}
          localPlayerId={mpStore.localPlayerId ?? ''}
          isHost={mpStore.isHost()}
          onCastVote={castVote}
          onFinalizeRound={finalizeRound}
        />
      )}

      {/* Round Summary or Game Over Modal */}
      {(gameState?.phase === 'round_summary' || gameState?.phase === 'game_over') && (
        <ArchitectGameOverModal
          isFinalGameOver={gameState.phase === 'game_over'}
          currentRound={gameState.currentRound}
          maxRounds={gameState.maxRounds}
          players={gameState.players}
          awards={gameState.awardResult}
          nextArchitect={nextArchitect}
          isHost={mpStore.isHost()}
          onNextRound={nextRound}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
