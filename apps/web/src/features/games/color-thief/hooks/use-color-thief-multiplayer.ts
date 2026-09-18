'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useColorThiefMultiplayerStore } from '@/stores/color-thief-multiplayer.store';
import type { ColorThiefEngine } from '../engine/color-thief-engine';
import type { ColorThiefGameState, ColorThiefSeat } from '../types/color-thief.types';

/**
 * Room protocol. Color Thief's reducer is fully deterministic — no dice, no
 * shuffles, and every spread resolves in board order — so peers exchange the
 * moves themselves rather than a host's settled outcome. The reducer rejects
 * out-of-turn and unaffordable moves on its own, which is what keeps the
 * boards identical without a server.
 */
export const ROOM_EVENTS = {
  seats: 'SEATS',
  start: 'START',
  claim: 'CLAIM',
  ability: 'ABILITY',
  endTurn: 'END_TURN',
  syncRequest: 'SYNC_REQUEST',
  stateSync: 'STATE_SYNC',
  restart: 'RESTART',
} as const;

/** How long the host waits before playing an absent seat's turn out. */
const ABSENT_PLAYER_GRACE_MS = 8000;

interface UseColorThiefMultiplayerOptions {
  enabled: boolean;
  engine: ColorThiefEngine;
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  localPlayerId: string | null;
  onSeats: (seats: ColorThiefSeat[]) => void;
  onStart: (seats: ColorThiefSeat[]) => void;
}

export interface UseColorThiefMultiplayerReturn {
  broadcastClaim: (playerId: string, index: number) => void;
  broadcastAbility: (playerId: string, targets: number[]) => void;
  broadcastEndTurn: (playerId: string) => void;
  broadcastStart: (seats: ColorThiefSeat[]) => void;
  broadcastRestart: (seats: ColorThiefSeat[]) => void;
}

export function useColorThiefMultiplayer({
  enabled,
  engine,
  state,
  seats,
  localPlayerId,
  onSeats,
  onStart,
}: UseColorThiefMultiplayerOptions): UseColorThiefMultiplayerReturn {
  const transport = useColorThiefMultiplayerStore((s) => s.transport);
  const hostId = useColorThiefMultiplayerStore((s) => s.hostId);
  const disconnectedIds = useColorThiefMultiplayerStore((s) => s.disconnectedIds);
  const isHost = Boolean(hostId && localPlayerId && hostId === localPlayerId);

  // Handlers read fresh values without re-subscribing the channel every render.
  const latest = useRef({ engine, seats, isHost, localPlayerId, onSeats, onStart });
  latest.current = { engine, seats, isHost, localPlayerId, onSeats, onStart };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const handleMessage = useCallback(
    (msg: TransportMessage) => {
      if (msg.senderId === latest.current.localPlayerId) return;
      const { engine: liveEngine } = latest.current;

      switch (msg.type) {
        case ROOM_EVENTS.seats: {
          if (latest.current.isHost) return;
          const { seats: incoming } = msg.payload as { seats: ColorThiefSeat[] };
          latest.current.onSeats(incoming);
          return;
        }
        case ROOM_EVENTS.start:
        case ROOM_EVENTS.restart: {
          const { seats: incoming } = msg.payload as { seats: ColorThiefSeat[] };
          latest.current.onSeats(incoming);
          latest.current.onStart(incoming);
          return;
        }
        case ROOM_EVENTS.claim: {
          const { playerId, index } = msg.payload as { playerId: string; index: number };
          liveEngine.claimTile(playerId, index);
          return;
        }
        case ROOM_EVENTS.ability: {
          const { playerId, targets } = msg.payload as { playerId: string; targets: number[] };
          liveEngine.useAbility(playerId, targets);
          return;
        }
        case ROOM_EVENTS.endTurn: {
          const { playerId } = msg.payload as { playerId: string };
          liveEngine.endTurn(playerId);
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
            state: ColorThiefGameState;
            seats: ColorThiefSeat[];
          };
          latest.current.onSeats(incoming);
          liveEngine.loadState(snapshot);
          return;
        }
        default:
          return;
      }
    },
    [send],
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
    if (!enabled || !isHost) return;

    const seat = seats.find((s) => s.seatIndex === state.currentTurnSeatIndex);
    if (!seat || seat.type === 'bot' || !disconnectedIds.includes(seat.id)) return;
    if (!engine.isSeatOnTurn(seat.seatIndex)) return;

    const timer = setTimeout(() => {
      send(ROOM_EVENTS.endTurn, { playerId: seat.id });
      engine.endTurn(seat.id);
    }, ABSENT_PLAYER_GRACE_MS);
    return () => clearTimeout(timer);
  }, [enabled, isHost, seats, state.currentTurnSeatIndex, disconnectedIds, engine, send]);

  const broadcastClaim = useCallback(
    (playerId: string, index: number) => send(ROOM_EVENTS.claim, { playerId, index }),
    [send],
  );

  const broadcastAbility = useCallback(
    (playerId: string, targets: number[]) => send(ROOM_EVENTS.ability, { playerId, targets }),
    [send],
  );

  const broadcastEndTurn = useCallback(
    (playerId: string) => send(ROOM_EVENTS.endTurn, { playerId }),
    [send],
  );

  const broadcastStart = useCallback(
    (nextSeats: ColorThiefSeat[]) => send(ROOM_EVENTS.start, { seats: nextSeats }),
    [send],
  );

  const broadcastRestart = useCallback(
    (nextSeats: ColorThiefSeat[]) => send(ROOM_EVENTS.restart, { seats: nextSeats }),
    [send],
  );

  // A stable object, so callers can depend on it without re-memoising every render.
  return useMemo(
    () => ({
      broadcastClaim,
      broadcastAbility,
      broadcastEndTurn,
      broadcastStart,
      broadcastRestart,
    }),
    [broadcastClaim, broadcastAbility, broadcastEndTurn, broadcastStart, broadcastRestart],
  );
}
