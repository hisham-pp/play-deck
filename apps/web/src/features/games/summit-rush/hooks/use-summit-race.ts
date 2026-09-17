'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { World } from '../engine/summit-types';
import {
  createRaceId,
  createRaceSeed,
  encodeSnapshot,
  GhostTrack,
  isGhostSnapshot,
  isRaceFinish,
  isRaceStart,
  RACE_MSG,
  SNAPSHOT_INTERVAL_MS,
  type GhostStatus,
  type RaceFinishPayload,
} from '../multiplayer/race-protocol';
import type { GhostView } from '../render/ghost-layer';
import { SUMMIT_GAME_ID } from '../services/summit-progress-repository';

export interface RivalState {
  distance: number;
  score: number;
  status: GhostStatus;
  finish: RaceFinishPayload | null;
  ready: boolean;
}

const freshRival = (): RivalState => ({
  distance: 0,
  score: 0,
  status: 'running',
  finish: null,
  ready: false,
});

interface RaceMessageContext {
  raceId: string | null;
  rival: RivalState;
  track: GhostTrack;
  beginRace: (id: string, seed: number) => void;
  publishRival: () => void;
}

/** Applies one message from the rival's device. Stale-race traffic is ignored. */
function applyRaceMessage({ type, payload }: TransportMessage, ctx: RaceMessageContext): void {
  if (type === RACE_MSG.START && isRaceStart(payload)) {
    ctx.beginRace(payload.raceId, payload.seed);
    return;
  }
  if (type === RACE_MSG.READY) {
    ctx.rival.ready = true;
    ctx.publishRival();
    return;
  }
  if (type === RACE_MSG.STATE && isGhostSnapshot(payload) && payload.raceId === ctx.raceId) {
    ctx.track.push(payload.pose, performance.now());
    const statusChanged = ctx.rival.status !== payload.status;
    Object.assign(ctx.rival, {
      distance: payload.distance,
      score: payload.score,
      status: payload.status,
    });
    if (statusChanged) ctx.publishRival();
    return;
  }
  if (type === RACE_MSG.FINISH && isRaceFinish(payload) && payload.raceId === ctx.raceId) {
    Object.assign(ctx.rival, { finish: payload, status: 'ended', distance: payload.distance });
    ctx.publishRival();
  }
}

interface RaceHookOptions {
  enabled: boolean;
  /** Both devices call this with the same seed when a race begins. */
  onRaceStart: (seed: number) => void;
}

/**
 * Head-to-head "ghost" racing: both players drive the same seeded course on
 * their own device and stream compact snapshots to each other.
 */
export function useSummitRace({ enabled, onRaceStart }: RaceHookOptions) {
  const player = usePlayerStore((s) => s.player);
  const mp = useMultiplayerStore();
  const { roomCode, role, opponent, sendGameAction, onActionReceived } = mp;

  const raceIdRef = useRef<string | null>(null);
  const trackRef = useRef(new GhostTrack());
  const rivalRef = useRef<RivalState>(freshRival());
  const lastSentRef = useRef(0);
  const [raceId, setRaceId] = useState<string | null>(null);
  const [rival, setRival] = useState<RivalState>(freshRival());
  const onStartRef = useRef(onRaceStart);
  onStartRef.current = onRaceStart;

  const publishRival = useCallback(() => setRival({ ...rivalRef.current }), []);

  const beginRace = useCallback((id: string, seed: number) => {
    raceIdRef.current = id;
    trackRef.current.clear();
    rivalRef.current = freshRival();
    lastSentRef.current = 0;
    setRaceId(id);
    setRival(freshRival());
    onStartRef.current(seed);
  }, []);

  const emit = useCallback(
    (type: string, payload: unknown) => {
      if (player && roomCode) sendGameAction(type, payload, player.id);
    },
    [player, roomCode, sendGameAction],
  );

  useEffect(() => {
    if (!enabled || !roomCode) return;
    return onActionReceived((msg: TransportMessage) => {
      if (msg.senderId === player?.id) return;
      applyRaceMessage(msg, {
        raceId: raceIdRef.current,
        rival: rivalRef.current,
        track: trackRef.current,
        beginRace,
        publishRival,
      });
    });
  }, [enabled, roomCode, player?.id, onActionReceived, beginRace, publishRival]);

  /** Host only: pick a course and start both devices. */
  const startRace = useCallback(() => {
    const id = createRaceId();
    const seed = createRaceSeed();
    emit(RACE_MSG.START, { raceId: id, seed });
    beginRace(id, seed);
  }, [beginRace, emit]);

  const sendReady = useCallback(() => emit(RACE_MSG.READY, { at: Date.now() }), [emit]);

  /** Throttled snapshot of the local buggy; call every frame while racing. */
  const publishFrame = useCallback(
    (world: World, score: number, now: number) => {
      const id = raceIdRef.current;
      if (!id || now - lastSentRef.current < SNAPSHOT_INTERVAL_MS) return;
      lastSentRef.current = now;
      emit(RACE_MSG.STATE, encodeSnapshot(world, id, score));
    },
    [emit],
  );

  const publishFinish = useCallback(
    (result: Omit<RaceFinishPayload, 'raceId'>) => {
      const id = raceIdRef.current;
      if (id) emit(RACE_MSG.FINISH, { ...result, raceId: id });
    },
    [emit],
  );

  const getGhosts = useCallback(
    (now: number): GhostView[] => {
      if (!enabled || !raceIdRef.current) return [];
      const pose = trackRef.current.sample(now);
      if (!pose) return [];
      const r = rivalRef.current;
      return [
        {
          id: 'rival',
          name: opponent?.displayName ?? 'Rival',
          pose,
          distance: r.distance,
          status: r.status,
        },
      ];
    },
    [enabled, opponent?.displayName],
  );

  const createRoom = useCallback(async () => {
    if (player) await mp.createRoom(SUMMIT_GAME_ID, player);
  }, [mp, player]);

  const joinRoom = useCallback(
    async (code: string) => {
      if (player) await mp.joinRoomByCode(code, player, SUMMIT_GAME_ID);
    },
    [mp, player],
  );

  return {
    roomCode,
    role,
    isHost: role === 'host',
    opponent,
    connectionStatus: mp.connectionStatus,
    errorMessage: mp.errorMessage,
    raceId,
    rival,
    rivalRef,
    createRoom,
    joinRoom,
    leaveRoom: mp.leaveRoom,
    startRace,
    sendReady,
    publishFrame,
    publishFinish,
    getGhosts,
  };
}

export type SummitRace = ReturnType<typeof useSummitRace>;
