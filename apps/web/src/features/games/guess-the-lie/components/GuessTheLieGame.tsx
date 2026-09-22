'use client';

import React, { useEffect, useState } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useLieMultiplayerStore } from '@/stores/guess-the-lie-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import { useGuessTheLie } from '../hooks/use-guess-the-lie';
import { LieAnswerInput } from './LieAnswerInput';
import { LieDiscussionStage } from './LieDiscussionStage';
import { LieGameOverModal } from './LieGameOverModal';
import { LieLobby } from './LieLobby';
import { LieRevealStage } from './LieRevealStage';
import { LieRoleBriefing } from './LieRoleBriefing';
import { LieVotingStage } from './LieVotingStage';

export function GuessTheLieGame() {
  const player = usePlayerStore((s) => s.player);
  const mpStore = useLieMultiplayerStore();

  const [isSummaryDismissed, setIsSummaryDismissed] = useState<boolean>(false);

  const {
    gameState,
    timeLeft,
    isSpeaking,
    startGame,
    submitAnswer,
    advanceToVoting,
    castVote,
    finalizeRound,
    nextRound,
    restartGame,
    readAloudAnswers,
  } = useGuessTheLie();

  // Initialize room if not in a room yet
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.status === 'idle') {
      const hostIdentity = {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName ?? 'Detective',
        avatar: player?.avatar ?? '🕵️',
      };
      void mpStore.createRoom(hostIdentity).then(() => {
        // Add 2 bots so min 3 players threshold is fulfilled immediately
        mpStore.addBot();
        mpStore.addBot();
      });
    }
  }, [mpStore, player]);

  const me = gameState?.players.find((p) => p.id === mpStore.localPlayerId);
  const myAnswer = gameState?.answers.find((a) => a.authorId === mpStore.localPlayerId);
  const submittedCount = gameState?.answers.length ?? 0;

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
        <LieLobby
          roomCode={mpStore.roomCode ?? 'TRUTH'}
          players={mpStore.players}
          isHost={mpStore.isHost()}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStartGame={(cat, r, aTime, dTime) => {
            setIsSummaryDismissed(false);
            startGame(cat, r, aTime, dTime);
          }}
        />
      )}

      {/* Briefing Phase */}
      {gameState?.phase === 'briefing' && me && (
        <LieRoleBriefing role={me.role} prompt={gameState.currentPrompt} timeLeft={timeLeft} />
      )}

      {/* Answering Phase */}
      {gameState?.phase === 'answering' && me && (
        <LieAnswerInput
          prompt={gameState.currentPrompt}
          player={me}
          allPlayers={gameState.players}
          submittedCount={submittedCount}
          timeLeft={timeLeft}
          onSubmitAnswer={submitAnswer}
          hasSubmitted={Boolean(myAnswer)}
        />
      )}

      {/* Discussion Stage */}
      {gameState?.phase === 'discussion' && (
        <LieDiscussionStage
          prompt={gameState.currentPrompt}
          answers={gameState.answers}
          timeLeft={timeLeft}
          isHost={mpStore.isHost()}
          isSpeaking={isSpeaking}
          onReadAloud={readAloudAnswers}
          onProceedToVoting={advanceToVoting}
        />
      )}

      {/* Voting Stage */}
      {gameState?.phase === 'voting' && (
        <LieVotingStage
          prompt={gameState.currentPrompt}
          answers={gameState.answers}
          localPlayerId={mpStore.localPlayerId ?? ''}
          players={gameState.players}
          myVotedAnswerId={me?.votedAnswerId ?? null}
          isHost={mpStore.isHost()}
          onCastVote={castVote}
          onFinalize={finalizeRound}
        />
      )}

      {/* Reveal Stage */}
      {gameState?.phase === 'reveal' && (
        <LieRevealStage
          prompt={gameState.currentPrompt}
          answers={gameState.answers}
          roundResult={gameState.roundResult}
          players={gameState.players}
          isHost={mpStore.isHost()}
          onProceedToSummary={() => setIsSummaryDismissed(false)}
        />
      )}

      {/* Round Summary or Game Over Modal */}
      {(gameState?.phase === 'round_summary' || gameState?.phase === 'game_over') &&
        !isSummaryDismissed && (
          <LieGameOverModal
            isFinalGameOver={gameState.phase === 'game_over'}
            currentRound={gameState.currentRound}
            maxRounds={gameState.maxRounds}
            players={gameState.players}
            roundResult={gameState.roundResult}
            isHost={mpStore.isHost()}
            onNextRound={() => {
              setIsSummaryDismissed(false);
              nextRound();
            }}
            onRestart={restartGame}
          />
        )}
    </div>
  );
}
