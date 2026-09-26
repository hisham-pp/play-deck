'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { ElevatorVoiceDock } from '@/features/voice/components/ElevatorVoiceDock';
import { useElevatorMultiplayerStore } from '@/stores/elevator-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { DEFAULT_SLIPS, PHASE_PLACING, SEAT_TYPE_HUMAN } from '../engine/elevator-constants';
import { useElevatorBots } from '../hooks/use-elevator-bots';
import { useElevatorEngine } from '../hooks/use-elevator-engine';
import { useElevatorInput, type ElevatorAim } from '../hooks/use-elevator-input';
import { useElevatorLoop } from '../hooks/use-elevator-loop';
import { useElevatorMultiplayer } from '../hooks/use-elevator-multiplayer';
import { useElevatorSession } from '../hooks/use-elevator-session';
import { useElevatorSound } from '../hooks/use-elevator-sound';
import type { ElevatorSeat } from '../types/unstable-elevator.types';
import { ElevatorArena } from './ElevatorArena';
import { ElevatorLobby } from './ElevatorLobby';
import { ElevatorOfflineSetup, type OfflineCrewSettings } from './ElevatorOfflineSetup';
import { ElevatorRoomLobby } from './ElevatorRoomLobby';

type Screen = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

export function ElevatorGame() {
  const [screen, setScreen] = useState<Screen>(() =>
    useElevatorMultiplayerStore.getState().roomCode ? 'online-room' : 'lobby',
  );
  const [isOnline, setIsOnline] = useState(() =>
    Boolean(useElevatorMultiplayerStore.getState().roomCode),
  );
  const [seed, setSeed] = useState(() => String(Date.now()));
  const [slips, setSlips] = useState(DEFAULT_SLIPS);
  const [seats, setSeats] = useState<ElevatorSeat[]>([]);
  const [aim, setAim] = useState<ElevatorAim>({ x: 0, angle: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const player = usePlayerStore((s) => s.player);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);

  const roomCode = useElevatorMultiplayerStore((s) => s.roomCode);
  const createRoom = useElevatorMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useElevatorMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useElevatorMultiplayerStore((s) => s.leaveRoom);
  const error = useElevatorMultiplayerStore((s) => s.error);
  const isHost = useElevatorMultiplayerStore((s) => s.isHost());
  const storeSeats = useElevatorMultiplayerStore((s) => s.seats);

  const activeSeats = isOnline ? storeSeats : seats;

  const { engine, state, restart } = useElevatorEngine({
    seats: activeSeats,
    seed,
    slips,
  });

  const isDriving = isOnline ? isHost : true;
  const isMyTurn = useMemo(() => {
    if (!isOnline) {
      const activeSeat = state.seats.find((s) => s.id === state.activeSeatId);
      return Boolean(activeSeat && activeSeat.type === SEAT_TYPE_HUMAN);
    }
    return state.activeSeatId === player?.id;
  }, [isOnline, state.activeSeatId, state.seats, player?.id]);

  const net = useElevatorMultiplayer({
    enabled: isOnline,
    engine,
    localPlayerId: player?.id ?? null,
    holdsClaw: isMyTurn,
    onSeats: setSeats,
    onStart: (payload) => {
      setSeed(payload.seed);
      setSlips(payload.slips);
      restart(payload.seats, payload.seed, payload.slips);
      setScreen('playing');
    },
  });

  const handleDrop = useCallback(() => {
    if (state.phase !== PHASE_PLACING || !state.activeSeatId) return;
    if (isDriving) {
      engine.drop(state.activeSeatId);
    } else {
      net.requestDrop();
    }
  }, [state.phase, state.activeSeatId, isDriving, engine, net]);

  const handleAimChange = useCallback(
    (nextAim: ElevatorAim) => {
      setAim(nextAim);
      if (isDriving) {
        engine.setClaw(nextAim.x, nextAim.angle);
      } else {
        net.aim(nextAim.x, nextAim.angle);
      }
    },
    [isDriving, engine, net],
  );

  useElevatorLoop({
    canvasRef,
    engine,
    driving: isDriving,
    highContrast: false,
    reducedMotion: Boolean(reducedMotion),
    onFrame: () => {
      if (isOnline && isHost) {
        net.publishSnapshot();
      }
    },
  });

  useElevatorBots({
    engine,
    state,
    driving: isDriving,
    seed,
    skill: 'steady',
  });

  useElevatorSound(state);
  useElevatorSession(state, player?.id ?? null);

  const input = useElevatorInput({
    enabled: isMyTurn && state.phase === PHASE_PLACING,
    aim,
    onAim: handleAimChange,
    onDrop: handleDrop,
  });

  const handleOpenOnlineRoom = () => {
    setScreen('online-room');
  };

  const handleHostOnline = async () => {
    if (!player) return;
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🛗',
    });
    if (code) {
      setIsOnline(true);
      setScreen('online-room');
    }
  };

  const handleJoinOnline = async (code: string) => {
    if (!player) return;
    const ok = await joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🛗',
    });
    if (ok) {
      setIsOnline(true);
      setScreen('online-room');
    }
  };

  const handleStartOffline = (settings: OfflineCrewSettings) => {
    setIsOnline(false);
    setSeats(settings.seats);
    setSlips(settings.slips);
    const nextSeed = String(Date.now());
    setSeed(nextSeed);
    restart(settings.seats, nextSeed, settings.slips);
    setScreen('playing');
  };

  const handleStartOnline = (chosenSeats: ElevatorSeat[]) => {
    setIsOnline(true);
    const nextSeed = String(Date.now());
    setSeed(nextSeed);
    net.broadcastStart({
      seed: nextSeed,
      seats: chosenSeats,
      slips,
    });
    restart(chosenSeats, nextSeed, slips);
    setScreen('playing');
  };

  const handleRestartGame = () => {
    const nextSeed = String(Date.now());
    setSeed(nextSeed);
    if (isOnline && isHost) {
      net.broadcastRestart({
        seed: nextSeed,
        seats: activeSeats,
        slips,
      });
    }
    restart(activeSeats, nextSeed, slips);
  };

  const handleLeaveGame = () => {
    if (isOnline) leaveRoom();
    setIsOnline(false);
    setScreen('lobby');
  };

  if (screen === 'lobby') {
    return (
      <ElevatorLobby
        onSelectOffline={() => setScreen('offline-setup')}
        onSelectOnline={handleOpenOnlineRoom}
      />
    );
  }

  if (screen === 'offline-setup') {
    return <ElevatorOfflineSetup onBack={() => setScreen('lobby')} onStart={handleStartOffline} />;
  }

  if (screen === 'online-room') {
    if (!roomCode) {
      return (
        <div className="mx-auto w-full max-w-xl py-6">
          <OnlineRoomSetupCard
            title="Unstable Elevator — Online Match"
            description="Host a shared lift with your crew or join with a 6-digit room code."
            onHost={handleHostOnline}
            onJoin={handleJoinOnline}
            onBack={() => setScreen('lobby')}
            error={error}
          />
        </div>
      );
    }
    return <ElevatorRoomLobby onStartGame={handleStartOnline} onLeave={handleLeaveGame} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      {isOnline && roomCode && <ElevatorVoiceDock defaultOpen={false} />}
      <ElevatorArena
        canvasRef={canvasRef}
        state={state}
        localPlayerId={player?.id ?? null}
        isMyTurn={isMyTurn}
        canDrop={engine.canDrop()}
        onNudge={input.nudge}
        onTurn={input.turn}
        onDrop={handleDrop}
        onRestart={handleRestartGame}
        onLeave={handleLeaveGame}
        onPointerDown={input.onPointerDown}
        onPointerMove={input.onPointerMove}
        onPointerUp={input.onPointerUp}
      />
    </div>
  );
}
