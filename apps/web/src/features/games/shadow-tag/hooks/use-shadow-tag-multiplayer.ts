'use client';

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useShadowTagMultiplayerStore } from '@/stores/shadow-tag-multiplayer.store';
import type { ShadowTagEngine } from '../engine/shadow-tag-engine';
import {
  encodePose,
  isPose,
  isRoundStart,
  isSnapshot,
  isTagEvent,
  POSE_INTERVAL_MS,
  PoseTrack,
  SNAPSHOT_INTERVAL_MS,
  ST_MSG,
  type RoundStartPayload,
} from '../multiplayer/shadow-tag-protocol';
import { applySnapshot, buildSnapshot } from '../multiplayer/shadow-tag-sync';
import type { ShadowTagSeat, TagEvent } from '../types/shadow-tag.types';

export interface UseShadowTagMultiplayerOptions {
  enabled: boolean;
  engineRef: RefObject<ShadowTagEngine | null>;
  roundIdRef: RefObject<string>;
  localPlayerId: string | null;
  isHost: boolean;
  onRoundStart: (payload: RoundStartPayload) => void;
  onSeats: (seats: ShadowTagSeat[]) => void;
  onRemoteTag: (event: TagEvent) => void;
}

export interface ShadowTagNetwork {
  /** Called every frame: pushes this client's pose and, for the host, the snapshot. */
  publish: (nowMs: number) => void;
  /** Called every frame: moves remote bodies to their interpolated pose. */
  applyRemotePoses: (nowMs: number) => void;
  broadcastStart: (payload: RoundStartPayload) => void;
  broadcastTag: (event: TagEvent) => void;
}

const NOOP_NETWORK: ShadowTagNetwork = {
  publish: () => {},
  applyRemotePoses: () => {},
  broadcastStart: () => {},
  broadcastTag: () => {},
};

/**
 * Room protocol. Every client owns its own body and broadcasts where it is; the
 * host alone settles tags, the clock and the lamps, and pushes them out as a
 * slower snapshot. That split keeps steering instant without letting two
 * clients disagree about who is "it".
 */
export function useShadowTagMultiplayer(options: UseShadowTagMultiplayerOptions): ShadowTagNetwork {
  const { enabled, engineRef, roundIdRef, localPlayerId, isHost } = options;
  const transport = useShadowTagMultiplayerStore((state) => state.transport);

  const latest = useRef(options);
  latest.current = options;

  const tracks = useRef(new Map<string, PoseTrack>());
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
    let track = tracks.current.get(playerId);
    if (!track) {
      track = new PoseTrack();
      tracks.current.set(playerId, track);
    }
    return track;
  }, []);

  const handleMessage = useCallback(
    (message: TransportMessage) => {
      const { engineRef: engines, roundIdRef: rounds, isHost: host } = latest.current;
      if (message.senderId === latest.current.localPlayerId) return;
      const engine = engines.current;

      switch (message.type) {
        case ST_MSG.SEATS: {
          const payload = message.payload as { seats?: ShadowTagSeat[] };
          if (Array.isArray(payload?.seats)) latest.current.onSeats(payload.seats);
          return;
        }
        case ST_MSG.START:
        case ST_MSG.REMATCH: {
          if (!isRoundStart(message.payload)) return;
          tracks.current.clear();
          latest.current.onRoundStart(message.payload);
          return;
        }
        case ST_MSG.POSE: {
          if (!isPose(message.payload) || message.payload.roundId !== rounds.current) return;
          trackFor(message.senderId).push(message.payload.pose, message.timestamp);
          return;
        }
        case ST_MSG.TAG: {
          if (!engine || !isTagEvent(message.payload)) return;
          engine.applyRemoteTag(message.payload);
          latest.current.onRemoteTag(message.payload);
          return;
        }
        case ST_MSG.SNAPSHOT: {
          if (host || !engine || !isSnapshot(message.payload)) return;
          if (message.payload.roundId !== rounds.current) return;
          applySnapshot(engine, message.payload);
          return;
        }
        case ST_MSG.SYNC_REQUEST: {
          if (!host || !engine) return;
          send(ST_MSG.SNAPSHOT, buildSnapshot(engine, rounds.current));
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

  // A guest joining or returning mid-round asks the host for the authoritative slice.
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSync.current) return;
    askedForSync.current = true;
    send(ST_MSG.SYNC_REQUEST, {});
  }, [enabled, transport, isHost, send]);

  const publish = useCallback(
    (nowMs: number) => {
      const engine = engineRef.current;
      if (!engine || !localPlayerId) return;

      if (nowMs - lastPoseAt.current >= POSE_INTERVAL_MS) {
        lastPoseAt.current = nowMs;
        const me = engine.localRunner(localPlayerId);
        if (me) {
          send(ST_MSG.POSE, encodePose(roundIdRef.current, me.pos, me.facing, me.sneaking));
        }
      }

      if (isHost && nowMs - lastSnapshotAt.current >= SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAt.current = nowMs;
        send(ST_MSG.SNAPSHOT, buildSnapshot(engine, roundIdRef.current));
      }
    },
    [engineRef, isHost, localPlayerId, roundIdRef, send],
  );

  const applyRemotePoses = useCallback(
    (nowMs: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      for (const [playerId, track] of tracks.current) {
        if (playerId === localPlayerId) continue;
        const pose = track.sample(nowMs);
        if (pose) engine.placeRunner(playerId, pose, pose.facing);
      }
    },
    [engineRef, localPlayerId],
  );

  const broadcastStart = useCallback(
    (payload: RoundStartPayload) => {
      tracks.current.clear();
      lastSnapshotAt.current = 0;
      send(ST_MSG.START, payload);
    },
    [send],
  );

  const broadcastTag = useCallback((event: TagEvent) => send(ST_MSG.TAG, event), [send]);

  return useMemo(
    () => (enabled ? { publish, applyRemotePoses, broadcastStart, broadcastTag } : NOOP_NETWORK),
    [enabled, publish, applyRemotePoses, broadcastStart, broadcastTag],
  );
}
