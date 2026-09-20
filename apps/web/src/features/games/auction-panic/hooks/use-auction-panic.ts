'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuctionMultiplayerStore } from '@/stores/auction-panic-multiplayer.store';

import { decideBotBid, decideBotSteal } from '../engine/auction-bot';
import {
  calculateFinalScores,
  canPlaceBid,
  executeSteal,
  generateAuctionLots,
  recordBid,
  resolveAuctionLot,
  type LotOutcome,
} from '../engine/auction-engine';
import { AUCTION_EVENTS } from '../multiplayer/auction-protocol';
import { auctionSoundService } from '../services/auction-sound.service';
import type {
  AuctionLot,
  AuctionPhase,
  AuctionPlayer,
  FinalPlayerScore,
} from '../types/auction-panic.types';

export function useAuctionPanic() {
  const {
    roomCode,
    players: rosterPlayers,
    localPlayerId,
    transport,
    isHost,
    roundCount,
    status: networkStatus,
  } = useAuctionMultiplayerStore();

  const [phase, setPhase] = useState<AuctionPhase>('lobby');
  const [lots, setLots] = useState<AuctionLot[]>([]);
  const [currentLotIndex, setCurrentLotIndex] = useState<number>(0);
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);
  const [lastOutcome, setLastOutcome] = useState<LotOutcome | null>(null);
  const [finalScores, setFinalScores] = useState<FinalPlayerScore[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentLot = lots[currentLotIndex] ?? null;
  const localPlayer = players.find((p) => p.id === localPlayerId) ?? null;
  const isHostPlayer = isHost();

  const startNextLot = useCallback((nextIndex: number, allLots: AuctionLot[]) => {
    if (nextIndex >= allLots.length) {
      setPhase('game-over');
      return;
    }
    setCurrentLotIndex(nextIndex);
    setPhase('bidding');
  }, []);

  const handleHammerFall = useCallback(() => {
    if (!currentLot) return;
    auctionSoundService.playGavel();

    const outcome = resolveAuctionLot(currentLot, players);
    setLastOutcome(outcome);
    setPlayers(outcome.updatedPlayers);

    if (outcome.revealedItem.isJunk || outcome.revealedItem.isCursed) {
      auctionSoundService.playJunkReveal();
    } else {
      auctionSoundService.playTreasureReveal();
    }

    if (outcome.isStealRound && outcome.winnerId) {
      setPhase('steal-action');
    } else {
      setPhase('reveal');
      setTimeout(() => {
        setLots((prevLots) => {
          const nextIdx = currentLotIndex + 1;
          if (nextIdx >= prevLots.length) {
            const scores = calculateFinalScores(outcome.updatedPlayers);
            setFinalScores(scores);
            setPhase('game-over');
          } else {
            startNextLot(nextIdx, prevLots);
          }
          return prevLots;
        });
      }, 4000);
    }
  }, [currentLot, currentLotIndex, players, startNextLot]);

  // Main Bidding Timer
  useEffect(() => {
    if (phase !== 'bidding' || !currentLot) return;

    timerRef.current = setInterval(() => {
      setLots((prevLots) => {
        const active = prevLots[currentLotIndex];
        if (!active) return prevLots;

        if (active.timeRemaining <= 1) {
          clearInterval(timerRef.current!);
          if (isHostPlayer) handleHammerFall();
          return prevLots;
        }

        if (active.timeRemaining <= 5) {
          auctionSoundService.playUrgentTick();
        }

        const updatedLot = {
          ...active,
          timeRemaining: active.timeRemaining - 1,
          isTimerUrgent: active.timeRemaining <= 5,
        };

        const copy = [...prevLots];
        copy[currentLotIndex] = updatedLot;
        return copy;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentLotIndex, currentLot, isHostPlayer, handleHammerFall]);

  // Bot bidding tick (host simulates bots)
  useEffect(() => {
    if (phase !== 'bidding' || !currentLot || !isHostPlayer) return;

    const botTimer = setTimeout(
      () => {
        const bots = players.filter((p) => p.isBot);
        for (const bot of bots) {
          const decision = decideBotBid(bot, currentLot, players);
          if (decision.shouldBid) {
            placeBid(bot.id, decision.amount);
            break;
          }
        }
      },
      1200 + Math.random() * 1500,
    );

    return () => clearTimeout(botTimer);
  });

  const placeBid = useCallback(
    (bidderId: string, amount: number) => {
      const bidder = players.find((p) => p.id === bidderId);
      if (!bidder || !currentLot) return;

      const check = canPlaceBid(bidder, amount, currentLot);
      if (!check.valid) return;

      auctionSoundService.playBidTick();
      setLots((prevLots) => {
        const active = prevLots[currentLotIndex];
        if (!active) return prevLots;

        const updated = recordBid(active, bidder, amount);
        // Add 2s anti-snipe extension if under 3s
        if (updated.timeRemaining < 3 && updated.specialRound !== 'blind') {
          updated.timeRemaining = 4;
        }

        const copy = [...prevLots];
        copy[currentLotIndex] = updated;
        return copy;
      });

      if (transport) {
        transport.send(AUCTION_EVENTS.bid, { playerId: bidderId, amount }, bidderId);
      }
    },
    [currentLot, currentLotIndex, players, transport],
  );

  const performSteal = useCallback(
    (stealerId: string, victimId: string, itemId: string) => {
      auctionSoundService.playStealSnatch();
      const updated = executeSteal(players, stealerId, victimId, itemId);
      setPlayers(updated);
      setPhase('reveal');

      setTimeout(() => {
        setLots((prevLots) => {
          const nextIdx = currentLotIndex + 1;
          if (nextIdx >= prevLots.length) {
            setFinalScores(calculateFinalScores(updated));
            setPhase('game-over');
          } else {
            startNextLot(nextIdx, prevLots);
          }
          return prevLots;
        });
      }, 3000);

      if (transport) {
        transport.send(AUCTION_EVENTS.steal, { stealerId, victimId, itemId }, stealerId);
      }
    },
    [currentLotIndex, players, startNextLot, transport],
  );

  // Bot steal automation if bot won steal round
  useEffect(() => {
    if (phase !== 'steal-action' || !isHostPlayer || !lastOutcome?.winnerId) return;

    const winner = players.find((p) => p.id === lastOutcome.winnerId);
    if (!winner || !winner.isBot) return;

    const timer = setTimeout(() => {
      const stealDecision = decideBotSteal(winner, players);
      if (stealDecision) {
        performSteal(winner.id, stealDecision.targetPlayerId, stealDecision.itemId);
      } else {
        setPhase('reveal');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase, isHostPlayer, lastOutcome, players, performSteal]);

  const startGame = useCallback(() => {
    const generatedLots = generateAuctionLots(roundCount);
    setLots(generatedLots);
    setCurrentLotIndex(0);
    setPlayers(rosterPlayers);
    setPhase('bidding');

    if (transport) {
      transport.send(
        AUCTION_EVENTS.start,
        {
          players: rosterPlayers,
          lots: generatedLots,
        },
        localPlayerId ?? 'host',
      );
    }
  }, [roundCount, rosterPlayers, transport]);

  const restartGame = useCallback(() => {
    setLots([]);
    setCurrentLotIndex(0);
    setLastOutcome(null);
    setFinalScores([]);
    setPhase('lobby');
  }, []);

  return {
    phase,
    networkStatus,
    roomCode,
    localPlayer,
    players,
    currentLot,
    currentLotIndex,
    totalLots: lots.length,
    lastOutcome,
    finalScores,
    isHostPlayer,
    startGame,
    restartGame,
    placeBid,
    performSteal,
  };
}
