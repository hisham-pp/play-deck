'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useWrongAnswersMultiplayerStore } from '@/stores/wrong-answers-multiplayer.store';

import { useWrongAnswers } from '../hooks/use-wrong-answers';
import { WrongAnswersDiscussion } from './WrongAnswersDiscussion';
import { WrongAnswersGameOverModal } from './WrongAnswersGameOverModal';
import { WrongAnswersInput } from './WrongAnswersInput';
import { WrongAnswersLobby } from './WrongAnswersLobby';
import { WrongAnswersReveal } from './WrongAnswersReveal';
import { WrongAnswersVoting } from './WrongAnswersVoting';

export function WrongAnswersGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useWrongAnswersMultiplayerStore();

  const [isSummaryDismissed, setIsSummaryDismissed] = useState<boolean>(false);

  const {
    gameState,
    localPlayerId,
    isHost,
    activeSpeechAnswerId,
    startGame,
    submitAnswer,
    castVote,
    setPhase,
    advanceRound,
    restartGame,
    readAnswerAloud,
    stopReading,
  } = useWrongAnswers();

  // Auto initialize room if none
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Comedian',
        avatar: player?.avatar ?? '🤪',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const effectiveLocalId = localPlayerId ?? player?.id ?? 'player-local';

  const hasSubmitted = Boolean(
    gameState?.players.find((p) => p.id === effectiveLocalId)?.hasSubmitted,
  );

  const myVotedAnswerId =
    gameState?.players.find((p) => p.id === effectiveLocalId)?.votedAnswerId ?? null;

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
        <WrongAnswersLobby
          roomCode={mpStore.roomCode}
          players={mpStore.players}
          localPlayerId={effectiveLocalId}
          isHost={isHost}
          minPlayers={3}
          maxPlayers={8}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={startGame}
        />
      )}

      {/* Playing States */}
      {gameState && mpStore.status === 'playing' && (
        <>
          {gameState.phase === 'answering' && (
            <WrongAnswersInput
              question={gameState.currentQuestion}
              roundNumber={gameState.currentRound}
              totalRounds={gameState.totalRounds}
              timeRemaining={gameState.timeRemaining}
              players={gameState.players}
              localPlayerId={effectiveLocalId}
              hasSubmitted={hasSubmitted}
              isHost={isHost}
              onSubmit={submitAnswer}
              onSkipToDiscussion={() => setPhase('discussion', 40)}
            />
          )}

          {gameState.phase === 'discussion' && (
            <WrongAnswersDiscussion
              question={gameState.currentQuestion}
              answers={gameState.answers}
              activeSpeechAnswerId={activeSpeechAnswerId}
              isHost={isHost}
              onReadAloud={readAnswerAloud}
              onStopReading={stopReading}
              onProceedToVoting={() => setPhase('voting', 30)}
            />
          )}

          {gameState.phase === 'voting' && (
            <WrongAnswersVoting
              question={gameState.currentQuestion}
              answers={gameState.answers}
              localPlayerId={effectiveLocalId}
              players={gameState.players}
              myVotedAnswerId={myVotedAnswerId}
              isHost={isHost}
              onCastVote={castVote}
              onFinalize={() => setPhase('reveal', 20)}
            />
          )}

          {gameState.phase === 'reveal' && (
            <WrongAnswersReveal
              question={gameState.currentQuestion}
              answers={gameState.answers}
              roundResult={gameState.roundResult}
              players={gameState.players}
              currentRound={gameState.currentRound}
              totalRounds={gameState.totalRounds}
              isHost={isHost}
              onProceedNext={advanceRound}
            />
          )}

          {gameState.phase === 'game-over' && !isSummaryDismissed && (
            <WrongAnswersGameOverModal
              players={gameState.players}
              isHost={isHost}
              onPlayAgain={restartGame}
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
