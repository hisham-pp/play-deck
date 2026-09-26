'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { ColorThiefVoiceDock } from '@/features/voice/components/ColorThiefVoiceDock';
import { useColorThiefMultiplayerStore } from '@/stores/color-thief-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import {
  DEFAULT_RULE_SETTINGS,
  MIN_SEATS,
  STATUS_COMPLETED,
} from '../engine/color-thief-constants';
import { useColorThiefActions } from '../hooks/use-color-thief-actions';
import { useColorThiefBots } from '../hooks/use-color-thief-bots';
import { useColorThiefEngine } from '../hooks/use-color-thief-engine';
import { useColorThiefMultiplayer } from '../hooks/use-color-thief-multiplayer';
import { useColorThiefSession } from '../hooks/use-color-thief-session';
import { useColorThiefTurn } from '../hooks/use-color-thief-turn';
import { useHighContrast } from '../hooks/use-high-contrast';
import type { ColorThiefRuleSettings, ColorThiefSeat } from '../types/color-thief.types';
import { ColorThiefArena } from './ColorThiefArena';
import { ColorThiefGameOver } from './ColorThiefGameOver';
import { ColorThiefLobby } from './ColorThiefLobby';
import { ColorThiefOfflineSetup } from './ColorThiefOfflineSetup';
import { ColorThiefRoomLobby } from './ColorThiefRoomLobby';

type Screen = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

const SCREEN_LOBBY = 'lobby';
const SCREEN_PLAYING = 'playing';
const DEFAULT_AVATAR = '🎨';

