'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useSnakeLadderMultiplayerStore } from '@/stores/snake-ladder-multiplayer.store';
import { SnakeLadderDice } from '../engine/dice';
import type { SnakeLadderEngine } from '../engine/snake-ladder-engine';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';

/**
 * Room protocol. The host is the single authority for dice: guests ask, the
 * host rolls and broadcasts the value, and every client feeds it through the
 * same reducer, which rejects out-of-turn and duplicate actions on its own.
 */
export const ROOM_EVENTS = {
  seats: 'SEATS',
  start: 'START',
  rollRequest: 'ROLL_REQUEST',
  diceRolled: 'DICE_ROLLED',
  syncRequest: 'SYNC_REQUEST',
  stateSync: 'STATE_SYNC',
  restart: 'RESTART',
} as const;

/** How long the host waits before rolling on behalf of an absent player. */
const ABSENT_PLAYER_GRACE_MS = 6000;

interface UseSnakeLadderMultiplayerOptions {
  enabled: boolean;
  engine: SnakeLadderEngine;
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  localPlayerId: string | null;
  boardIsBusy: boolean;
  applyRoll: (playerId: string, value: number) => void;
  onSeats: (seats: SnakeLadderPlayer[]) => void;
  onStart: (seats: SnakeLadderPlayer[]) => void;
}

export interface UseSnakeLadderMultiplayerReturn {
  /** Rolls if this client is the host, otherwise asks the host to roll. */
  requestRoll: (playerId: string) => void;
  broadcastStart: (seats: SnakeLadderPlayer[]) => void;
  broadcastRestart: (seats: SnakeLadderPlayer[]) => void;
}

export function useSnakeLadderMultiplayer({
  enabled,
  engine,
  state,
  seats,
  localPlayerId,
  boardIsBusy,
  applyRoll,
  onSeats,
  onStart,
}: UseSnakeLadderMultiplayerOptions): UseSnakeLadderMultiplayerReturn {
  const transport = useSnakeLadderMultiplayerStore((s) => s.transport);
  const hostId = useSnakeLadderMultiplayerStore((s) => s.hostId);
  const disconnectedIds = useSnakeLadderMultiplayerStore((s) => s.disconnectedIds);
  const isHost = Boolean(hostId && localPlayerId && hostId === localPlayerId);

  // Handlers read fresh values without re-subscribing the channel on every render.
  const latest = useRef({ engine, seats, isHost, localPlayerId, applyRoll, onSeats, onStart });
  latest.current = { engine, seats, isHost, localPlayerId, applyRoll, onSeats, onStart };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  /** Host-only: settle a roll for `playerId` and tell the room. */
  const hostRoll = useCallback(
    (playerId: string) => {
      const { engine: liveEngine, seats: liveSeats, applyRoll: apply } = latest.current;
      const seat = liveSeats.find((s) => s.id === playerId);
      if (!seat || !liveEngine.canRoll(seat.seatIndex)) return;

      const value = SnakeLadderDice.roll();
      send(ROOM_EVENTS.diceRolled, { playerId, value });
      apply(playerId, value);
    },
    [send],
  );

  const handleMessage = useCallback(
    (msg: TransportMessage) => {
      if (msg.senderId === latest.current.localPlayerId) return;
      const { engine: liveEngine, applyRoll: apply } = latest.current;

      switch (msg.type) {
        case ROOM_EVENTS.seats: {
          if (latest.current.isHost) return;
          const { seats: incoming } = msg.payload as { seats: SnakeLadderPlayer[] };
          latest.current.onSeats(incoming);
          return;
        }
        case ROOM_EVENTS.start: {
          const { seats: incoming } = msg.payload as { seats: SnakeLadderPlayer[] };
          latest.current.onSeats(incoming);
          latest.current.onStart(incoming);
          return;
        }
        case ROOM_EVENTS.restart: {
          const { seats: incoming } = msg.payload as { seats: SnakeLadderPlayer[] };
          latest.current.onStart(incoming);
          return;
        }
        case ROOM_EVENTS.rollRequest: {
          // Only the host answers, and only for the seat actually on turn.
          if (!latest.current.isHost) return;
          const { playerId } = msg.payload as { playerId: string };
          hostRoll(playerId);
          return;
        }
        case ROOM_EVENTS.diceRolled: {
          const { playerId, value } = msg.payload as { playerId: string; value: number };
          apply(playerId, value);
          return;
        }
        case ROOM_EVENTS.syncRequest: {
          if (!latest.current.isHost) return;
          send(ROOM_EVENTS.stateSync, {
            state: liveEngine.getState(),
            seats: latest.current.seats,
          });
          return;
        }
        case ROOM_EVENTS.stateSync: {
          if (latest.current.isHost) return;
          const { state: snapshot, seats: incoming } = msg.payload as {
            state: SnakeLadderGameState;
            seats: SnakeLadderPlayer[];
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

  // A guest arriving or returning mid-match asks the host for the board.
  const askedForSyncRef = useRef(false);
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSyncRef.current) return;
    askedForSyncRef.current = true;
    send(ROOM_EVENTS.syncRequest, {});
  }, [enabled, transport, isHost, send]);

  // The host keeps the match moving when the seat on turn has dropped out.
  useEffect(() => {
    if (!enabled || !isHost || boardIsBusy) return;

    const seat = seats.find((s) => s.seatIndex === state.currentTurnSeatIndex);
    if (!seat || seat.type === 'bot' || !disconnectedIds.includes(seat.id)) return;
    if (!engine.canRoll(seat.seatIndex)) return;

    const timer = setTimeout(() => hostRoll(seat.id), ABSENT_PLAYER_GRACE_MS);
    return () => clearTimeout(timer);
  }, [
    enabled,
    isHost,
    boardIsBusy,
    seats,
    state.currentTurnSeatIndex,
    disconnectedIds,
    engine,
    hostRoll,
  ]);

  const requestRoll = useCallback(
    (playerId: string) => {
      if (isHost) {
        hostRoll(playerId);
        return;
      }
      send(ROOM_EVENTS.rollRequest, { playerId });
    },
    [isHost, hostRoll, send],
  );

  const broadcastStart = useCallback(
    (nextSeats: SnakeLadderPlayer[]) => send(ROOM_EVENTS.start, { seats: nextSeats }),
    [send],
  );

  const broadcastRestart = useCallback(
    (nextSeats: SnakeLadderPlayer[]) => send(ROOM_EVENTS.restart, { seats: nextSeats }),
    [send],
  );

  return { requestRoll, broadcastStart, broadcastRestart };
}
