'use client';

import { useCallback, useEffect, useState } from 'react';

import { useKingdomMultiplayerStore } from '@/stores/kingdom-draft-multiplayer.store';

import { chooseBotDraftCard, chooseBotGridPlacement } from '../engine/kingdom-bot';
import {
  assignSecretObjectives,
  calculateFinalKingdomScores,
  calculateGridScore,
  createEmptyGrid,
  generateDraftPool,
  getSnakeDraftOrder,
  PICKS_PER_ROUND,
  TOTAL_ROUNDS,
} from '../engine/kingdom-engine';
import { KINGDOM_EVENTS } from '../multiplayer/kingdom-protocol';
import { kingdomSoundService } from '../services/kingdom-sound.service';
import type {
  FinalKingdomScore,
  GridCoord,
  KingdomPhase,
  KingdomPlayer,
  ResourceCard,
} from '../types/kingdom-draft.types';

const PHASE_DRAFTING = 'drafting';
const PHASE_PLACEMENT = 'placement';
const PHASE_GAME_OVER = 'game-over';

export function useKingdomDraft() {
  const {
    roomCode,
    players: rosterPlayers,
    localPlayerId,
    transport,
    isHost,
    status: networkStatus,
  } = useKingdomMultiplayerStore();

  const [phase, setPhase] = useState<KingdomPhase>('lobby');
  const [round, setRound] = useState<number>(0);
  const [pickInRound, setPickInRound] = useState<number>(0);
  const [draftPool, setDraftPool] = useState<ResourceCard[]>([]);
  const [players, setPlayers] = useState<KingdomPlayer[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [finalScores, setFinalScores] = useState<FinalKingdomScore[]>([]);

  const isHostPlayer = isHost();
  const localPlayer = players.find((p) => p.id === localPlayerId) ?? null;
  const draftOrder = getSnakeDraftOrder(round, players.length || 1);
  const activePlayerIndex = draftOrder[turnIndex % draftOrder.length] ?? 0;
  const activePlayer = players[activePlayerIndex] ?? null;
  const isLocalTurn = activePlayer?.id === localPlayerId;

  const advanceTurn = useCallback(
    (updatedPlayers: KingdomPlayer[]) => {
      const nextTurn = turnIndex + 1;
      if (nextTurn >= updatedPlayers.length) {
        // Completed one pick for every player in this round
        const nextPick = pickInRound + 1;
        if (nextPick >= PICKS_PER_ROUND) {
          // Completed this round
          const nextRound = round + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            // Finished all 9 tiles!
            const scores = calculateFinalKingdomScores(updatedPlayers);
            setFinalScores(scores);
            kingdomSoundService.playVictoryFanfare();
            setPhase(PHASE_GAME_OVER);
          } else {
            setRound(nextRound);
            setPickInRound(0);
            setTurnIndex(0);
            setDraftPool(generateDraftPool(updatedPlayers.length));
            setPhase(PHASE_DRAFTING);
          }
        } else {
          setPickInRound(nextPick);
          setTurnIndex(0);
          setPhase(PHASE_DRAFTING);
        }
      } else {
        setTurnIndex(nextTurn);
        setPhase(PHASE_DRAFTING);
      }
    },
    [turnIndex, pickInRound, round],
  );

  const placeCard = useCallback(
    (playerId: string, coord: GridCoord) => {
      setPlayers((prevPlayers) => {
        const player = prevPlayers.find((p) => p.id === playerId);
        if (!player || !player.unplacedCard || player.grid[coord.row]?.[coord.col] !== null) {
          return prevPlayers;
        }

        kingdomSoundService.playTilePlace();
        const updatedGrid = player.grid.map((r) => [...r]);
        updatedGrid[coord.row]![coord.col] = player.unplacedCard;
        const scoreData = calculateGridScore(updatedGrid);

        const updated = prevPlayers.map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            grid: updatedGrid,
            unplacedCard: null,
            score: scoreData.totalScore,
          };
        });

        advanceTurn(updated);
        return updated;
      });
    },
    [advanceTurn],
  );

  const draftCard = useCallback(
    (playerId: string, cardId: string) => {
      const card = draftPool.find((c) => c.id === cardId);
      if (!card) return;

      kingdomSoundService.playCardDraft();
      setDraftPool((prev) => prev.filter((c) => c.id !== cardId));

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== playerId) return p;
          return { ...p, unplacedCard: card };
        }),
      );

      setPhase(PHASE_PLACEMENT);

      if (transport) {
        transport.send(KINGDOM_EVENTS.draftCard, { playerId, cardId }, playerId);
      }
    },
    [draftPool, transport],
  );

  // Bot Turn Automation (Host handles bot drafting and placement)
  useEffect(() => {
    if (!isHostPlayer || !activePlayer?.isBot) return;

    if (phase === PHASE_DRAFTING && draftPool.length > 0) {
      const timer = setTimeout(() => {
        const botChoice = chooseBotDraftCard(activePlayer, draftPool);
        if (botChoice) {
          draftCard(activePlayer.id, botChoice.id);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (phase === PHASE_PLACEMENT && activePlayer.unplacedCard) {
      const timer = setTimeout(() => {
        const placement = chooseBotGridPlacement(activePlayer, activePlayer.unplacedCard!);
        if (placement) {
          placeCard(activePlayer.id, placement);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, isHostPlayer, activePlayer, draftPool, draftCard, placeCard]);

  const startGame = useCallback(() => {
    const objectives = assignSecretObjectives(rosterPlayers.length);
    const initialized = rosterPlayers.map((p, idx) => ({
      ...p,
      grid: createEmptyGrid(),
      secretObjective: objectives[idx] ?? null,
      unplacedCard: null,
      score: 0,
    }));

    setPlayers(initialized);
    setRound(0);
    setPickInRound(0);
    setTurnIndex(0);
    setDraftPool(generateDraftPool(initialized.length));
    setPhase(PHASE_DRAFTING);

    if (transport) {
      transport.send(
        KINGDOM_EVENTS.start,
        { players: initialized, round: 0 },
        localPlayerId ?? 'host',
      );
    }
  }, [rosterPlayers, transport, localPlayerId]);

  const restartGame = useCallback(() => {
    setPhase('lobby');
    setRound(0);
    setPickInRound(0);
    setTurnIndex(0);
    setFinalScores([]);
  }, []);

  return {
    phase,
    networkStatus,
    roomCode,
    round,
    pickInRound,
    totalRounds: TOTAL_ROUNDS,
    draftPool,
    players,
    localPlayer,
    activePlayer,
    isLocalTurn,
    finalScores,
    isHostPlayer,
    startGame,
    restartGame,
    draftCard,
    placeCard,
  };
}
