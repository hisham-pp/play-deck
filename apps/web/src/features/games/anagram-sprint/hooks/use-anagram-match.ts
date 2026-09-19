'use client';

import { useCallback, useRef, useState } from 'react';
import type { Player } from '@playdeck/game-types';
import { useAnagramMultiplayerStore } from '@/stores/anagram-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { DEFAULT_AVATAR, TEAM_A } from '../engine/anagram-constants';
import { createSeed } from '../engine/anagram-scramble';
import type { AnagramRules, AnagramSeat, AnagramState } from '../types/anagram-sprint.types';
import { useAnagramEngine } from './use-anagram-engine';
import { useAnagramMultiplayer, type AnagramStartPayload } from './use-anagram-multiplayer';
import { useAnagramSession } from './use-anagram-session';

export type AnagramScreen = 'lobby' | 'online-room' | 'playing';

/** The room store tracks its own lifecycle, which is not the screen stack. */
const ROOM_PLAYING = 'playing';
const ROOM_LOBBY = 'lobby';

export const SCREEN_LOBBY: AnagramScreen = 'lobby';
export const SCREEN_ROOM: AnagramScreen = 'online-room';
export const SCREEN_PLAYING: AnagramScreen = 'playing';

function roomIdentity(player: Player) {
  return {
    id: player.id,
    displayName: player.displayName,
    avatar: player.avatar || DEFAULT_AVATAR,
  };
}

function soloSeat(player: Player | null, fallbackId: string | null): AnagramSeat {
  return {
    id: fallbackId ?? 'solo',
    name: player?.displayName ?? 'You',
    avatar: player?.avatar || DEFAULT_AVATAR,
    team: TEAM_A,
  };
}

/**
 * Everything the page needs to run a match, offline or in a room: the engine,
 * the room wiring, and the handful of handlers that connect the two. The
 * component above it only has to decide which screen to draw.
 */
export function useAnagramMatch() {
  // Arriving through an invite or join link drops the player straight in the room.
  const [screen, setScreen] = useState<AnagramScreen>(() =>
    useAnagramMultiplayerStore.getState().roomCode ? SCREEN_ROOM : SCREEN_LOBBY,
  );
  const [isOnline, setIsOnline] = useState(false);

  const player = usePlayerStore((store) => store.player);
  const localPlayerId = player?.id ?? null;

  const roomCode = useAnagramMultiplayerStore((store) => store.roomCode);
  const createRoom = useAnagramMultiplayerStore((store) => store.createRoom);
  const leaveRoom = useAnagramMultiplayerStore((store) => store.leaveRoom);
  const setRoomStatus = useAnagramMultiplayerStore((store) => store.setStatus);
  const disconnectedIds = useAnagramMultiplayerStore((store) => store.disconnectedIds);
  const isHost = useAnagramMultiplayerStore((store) => store.isHost());

  const reportFinished = useAnagramSession(localPlayerId);
  const handleFinished = useCallback(
    (_won: boolean, finished: AnagramState) => reportFinished(finished),
    [reportFinished],
  );

  // Offline this device calls every boundary; in a room only the host does.
  const isAuthority = !isOnline || isHost;
  const engine = useAnagramEngine({ isAuthority, onFinished: handleFinished });
  const { state, clock, controls } = engine;

  // Replaying reuses the last setup, so "Play again" never reopens the lobby.
  const lastSetup = useRef<{ rules: AnagramRules; seats: AnagramSeat[] } | null>(null);

  const beginMatch = useCallback(
    (rules: AnagramRules, seats: AnagramSeat[], seed: number) => {
      lastSetup.current = { rules, seats };
      controls.startMatch(rules, seats, seed);
      setScreen(SCREEN_PLAYING);
    },
    [controls],
  );

  const handleRemoteStart = useCallback(
    ({ rules, seats, seed }: AnagramStartPayload) => {
      setIsOnline(true);
      setRoomStatus(ROOM_PLAYING);
      beginMatch(rules, seats, seed);
    },
    [beginMatch, setRoomStatus],
  );

  const room = useAnagramMultiplayer({
    enabled: isOnline,
    state,
    localPlayerId,
    onRemoteStart: handleRemoteStart,
    onRemoteAnswer: controls.submitAnswer,
    onRemoteRoundEnd: controls.load,
    onRemoteRoundStart: controls.advance,
  });

  const seatId = localPlayerId ?? state.players[0]?.id ?? null;

  const submitAnswer = useCallback(
    (word: string) => {
      if (!seatId) return;
      const { elapsedMs } = clock;
      controls.submitAnswer(seatId, word, elapsedMs);
      // Wrong guesses travel too: every peer counts the same spent attempts,
      // which is what lets them agree on when the word is over.
      if (isOnline) room.broadcastAnswer(seatId, word, elapsedMs);
    },
    [seatId, clock, controls, isOnline, room],
  );

  const startSolo = useCallback(
    (rules: AnagramRules) => {
      setIsOnline(false);
      beginMatch(rules, [soloSeat(player, localPlayerId)], createSeed());
    },
    [beginMatch, localPlayerId, player],
  );

  const startRoomMatch = useCallback(
    (rules: AnagramRules, seats: AnagramSeat[]) => {
      const seed = createSeed();
      setIsOnline(true);
      setRoomStatus(ROOM_PLAYING);
      room.broadcastStart({ rules, seats, seed });
      beginMatch(rules, seats, seed);
    },
    [beginMatch, room, setRoomStatus],
  );

  const openRoom = useCallback(() => {
    setIsOnline(true);
    setScreen(SCREEN_ROOM);
    if (!player || useAnagramMultiplayerStore.getState().roomCode) return;
    void createRoom(roomIdentity(player));
  }, [createRoom, player]);

  const replay = useCallback(
    (last: { rules: AnagramRules; seats: AnagramSeat[] }) => {
      const seed = createSeed();
      if (isOnline) room.broadcastStart({ ...last, seed });
      beginMatch(last.rules, last.seats, seed);
    },
    [beginMatch, isOnline, room],
  );

  const playAgain = useCallback(() => {
    const last = lastSetup.current;
    if (last) replay(last);
    else setScreen(SCREEN_LOBBY);
  }, [replay]);

  const backToSetup = useCallback(() => {
    if (!isOnline) return SCREEN_LOBBY;
    setRoomStatus(ROOM_LOBBY);
    return roomCode ? SCREEN_ROOM : SCREEN_LOBBY;
  }, [isOnline, roomCode, setRoomStatus]);

  const changeSetup = useCallback(() => {
    controls.reset();
    setScreen(backToSetup());
  }, [backToSetup, controls]);

  const leave = useCallback(() => {
    leaveRoom();
    setIsOnline(false);
    setScreen(SCREEN_LOBBY);
  }, [leaveRoom]);

  return {
    ...engine,
    screen,
    isOnline,
    localPlayerId,
    disconnectedIds,
    /** Guests cannot deal a new card, so they get no replay button. */
    canReplay: isAuthority,
    actions: { submitAnswer, startSolo, startRoomMatch, openRoom, playAgain, changeSetup, leave },
  };
}
