'use client';

import React, { useEffect } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useAuctionMultiplayerStore } from '@/stores/auction-panic-multiplayer.store';

import { useAuctionPanic } from '../hooks/use-auction-panic';
import { AuctionBiddingStage } from './AuctionBiddingStage';
import { AuctionGameOverModal } from './AuctionGameOverModal';
import { AuctionItemRevealStage } from './AuctionItemRevealStage';
import { AuctionLobby } from './AuctionLobby';
import { AuctionStealModal } from './AuctionStealModal';
import { AuctionTrophyCase } from './AuctionTrophyCase';

const DEFAULT_LOCAL_ID = 'player-local';

export function AuctionPanicGame() {
  const mpStore = useAuctionMultiplayerStore();

  const {
    phase,
    roomCode,
    localPlayer,
    players,
    currentLot,
    currentLotIndex,
    totalLots,
    lastOutcome,
    finalScores,
    startGame,
    restartGame,
    placeBid,
    performSteal,
  } = useAuctionPanic();

  // Initialize local solo player if not in multiplayer room
  useEffect(() => {
    if (!mpStore.roomCode && mpStore.players.length === 0) {
      mpStore.addBot();
      mpStore.addBot();
      mpStore.addBot();
    }
  }, [mpStore]);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 select-none font-sans overflow-x-hidden">
      {/* Voice Dock for Online Rooms */}
      {roomCode && (
        <div className="fixed top-4 right-4 z-40">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {phase === 'lobby' && <AuctionLobby onStartGame={startGame} />}

      {(phase === 'bidding' || phase === 'reveal' || phase === 'steal-action') && currentLot && (
        <div className="w-full flex flex-col gap-6 items-center">
          {phase === 'bidding' && (
            <AuctionBiddingStage
              currentLot={currentLot}
              localPlayer={localPlayer}
              players={players}
              totalLots={totalLots}
              onPlaceBid={placeBid}
            />
          )}

          {phase === 'reveal' && (
            <AuctionItemRevealStage outcome={lastOutcome} roundIndex={currentLotIndex + 1} />
          )}

          {/* Trophy Case always visible during auction */}
          <AuctionTrophyCase player={localPlayer} />
        </div>
      )}

      {phase === 'steal-action' && lastOutcome && (
        <AuctionStealModal
          winnerId={lastOutcome.winnerId ?? ''}
          players={players}
          localPlayerId={localPlayer?.id ?? DEFAULT_LOCAL_ID}
          onStealItem={performSteal}
        />
      )}

      {phase === 'game-over' && (
        <AuctionGameOverModal scores={finalScores} onRestart={restartGame} />
      )}
    </div>
  );
}
