'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useElevatorMultiplayerStore } from '@/stores/elevator-multiplayer.store';
import type { ElevatorEngine } from '../engine/elevator-engine';
import type { ElevatorSnapshot } from '../engine/elevator-snapshot';
import {
  AIM_INTERVAL_MS,
  ROOM_EVENTS,
  SNAPSHOT_INTERVAL_MS,
  shouldSend,
  type AimPayload,
  type DropRequestPayload,
  type SnapshotPayload,
  type StartPayload,
} from '../multiplayer/elevator-protocol';
import type { ElevatorSeat } from '../types/unstable-elevator.types';

export interface UseElevatorMultiplayerOptions {
  enabled: boolean;
  engine: ElevatorEngine;
  localPlayerId: string | null;
  /** True when the local player currently holds the claw. */
  holdsClaw: boolean;
  onSeats: (seats: ElevatorSeat[]) => void;
  onStart: (payload: StartPayload) => void;
}

export interface UseElevatorMultiplayerReturn {
  /** Moves the claw: straight into the engine on the host, over the wire otherwise. */
  aim: (x: number, angle: number) => void;
  /** Releases the object, or asks the host to. */
  requestDrop: () => void;
  broadcastStart: (payload: StartPayload) => void;
  broadcastRestart: (payload: StartPayload) => void;
  /** Called every frame by the host; throttles itself to the snapshot rate. */
  publishSnapshot: () => void;
}

export function useElevatorMultiplayer({
  enabled,
  engine,
  localPlayerId,
  holdsClaw,
  onSeats,
  onStart,
}: UseElevatorMultiplayerOptions): UseElevatorMultiplayerReturn {
  const transport = useElevatorMultiplayerStore((state) => state.transport);
  const hostId = useElevatorMultiplayerStore((state) => state.hostId);
  const isHost = Boolean(hostId && localPlayerId && hostId === localPlayerId);

  const latest = useRef({ engine, isHost, localPlayerId, holdsClaw, onSeats, onStart });
  latest.current = { engine, isHost, localPlayerId, holdsClaw, onSeats, onStart };

  const lastSnapshotAt = useRef(0);
  const lastAimAt = useRef(0);

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const handleMessage = useCallback(
    (message: TransportMessage) => {
      const { engine: live, isHost: host, localPlayerId: me } = latest.current;
      if (message.senderId === me) return;

      switch (message.type) {
        case ROOM_EVENTS.seats: {
          if (host) return;
          latest.current.onSeats((message.payload as { seats: ElevatorSeat[] }).seats);
          return;
        }
        case ROOM_EVENTS.start:
        case ROOM_EVENTS.restart: {
          const payload = message.payload as StartPayload;
          latest.current.onSeats(payload.seats);
          latest.current.onStart(payload);
          return;
        }
        case ROOM_EVENTS.aim: {
          if (!host) return;
          const { seatId, x, angle } = message.payload as AimPayload;
          // Only the seat actually holding the claw may move it.
          if (live.getState().activeSeatId !== seatId) return;
          live.setClaw(x, angle);
          return;
        }
        case ROOM_EVENTS.dropRequest: {
          if (!host) return;
          live.drop((message.payload as DropRequestPayload).seatId);
          return;
        }
        case ROOM_EVENTS.syncRequest: {
          if (!host) return;
          send(ROOM_EVENTS.snapshot, { snapshot: live.getSnapshot() });
          return;
        }
        case ROOM_EVENTS.snapshot: {
          if (host) return;
          const { snapshot } = message.payload as SnapshotPayload;
          applyGuestSnapshot(live, snapshot, latest.current.holdsClaw);
          return;
        }
        default:
      }
    },
    [send],
  );

  useEffect(() => {
    if (!enabled || !transport) return;
    return transport.onAction(handleMessage);
  }, [enabled, transport, handleMessage]);

  // A guest arriving or returning mid-run asks the host for the whole world.
  const askedForSync = useRef(false);
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSync.current) return;
    askedForSync.current = true;
    send(ROOM_EVENTS.syncRequest, {});
  }, [enabled, transport, isHost, send]);

  const aim = useCallback(
    (x: number, angle: number) => {
      const { engine: live, isHost: host, localPlayerId: me } = latest.current;
      live.setClaw(x, angle);
      if (host || !enabled || !me) return;

      const now = Date.now();
      if (!shouldSend(lastAimAt.current, now, AIM_INTERVAL_MS)) return;
      lastAimAt.current = now;
      send(ROOM_EVENTS.aim, { seatId: me, x, angle } satisfies AimPayload);
    },
    [enabled, send],
  );

  const requestDrop = useCallback(() => {
    const { engine: live, isHost: host, localPlayerId: me } = latest.current;
    if (!me) return;
    if (host || !enabled) {
      live.drop(me);
      return;
    }
    // Send the final claw position with the request, so a throttled aim update
    // can never arrive after the drop the player actually saw.
    const state = live.getState();
    send(ROOM_EVENTS.aim, { seatId: me, x: state.clawX, angle: state.clawAngle });
    send(ROOM_EVENTS.dropRequest, { seatId: me } satisfies DropRequestPayload);
  }, [enabled, send]);

  const broadcastStart = useCallback(
    (payload: StartPayload) => send(ROOM_EVENTS.start, payload),
    [send],
  );

  const broadcastRestart = useCallback(
    (payload: StartPayload) => send(ROOM_EVENTS.restart, payload),
    [send],
  );

  const publishSnapshot = useCallback(() => {
    if (!enabled || !latest.current.isHost) return;
    const now = Date.now();
    if (!shouldSend(lastSnapshotAt.current, now, SNAPSHOT_INTERVAL_MS)) return;
    lastSnapshotAt.current = now;
    send(ROOM_EVENTS.snapshot, { snapshot: latest.current.engine.getSnapshot() });
  }, [enabled, send]);

  return { aim, requestDrop, broadcastStart, broadcastRestart, publishSnapshot };
}

/**
 * Applies a host snapshot to a guest. The guest's own claw is left alone while
 * it is their turn, so dragging stays responsive instead of fighting the echo
 * coming back over the wire.
 */
function applyGuestSnapshot(
  engine: ElevatorEngine,
  snapshot: ElevatorSnapshot,
  holdsClaw: boolean,
): void {
  const local = engine.getState();
  engine.applySnapshot(
    holdsClaw ? { ...snapshot, clawX: local.clawX, clawAngle: local.clawAngle } : snapshot,
  );
}
