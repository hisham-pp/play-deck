'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useAnagramMultiplayerStore } from '@/stores/anagram-multiplayer.store';
import { STATUS_FINISHED, STATUS_PLAYING, STATUS_ROUND_SUMMARY } from '../engine/anagram-constants';
import type { AnagramState } from '../types/anagram-sprint.types';
import { ROOM_EVENTS, routeRoomMessage, type AnagramStartPayload } from './anagram-room-messages';

export { ROOM_EVENTS } from './anagram-room-messages';
export type { AnagramStartPayload } from './anagram-room-messages';

interface UseAnagramMultiplayerOptions {
  enabled: boolean;
  state: AnagramState;
  localPlayerId: string | null;
  onRemoteStart: (payload: AnagramStartPayload) => void;
  onRemoteAnswer: (playerId: string, word: string, elapsedMs: number) => void;
  onRemoteRoundEnd: (snapshot: AnagramState) => void;
  onRemoteRoundStart: () => void;
}

export interface UseAnagramMultiplayerReturn {
  broadcastStart: (payload: AnagramStartPayload) => void;
  broadcastAnswer: (playerId: string, word: string, elapsedMs: number) => void;
}

/** The boundary this device has already told the room about. */
function boundaryOf(state: AnagramState): string {
  return `${state.status}:${state.roundIndex}`;
}

/** What the host owes the room at this boundary, if anything. */
function boundaryEvent(state: AnagramState): string | null {
  if (state.status === STATUS_ROUND_SUMMARY) return ROOM_EVENTS.roundEnd;
  if (state.status === STATUS_FINISHED) return ROOM_EVENTS.roundEnd;
  if (state.status === STATUS_PLAYING && state.roundIndex > 0) return ROOM_EVENTS.roundStart;
  return null;
}

export function useAnagramMultiplayer(
  options: UseAnagramMultiplayerOptions,
): UseAnagramMultiplayerReturn {
  const { enabled, state, localPlayerId } = options;
  const transport = useAnagramMultiplayerStore((store) => store.transport);
  const isHost = useAnagramMultiplayerStore((store) => store.isHost());

  // Handlers read fresh values without re-subscribing the channel every render.
  const latest = useRef({ options, isHost });
  latest.current = { options, isHost };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localPlayerId) return;
      transport.send(type, payload, localPlayerId);
    },
    [transport, localPlayerId],
  );

  const handleMessage = useCallback(
    (msg: TransportMessage) => {
      const { options: live, isHost: hosting } = latest.current;
      if (msg.senderId === live.localPlayerId) return;

      routeRoomMessage(msg, {
        isHost: hosting,
        onStart: live.onRemoteStart,
        onAnswer: live.onRemoteAnswer,
        onSnapshot: live.onRemoteRoundEnd,
        onRoundStart: live.onRemoteRoundStart,
        onSyncRequest: () => send(ROOM_EVENTS.stateSync, { state: live.state }),
      });
    },
    [send],
  );

  useEffect(() => {
    if (!enabled || !transport) return;
    return transport.onAction(handleMessage);
  }, [enabled, transport, handleMessage]);

  // A seat arriving or returning mid-match asks the host for the scoreboard.
  const askedForSync = useRef(false);
  useEffect(() => {
    if (!enabled || !transport || isHost || askedForSync.current) return;
    askedForSync.current = true;
    send(ROOM_EVENTS.syncRequest, {});
  }, [enabled, transport, isHost, send]);

  // The host publishes every boundary it crosses: the settled word, then the
  // go signal for the next one.
  const lastBoundary = useRef('');
  useEffect(() => {
    if (!enabled || !isHost) return;

    const boundary = boundaryOf(state);
    if (boundary === lastBoundary.current) return;
    lastBoundary.current = boundary;

    const event = boundaryEvent(state);
    if (event) send(event, { state, roundIndex: state.roundIndex });
  }, [enabled, isHost, state, send]);

  const broadcastStart = useCallback(
    (payload: AnagramStartPayload) => {
      lastBoundary.current = '';
      send(ROOM_EVENTS.start, payload);
    },
    [send],
  );

  const broadcastAnswer = useCallback(
    (playerId: string, word: string, elapsedMs: number) =>
      send(ROOM_EVENTS.answer, { playerId, word, elapsedMs }),
    [send],
  );

  return useMemo(() => ({ broadcastStart, broadcastAnswer }), [broadcastStart, broadcastAnswer]);
}
