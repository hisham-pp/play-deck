'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import {
  useMiniGolfMultiplayerStore,
  type GolfPlayerSeat,
} from '@/stores/mini-golf-multiplayer.store';
import type { CoursePreset, MiniGolfState } from '../engine/mini-golf-types';

export const GOLF_ROOM_EVENTS = {
  seats: 'GOLF_SEATS',
  preset: 'GOLF_SET_PRESET',
  start: 'GOLF_START',
  shot: 'GOLF_SHOT',
  ballRest: 'GOLF_BALL_REST',
  nextHole: 'GOLF_NEXT_HOLE',
  restart: 'GOLF_RESTART',
} as const;

interface UseMiniGolfMultiplayerOptions {
  enabled: boolean;
  state: MiniGolfState;
  localPlayerId: string | null;
  onRemoteShot: (playerId: string, angle: number, power: number) => void;
  onRemoteBallRest?: (playerId: string, x: number, y: number, inHole: boolean) => void;
  onRemoteNextHole: () => void;
  onRemoteRestart: () => void;
  onStartMatch: (seats: GolfPlayerSeat[], preset: CoursePreset) => void;
  onSeatsUpdate: (seats: GolfPlayerSeat[]) => void;
  onPresetUpdate: (preset: CoursePreset) => void;
}

export function useMiniGolfMultiplayer({
  enabled,
  state,
  localPlayerId,
  onRemoteShot,
  onRemoteBallRest,
  onRemoteNextHole,
  onRemoteRestart,
  onStartMatch,
  onSeatsUpdate,
  onPresetUpdate,
}: UseMiniGolfMultiplayerOptions) {
  const transport = useMiniGolfMultiplayerStore((s) => s.transport);
  const hostId = useMiniGolfMultiplayerStore((s) => s.hostId);
  const isHost = Boolean(hostId && localPlayerId && hostId === localPlayerId);

  const latest = useRef({
    state,
    localPlayerId,
    isHost,
    onRemoteShot,
    onRemoteBallRest,
    onRemoteNextHole,
    onRemoteRestart,
    onStartMatch,
    onSeatsUpdate,
    onPresetUpdate,
  });

  latest.current = {
    state,
    localPlayerId,
    isHost,
    onRemoteShot,
    onRemoteBallRest,
    onRemoteNextHole,
    onRemoteRestart,
    onStartMatch,
    onSeatsUpdate,
    onPresetUpdate,
  };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const broadcastShot = useCallback(
    (angle: number, power: number) => {
      if (!enabled || !localPlayerId) return;
      send(GOLF_ROOM_EVENTS.shot, { playerId: localPlayerId, angle, power });
    },
    [enabled, localPlayerId, send],
  );

  const broadcastBallRest = useCallback(
    (playerId: string, x: number, y: number, inHole: boolean) => {
      if (!enabled || !latest.current.isHost) return;
      send(GOLF_ROOM_EVENTS.ballRest, { playerId, x, y, inHole });
    },
    [enabled, send],
  );

  const broadcastNextHole = useCallback(() => {
    if (!enabled || !latest.current.isHost) return;
    send(GOLF_ROOM_EVENTS.nextHole, {});
  }, [enabled, send]);

  const broadcastRestart = useCallback(() => {
    if (!enabled || !latest.current.isHost) return;
    send(GOLF_ROOM_EVENTS.restart, {});
  }, [enabled, send]);

  const broadcastStart = useCallback(
    (seats: GolfPlayerSeat[], preset: CoursePreset) => {
      if (!enabled || !latest.current.isHost) return;
      send(GOLF_ROOM_EVENTS.start, { seats, preset });
    },
    [enabled, send],
  );

  const handleMessage = useCallback((msg: TransportMessage) => {
    if (msg.senderId === latest.current.localPlayerId) return;

    switch (msg.type) {
      case GOLF_ROOM_EVENTS.seats: {
        if (latest.current.isHost) return;
        const { seats } = msg.payload as { seats: GolfPlayerSeat[] };
        latest.current.onSeatsUpdate(seats);
        return;
      }
      case GOLF_ROOM_EVENTS.preset: {
        if (latest.current.isHost) return;
        const { coursePreset } = msg.payload as { coursePreset: CoursePreset };
        latest.current.onPresetUpdate(coursePreset);
        return;
      }
      case GOLF_ROOM_EVENTS.start: {
        const { seats, preset } = msg.payload as { seats: GolfPlayerSeat[]; preset: CoursePreset };
        latest.current.onStartMatch(seats, preset);
        return;
      }
      case GOLF_ROOM_EVENTS.shot: {
        const { playerId, angle, power } = msg.payload as {
          playerId: string;
          angle: number;
          power: number;
        };
        latest.current.onRemoteShot(playerId, angle, power);
        return;
      }
      case GOLF_ROOM_EVENTS.ballRest: {
        if (latest.current.isHost) return;
        const { playerId, x, y, inHole } = msg.payload as {
          playerId: string;
          x: number;
          y: number;
          inHole: boolean;
        };
        latest.current.onRemoteBallRest?.(playerId, x, y, inHole);
        return;
      }
      case GOLF_ROOM_EVENTS.nextHole: {
        latest.current.onRemoteNextHole();
        return;
      }
      case GOLF_ROOM_EVENTS.restart: {
        latest.current.onRemoteRestart();
        return;
      }
      default:
        return;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !transport) return;
    return transport.onAction(handleMessage);
  }, [enabled, transport, handleMessage]);

  return {
    broadcastShot,
    broadcastBallRest,
    broadcastNextHole,
    broadcastRestart,
    broadcastStart,
  };
}
