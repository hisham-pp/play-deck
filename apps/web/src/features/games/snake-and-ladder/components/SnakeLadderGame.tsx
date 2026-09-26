'use client';

import { useCallback, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { SnakeLadderVoiceDock } from '@/features/voice/components/SnakeLadderVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useSnakeLadderMultiplayerStore } from '@/stores/snake-ladder-multiplayer.store';
import { DEFAULT_RULE_SETTINGS, STATUS_COMPLETED } from '../engine/snake-ladder-constants';
import { useMoveAnimation } from '../hooks/use-move-animation';
import { useSnakeLadderBotTurn } from '../hooks/use-snake-ladder-bot-turn';
import { useSnakeLadderEngine } from '../hooks/use-snake-ladder-engine';
import { useSnakeLadderMultiplayer } from '../hooks/use-snake-ladder-multiplayer';
import { useSnakeLadderSession } from '../hooks/use-snake-ladder-session';
import { useSnakeLadderSound } from '../hooks/use-snake-ladder-sound';
import { useSnakeLadderTurn } from '../hooks/use-snake-ladder-turn';
import type { SnakeLadderPlayer, SnakeLadderRuleSettings } from '../types/snake-and-ladder.types';
import { SnakeLadderArena } from './SnakeLadderArena';
import { SnakeLadderGameOver } from './SnakeLadderGameOver';
import { SnakeLadderLobby } from './SnakeLadderLobby';
import { SnakeLadderOfflineSetup } from './SnakeLadderOfflineSetup';
import { SnakeLadderRoomLobby } from './SnakeLadderRoomLobby';

type Screen = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

const SCREEN_LOBBY = 'lobby';

export function SnakeLadderGame() {
  // Arriving through an invite or join link drops the player straight in the room.
  const [screen, setScreen] = useState<Screen>(() =>
    useSnakeLadderMultiplayerStore.getState().roomCode ? 'online-room' : SCREEN_LOBBY,
  );
  const [seats, setSeats] = useState<SnakeLadderPlayer[]>([]);
  const [settings, setSettings] = useState<SnakeLadderRuleSettings>(DEFAULT_RULE_SETTINGS);
  const [isOnline, setIsOnline] = useState(false);

  const player = usePlayerStore((s) => s.player);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);

  const roomCode = useSnakeLadderMultiplayerStore((s) => s.roomCode);
  const createRoom = useSnakeLadderMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useSnakeLadderMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useSnakeLadderMultiplayerStore((s) => s.leaveRoom);
  const adoptSeats = useSnakeLadderMultiplayerStore((s) => s.adoptSeats);
  const setRoomStatus = useSnakeLadderMultiplayerStore((s) => s.setStatus);
  const isHost = useSnakeLadderMultiplayerStore((s) => s.isHost());

  const [isHosting, setIsHosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  const { engine, state, rollForPlayer, applyRoll, pause, resume, restart } = useSnakeLadderEngine(
    seats,
    settings,
  );

  const animation = useMoveAnimation(state.lastMove, reducedMotion);
  const boardIsBusy = animation.isAnimating;

  useSnakeLadderSound(state);
  useSnakeLadderSession(state, player?.id ?? null);

  const beginMatch = useCallback(
    (nextSeats: SnakeLadderPlayer[]) => {
      setSeats(nextSeats);
      restart(nextSeats);
      setScreen('playing');
    },
    [restart],
  );

  const { requestRoll, broadcastStart, broadcastRestart } = useSnakeLadderMultiplayer({
    enabled: isOnline,
    engine,
    state,
    seats,
    localPlayerId: player?.id ?? null,
    boardIsBusy,
    applyRoll,
    onSeats: setSeats,
    onStart: beginMatch,
  });

  const { currentSeat, canRoll, waitingFor } = useSnakeLadderTurn({
    engine,
    state,
    seats,
    isOnline,
    localPlayerId: player?.id ?? null,
    boardIsBusy,
  });

  // Offline bots roll themselves; online, only the host drives them.
  const rollSeat = useCallback(
    (playerId: string) => {
      if (isOnline) {
        requestRoll(playerId);
        return;
      }
      rollForPlayer(playerId);
    },
    [isOnline, requestRoll, rollForPlayer],
  );

  const { thinkingSeatIndex } = useSnakeLadderBotTurn(
    engine,
    state,
    isOnline && !isHost ? [] : seats,
    boardIsBusy,
    rollSeat,
  );

  const handleRollDice = useCallback(() => {
    if (!currentSeat) return;
    rollSeat(currentSeat.id);
  }, [currentSeat, rollSeat]);

  const handleStartOffline = (nextSeats: SnakeLadderPlayer[], rules: SnakeLadderRuleSettings) => {
    setIsOnline(false);
    setSettings(rules);
    beginMatch(nextSeats);
  };

  const handleStartOnline = (nextSeats: SnakeLadderPlayer[]) => {
    setIsOnline(true);
    setRoomStatus('playing');
    broadcastStart(nextSeats);
    beginMatch(nextSeats);
  };

  const handleHostOnlineRoom = async () => {
    if (!player) return;
    setIsHosting(true);
    setOnlineError(null);
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    setIsHosting(false);
    if (!code) {
      setOnlineError(useSnakeLadderMultiplayerStore.getState().error || 'Failed to create room');
    }
  };

  const handleJoinOnlineRoom = async (code: string) => {
    if (!player) return;
    setIsJoining(true);
    setOnlineError(null);
    const ok = await joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    setIsJoining(false);
    if (!ok) {
      setOnlineError(
        useSnakeLadderMultiplayerStore.getState().error ||
          'Failed to join room. Please check the code.',
      );
    }
  };

  const handleOpenOnlineRoom = () => {
    setIsOnline(true);
    setScreen('online-room');
    setOnlineError(null);
  };

  const handleRestart = () => {
    if (seats.length < 2) return;
    restart(seats);
    if (isOnline && isHost) broadcastRestart(seats);
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
      <SnakeLadderLobby
        onSelectOffline={() => setScreen('offline-setup')}
        onSelectOnline={handleOpenOnlineRoom}
      />
    );
  }

  if (screen === 'offline-setup') {
    return (
      <SnakeLadderOfflineSetup
        onStart={handleStartOffline}
        onBack={() => setScreen(SCREEN_LOBBY)}
      />
    );
  }

  if (screen === 'online-room') {
    if (!roomCode) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-4">
          <OnlineRoomSetupCard
            gameName="Snake &amp; Ladder"
            gameIcon={<span>🐍</span>}
            subtitle="Climb ladders, dodge snakes with friends online with live voice chat!"
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
      <SnakeLadderRoomLobby
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
      <SnakeLadderArena
        state={state}
        seats={seats}
        animation={animation}
        canRoll={canRoll}
        waitingFor={waitingFor}
        localSeatIndex={seats.find((s) => s.id === player?.id)?.seatIndex ?? null}
        thinkingSeatIndex={thinkingSeatIndex}
        canPause={!isOnline}
        onRollDice={handleRollDice}
        onPause={() => currentSeat && pause(currentSeat.id)}
        onResume={() => currentSeat && resume(currentSeat.id)}
        onRestart={handleRestart}
        onLeave={handleLeave}
      />

      {isOnline && roomCode && <SnakeLadderVoiceDock defaultOpen={false} />}

      {state.status === STATUS_COMPLETED && (
        <SnakeLadderGameOver
          state={state}
          seats={seats}
          canRestart={!isOnline || isHost}
          onRestart={handleRestart}
          onExit={handleLeave}
        />
      )}
    </>
  );
}
