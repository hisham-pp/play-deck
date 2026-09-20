'use client';

import React, { useEffect } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useKingdomMultiplayerStore } from '@/stores/kingdom-draft-multiplayer.store';

import { useKingdomDraft } from '../hooks/use-kingdom-draft';
import type { GridCoord } from '../types/kingdom-draft.types';
import { KingdomDraftStage } from './KingdomDraftStage';
import { KingdomGameOverModal } from './KingdomGameOverModal';
import { KingdomGridBoard } from './KingdomGridBoard';
import { KingdomLobby } from './KingdomLobby';
import { KingdomOpponentsOverview } from './KingdomOpponentsOverview';
import { KingdomSecretObjectiveCard } from './KingdomSecretObjectiveCard';

export function KingdomDraftGame() {
  const mpStore = useKingdomMultiplayerStore();

  const {
    phase,
    roomCode,
    round,
    pickInRound,
    totalRounds,
    draftPool,
    players,
    localPlayer,
    activePlayer,
    isLocalTurn,
    finalScores,
    startGame,
    restartGame,
    draftCard,
    placeCard,
  } = useKingdomDraft();

  // Populate bots for solo play if not in multiplayer room
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.players.length === 0) {
      mpStore.addBot();
      mpStore.addBot();
      mpStore.addBot();
    }
  }, [mpStore]);

  const handlePlaceCard = (coord: GridCoord) => {
    if (!localPlayer) return;
    placeCard(localPlayer.id, coord);
  };

  const opponents = players.filter((p) => p.id !== localPlayer?.id);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 select-none font-sans overflow-x-hidden">
      {/* Voice Dock for Online Rooms */}
      {roomCode && (
        <div className="fixed top-4 right-4 z-40">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {phase === 'lobby' && <KingdomLobby onStartGame={startGame} />}

      {(phase === 'drafting' || phase === 'placement') && (
        <div className="w-full flex flex-col gap-6 items-center">
          <KingdomDraftStage
            draftPool={draftPool}
            activePlayer={activePlayer}
            isLocalTurn={isLocalTurn}
            round={round}
            pickInRound={pickInRound}
            totalRounds={totalRounds}
            onDraftCard={(cardId) => {
              if (localPlayer) draftCard(localPlayer.id, cardId);
            }}
          />

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            <KingdomGridBoard player={localPlayer} onPlaceCard={handlePlaceCard} />
            <KingdomSecretObjectiveCard player={localPlayer} />
          </div>

          <KingdomOpponentsOverview opponents={opponents} />
        </div>
      )}

      {phase === 'game-over' && (
        <KingdomGameOverModal scores={finalScores} onRestart={restartGame} />
      )}
    </div>
  );
}
