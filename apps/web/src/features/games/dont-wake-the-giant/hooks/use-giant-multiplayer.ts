'use client';

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useGiantMultiplayerStore } from '@/stores/giant-multiplayer.store';
import type { GiantEngine } from '../engine/giant-engine';
import type { TakeEvent } from '../engine/heist-step';
import {
  encodePose,
  GN_MSG,
  isPose,
  isRoundStart,
  isSnapshot,
  isTake,
  POSE_INTERVAL_MS,
  PoseTrack,
  SNAPSHOT_INTERVAL_MS,
  type RoundStartPayload,
} from '../multiplayer/giant-protocol';
import { applySnapshot, buildSnapshot } from '../multiplayer/giant-sync';
import type { Gait, GiantSeat } from '../types/giant.types';

export interface UseGiantMultiplayerOptions {
  enabled: boolean;
  engineRef: RefObject<GiantEngine | null>;
  roundIdRef: RefObject<string>;
  localPlayerId: string | null;
  isHost: boolean;
  onRoundStart: (payload: RoundStartPayload) => void;
  onSeats: (seats: GiantSeat[]) => void;
  onRemoteTake: (event: TakeEvent) => void;
}

export interface GiantNetwork {
  /** Called every frame: pushes this client's pose and, for the host, the snapshot. */
  publish: (nowMs: number) => void;
  /** Called every frame: moves remote bodies to their interpolated pose. */
  applyRemotePoses: (nowMs: number) => void;
  broadcastStart: (payload: RoundStartPayload) => void;
  broadcastTake: (event: TakeEvent) => void;
}

const NOOP_NETWORK: GiantNetwork = {
  publish: () => {},
  applyRemotePoses: () => {},
  broadcastStart: () => {},
  broadcastTake: () => {},
};

/**
 * Room protocol. Every client owns its own body and claims its own pickups
 * optimistically, so reaching for a goblet feels instant; the host's slower
 * snapshot is what everybody's shared meter and loot table actually settle on.
 */
export function useGiantMultiplayer(options: UseGiantMultiplayerOptions): GiantNetwork {
  const { enabled, engineRef, roundIdRef, localPlayerId, isHost } = options;
  const transport = useGiantMultiplayerStore((state) => state.transport);

  const latest = useRef(options);
  latest.current = options;

  const tracks = useRef(new Map<string, { track: PoseTrack; gait: Gait }>());
  const lastPoseAt = useRef(0);
  const lastSnapshotAt = useRef(0);
  const askedForSync = useRef(false);

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const trackFor = useCallback((playerId: string) => {
    let entry = tracks.current.get(playerId);
    if (!entry) {
      entry = { track: new PoseTrack(), gait: 'walk' };
      tracks.current.set(playerId, entry);
    }
    return entry;
  }, []);

  const handleMessage = useCallback(
    (message: TransportMessage) => {
      const { engineRef: engines, roundIdRef: rounds, isHost: host } = latest.current;
      if (message.senderId === latest.current.localPlayerId) return;
      const engine = engines.current;

      switch (message.type) {
        case GN_MSG.SEATS: {
          const payload = message.payload as { seats?: GiantSeat[] };
          if (Array.isArray(payload?.seats)) latest.current.onSeats(payload.seats);
          return;
        }
        case GN_MSG.START:
        case GN_MSG.REMATCH: {
          if (!isRoundStart(message.payload)) return;
          tracks.current.clear();
          latest.current.onRoundStart(message.payload);
          return;
        }
        case GN_MSG.POSE: {
          if (!isPose(message.payload) || message.payload.roundId !== rounds.current) return;
          const entry = trackFor(message.senderId);
          entry.track.push(message.payload.pose, message.timestamp);
          entry.gait = message.payload.gait;
          return;
        }
        case GN_MSG.TAKE: {
          if (!engine || !isTake(message.payload)) return;
          if (message.payload.roundId !== rounds.current) return;
          const take: TakeEvent = {
            thiefId: message.payload.thiefId,
            kind: message.payload.kind,
            id: message.payload.id,
          };
          engine.applyRemoteTake(take);
          latest.current.onRemoteTake(take);
          return;
        }
        case GN_MSG.SNAPSHOT: {
          if (host || !engine || !isSnapshot(message.payload)) return;
          if (message.payload.roundId !== rounds.current) return;
          applySnapshot(engine, message.payload);
          return;
        }
        case GN_MSG.SYNC_REQUEST: {
          if (!host || !engine) return;
          send(GN_MSG.SNAPSHOT, buildSnapshot(engine, rounds.current));
          return;
        }
        default:
          return;
      }
    },
    [send, trackFor],
  );

  useEffect(() => {
    if (!enabled || !transport) return;
    return transport.onAction(handleMessage);
  }, [enabled, transport, handleMessage]);

  // A guest joining or returning mid-heist asks the host for the shared slice.
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSync.current) return;
    askedForSync.current = true;
    send(GN_MSG.SYNC_REQUEST, {});
  }, [enabled, transport, isHost, send]);

  const publish = useCallback(
    (nowMs: number) => {
      const engine = engineRef.current;
      if (!engine || !localPlayerId) return;

      if (nowMs - lastPoseAt.current >= POSE_INTERVAL_MS) {
        lastPoseAt.current = nowMs;
        const me = engine.thief(localPlayerId);
        if (me) {
          send(
            GN_MSG.POSE,
            encodePose(roundIdRef.current, me.pos, me.facing, me.gait, me.carriedCount),
          );
        }
      }

      if (isHost && nowMs - lastSnapshotAt.current >= SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAt.current = nowMs;
        send(GN_MSG.SNAPSHOT, buildSnapshot(engine, roundIdRef.current));
      }
    },
    [engineRef, isHost, localPlayerId, roundIdRef, send],
  );

  const applyRemotePoses = useCallback(
    (nowMs: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      for (const [playerId, entry] of tracks.current) {
        if (playerId === localPlayerId) continue;
        const pose = entry.track.sample(nowMs);
        if (pose) engine.placeThief(playerId, pose, pose.facing, entry.gait);
      }
    },
    [engineRef, localPlayerId],
  );

  const broadcastStart = useCallback(
    (payload: RoundStartPayload) => {
      tracks.current.clear();
      lastSnapshotAt.current = 0;
      send(GN_MSG.START, payload);
    },
    [send],
  );

  const broadcastTake = useCallback(
    (event: TakeEvent) => send(GN_MSG.TAKE, { roundId: roundIdRef.current, ...event }),
    [roundIdRef, send],
  );

  return useMemo(
    () => (enabled ? { publish, applyRemotePoses, broadcastStart, broadcastTake } : NOOP_NETWORK),
    [enabled, publish, applyRemotePoses, broadcastStart, broadcastTake],
  );
}
