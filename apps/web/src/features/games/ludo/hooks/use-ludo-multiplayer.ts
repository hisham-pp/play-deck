'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { DiceService } from '../engine/dice';
import type { LudoEngine } from '../engine/ludo-engine';
import type { LudoGameState, LudoPlayer } from '../types/ludo.types';

export const LUDO_ROOM_EVENTS = {
  seats: 'SEATS',
  start: 'START',
  restart: 'RESTART',
  rollRequest: 'ROLL_REQUEST',
  diceRolled: 'DICE_ROLLED',
  moveRequest: 'MOVE_REQUEST',
  pieceMoved: 'PIECE_MOVED',
  syncRequest: 'SYNC_REQUEST',
  stateSync: 'STATE_SYNC',
} as const;

const ABSENT_PLAYER_GRACE_MS = 6000;

interface UseLudoMultiplayerOptions {
  enabled: boolean;
  engine: LudoEngine;
  state: LudoGameState;
  players: LudoPlayer[];
  localPlayerId: string | null;
  applyRoll: (playerId: string, value: number) => void;
  applyMove: (playerId: string, pieceId: string) => void;
  onSeats: (players: LudoPlayer[]) => void;
  onStart: (players: LudoPlayer[]) => void;
}

export interface UseLudoMultiplayerReturn {
  requestRoll: (playerId: string) => void;
  requestMove: (playerId: string, pieceId: string) => void;
  broadcastStart: (players: LudoPlayer[]) => void;
  broadcastRestart: (players: LudoPlayer[]) => void;
}

export function useLudoMultiplayer({
  enabled,
  engine,
  state,
  players,
  localPlayerId,
  applyRoll,
  applyMove,
  onSeats,
  onStart,
}: UseLudoMultiplayerOptions): UseLudoMultiplayerReturn {
  const transport = useLudoMultiplayerStore((s) => s.transport);
  const hostId = useLudoMultiplayerStore((s) => s.hostId);
  const disconnectedIds = useLudoMultiplayerStore((s) => s.disconnectedIds);
  const isHost = Boolean(hostId && localPlayerId && hostId === localPlayerId);

  const latest = useRef({
    engine,
    players,
    isHost,
    localPlayerId,
    applyRoll,
    applyMove,
    onSeats,
    onStart,
  });
  latest.current = {
    engine,
    players,
    isHost,
    localPlayerId,
    applyRoll,
    applyMove,
    onSeats,
    onStart,
  };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const hostRoll = useCallback(
    (playerId: string) => {
      const { engine: liveEngine, players: livePlayers, applyRoll: apply } = latest.current;
      const seat = livePlayers.find((s) => s.id === playerId);
      if (!seat || !liveEngine.canRoll(seat.seatIndex)) return;

      const value = DiceService.roll();
      send(LUDO_ROOM_EVENTS.diceRolled, { playerId, value });
      apply(playerId, value);
    },
    [send],
  );

  const handleMessage = useCallback(
    (msg: TransportMessage) => {
      if (msg.senderId === latest.current.localPlayerId) return;
      const { engine: liveEngine, applyRoll: applyR, applyMove: applyM } = latest.current;

      switch (msg.type) {
        case LUDO_ROOM_EVENTS.seats: {
          if (latest.current.isHost) return;
          const { seats: incoming } = msg.payload as { seats: LudoPlayer[] };
          latest.current.onSeats(incoming);
          return;
        }
        case LUDO_ROOM_EVENTS.start: {
          const { players: incoming } = msg.payload as { players: LudoPlayer[] };
          latest.current.onSeats(incoming);
          latest.current.onStart(incoming);
          return;
        }
        case LUDO_ROOM_EVENTS.restart: {
          const { players: incoming } = msg.payload as { players: LudoPlayer[] };
          latest.current.onStart(incoming);
          return;
        }
        case LUDO_ROOM_EVENTS.rollRequest: {
          if (!latest.current.isHost) return;
          const { playerId } = msg.payload as { playerId: string };
          hostRoll(playerId);
          return;
        }
        case LUDO_ROOM_EVENTS.diceRolled: {
          const { playerId, value } = msg.payload as { playerId: string; value: number };
          applyR(playerId, value);
          return;
        }
        case LUDO_ROOM_EVENTS.moveRequest: {
          const { playerId, pieceId } = msg.payload as { playerId: string; pieceId: string };
          if (latest.current.isHost) {
            send(LUDO_ROOM_EVENTS.pieceMoved, { playerId, pieceId });
          }
          applyM(playerId, pieceId);
          return;
        }
        case LUDO_ROOM_EVENTS.pieceMoved: {
          const { playerId, pieceId } = msg.payload as { playerId: string; pieceId: string };
          applyM(playerId, pieceId);
          return;
        }
        case LUDO_ROOM_EVENTS.syncRequest: {
          if (!latest.current.isHost) return;
          send(LUDO_ROOM_EVENTS.stateSync, {
            state: liveEngine.getState(),
            players: latest.current.players,
          });
          return;
        }
        case LUDO_ROOM_EVENTS.stateSync: {
          if (latest.current.isHost) return;
          const { state: snapshot, players: incoming } = msg.payload as {
            state: LudoGameState;
            players: LudoPlayer[];
          };
          latest.current.onSeats(incoming);
          liveEngine.loadState(snapshot);
          return;
        }
        default:
          return;
      }
    },
    [hostRoll, send],
  );

  useEffect(() => {
    if (!enabled || !transport) return;
    return transport.onAction(handleMessage);
  }, [enabled, transport, handleMessage]);

  // Request state sync if guest joins mid-game
  const askedForSyncRef = useRef(false);
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSyncRef.current) return;
    askedForSyncRef.current = true;
    send(LUDO_ROOM_EVENTS.syncRequest, {});
  }, [enabled, transport, isHost, send]);

  // Host auto-rolls for disconnected human player after grace period
  useEffect(() => {
    if (!enabled || !isHost) return;

    const seat = players.find((s) => s.seatIndex === state.currentTurnSeatIndex);
    if (!seat || seat.type === 'bot' || !disconnectedIds.includes(seat.id)) return;
    if (!engine.canRoll(seat.seatIndex)) return;

    const timer = setTimeout(() => hostRoll(seat.id), ABSENT_PLAYER_GRACE_MS);
    return () => clearTimeout(timer);
  }, [enabled, isHost, players, state.currentTurnSeatIndex, disconnectedIds, engine, hostRoll]);

  const requestRoll = useCallback(
    (playerId: string) => {
      if (isHost) {
        hostRoll(playerId);
        return;
      }
      send(LUDO_ROOM_EVENTS.rollRequest, { playerId });
    },
    [isHost, hostRoll, send],
  );

  const requestMove = useCallback(
    (playerId: string, pieceId: string) => {
      if (isHost) {
        send(LUDO_ROOM_EVENTS.pieceMoved, { playerId, pieceId });
        applyMove(playerId, pieceId);
        return;
      }
      send(LUDO_ROOM_EVENTS.moveRequest, { playerId, pieceId });
      applyMove(playerId, pieceId);
    },
    [isHost, send, applyMove],
  );

  const broadcastStart = useCallback(
    (nextPlayers: LudoPlayer[]) => send(LUDO_ROOM_EVENTS.start, { players: nextPlayers }),
    [send],
  );

  const broadcastRestart = useCallback(
    (nextPlayers: LudoPlayer[]) => send(LUDO_ROOM_EVENTS.restart, { players: nextPlayers }),
    [send],
  );

  return { requestRoll, requestMove, broadcastStart, broadcastRestart };
}