export function ColorThiefGame() {
  // Arriving through an invite or join link drops the player straight in the room.
  const [screen, setScreen] = useState<Screen>(() =>
    useColorThiefMultiplayerStore.getState().roomCode ? 'online-room' : SCREEN_LOBBY,
  );
  const [seats, setSeats] = useState<ColorThiefSeat[]>([]);
  const [settings, setSettings] = useState<ColorThiefRuleSettings>(DEFAULT_RULE_SETTINGS);
  const [isOnline, setIsOnline] = useState(false);
  const [highContrast, toggleHighContrast] = useHighContrast();

  const player = usePlayerStore((s) => s.player);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);

  const roomCode = useColorThiefMultiplayerStore((s) => s.roomCode);
  const createRoom = useColorThiefMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useColorThiefMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useColorThiefMultiplayerStore((s) => s.leaveRoom);
  const adoptSeats = useColorThiefMultiplayerStore((s) => s.adoptSeats);
  const setRoomStatus = useColorThiefMultiplayerStore((s) => s.setStatus);
  const isHost = useColorThiefMultiplayerStore((s) => s.isHost());

  const [isHosting, setIsHosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  const { engine, state, claimTile, useAbility, endTurn, pause, resume, restart } =
    useColorThiefEngine(seats, settings);

  useColorThiefSession(state, player?.id ?? null);

  const beginMatch = useCallback(
    (nextSeats: ColorThiefSeat[], nextSettings: ColorThiefRuleSettings = DEFAULT_RULE_SETTINGS) => {
      setSeats(nextSeats);
      setSettings(nextSettings);
      restart(nextSeats, nextSettings);
      setScreen(SCREEN_PLAYING);
    },
    [restart],
  );

  const room = useColorThiefMultiplayer({
    enabled: isOnline,
    engine,
    state,
    seats,
    localPlayerId: player?.id ?? null,
    onSeats: setSeats,
    onStart: beginMatch,
  });

  const { currentSeat, canAct, abilityReady, scores, announcement } = useColorThiefTurn({
    state,
    seats,
    isOnline,
    localPlayerId: player?.id ?? null,
  });

  // Every move is applied locally and mirrored to the room. The reducer is
  // deterministic, so both sides land on the same board without a referee.
  const play = useMemo(
    () => ({
      claim: (playerId: string, index: number) => {
        claimTile(playerId, index);
        if (isOnline) room.broadcastClaim(playerId, index);
      },
      ability: (playerId: string, targets: number[]) => {
        useAbility(playerId, targets);
        if (isOnline) room.broadcastAbility(playerId, targets);
      },
      endTurn: (playerId: string) => {
        endTurn(playerId);
        if (isOnline) room.broadcastEndTurn(playerId);
      },
    }),
    [claimTile, useAbility, endTurn, isOnline, room],
  );

  // Offline the bots play themselves; online only the host drives them, or the
  // table would apply every bot move twice.
  const { thinkingSeatIndex } = useColorThiefBots(state, isOnline && !isHost ? [] : seats, play);

  const actions = useColorThiefActions({ state, currentSeat, canAct, play });

  const handleStartOnline = (nextSeats: ColorThiefSeat[]) => {
    setIsOnline(true);
    setRoomStatus('playing');
    room.broadcastStart(nextSeats);
    beginMatch(nextSeats);
  };

  const handleHostOnlineRoom = async () => {
    if (!player) return;
    setIsHosting(true);
    setOnlineError(null);
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || DEFAULT_AVATAR,
    });
    setIsHosting(false);
    if (!code) {
      setOnlineError(useColorThiefMultiplayerStore.getState().error || 'Failed to create room');
    }
  };

  const handleJoinOnlineRoom = async (code: string) => {
    if (!player) return;
    setIsJoining(true);
    setOnlineError(null);
    const ok = await joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || DEFAULT_AVATAR,
    });
    setIsJoining(false);
    if (!ok) {
      setOnlineError(useColorThiefMultiplayerStore.getState().error || 'Failed to join room. Please check the code.');
    }
  };

  const handleOpenOnlineRoom = () => {
    setIsOnline(true);
    setScreen('online-room');
    setOnlineError(null);
  };

  const handleRestart = () => {
    if (seats.length < MIN_SEATS) return;
    restart(seats, settings);
    if (isOnline && isHost) room.broadcastRestart(seats);
  };

  const handleLeave = () => {
    if (isOnline) {
      leaveRoom();
      setIsOnline(false);
    }
    setScreen(SCREEN_LOBBY);
  };

  if (screen === SCREEN_LOBBY) {
    return (
      <ColorThiefLobby
        onSelectOffline={() => setScreen('offline-setup')}
        onSelectOnline={handleOpenOnlineRoom}
      />
    );
  }

  if (screen === 'offline-setup') {
    return (
      <ColorThiefOfflineSetup
        onStart={(nextSeats, rules) => {
          setIsOnline(false);
          beginMatch(nextSeats, rules);
        }}
        onBack={() => setScreen(SCREEN_LOBBY)}
      />
    );
  }

  if (screen === 'online-room') {
    if (!roomCode) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-4">
          <OnlineRoomSetupCard
            gameName="Color Thief"
            gameIcon={<span>🎨</span>}
            subtitle="Steal the grid one tile at a time with friends online with live voice chat!"
            isHosting={isHosting}
            isJoining={isJoining}
            error={onlineError}
            onHost={handleHostOnlineRoom}
            onJoin={handleJoinOnlineRoom}
            onBack={() => {
              setIsOnline(false);
              setScreen(SCREEN_LOBBY);
            }}
          />
        </div>
      );
    }

    return (
      <ColorThiefRoomLobby
        onStartGame={handleStartOnline}
        onLeave={() => {
          adoptSeats([]);
          setIsOnline(false);
          setScreen(SCREEN_LOBBY);
        }}
      />
    );
  }

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <ColorThiefArena
        state={state}
        seats={seats}
        scores={scores}
        ability={actions.ability}
        abilityReady={abilityReady}
        isTargeting={actions.isTargeting}
        targetPrompt={actions.targetPrompt}
        selectedTargets={actions.selectedTargets}
        focusedIndex={actions.focusedIndex}
        canAct={canAct}
        canPause={!isOnline}
        canRestart={!isOnline || isHost}
        highContrast={highContrast}
        reducedMotion={reducedMotion}
        thinkingSeatIndex={thinkingSeatIndex}
        localPlayerId={player?.id ?? null}
        onSelectTile={actions.selectTile}
        onFocusTile={actions.setFocusedIndex}
        onKeyDown={actions.onKeyDown}
        registerTile={actions.registerTile}
        onToggleAbility={actions.toggleTargeting}
        onToggleContrast={toggleHighContrast}
        onEndTurn={actions.endTurn}
        onPause={() => currentSeat && pause(currentSeat.id)}
        onResume={() => currentSeat && resume(currentSeat.id)}
        onRestart={handleRestart}
        onLeave={handleLeave}
      />

      {isOnline && roomCode && <ColorThiefVoiceDock anchorClassName="bottom-4 right-4" />}

      {state.status === STATUS_COMPLETED && (
        <ColorThiefGameOver
          state={state}
          seats={seats}
          scores={scores}
          canRestart={!isOnline || isHost}
          onRestart={handleRestart}
          onExit={handleLeave}
        />
      )}
    </>
  );
}
