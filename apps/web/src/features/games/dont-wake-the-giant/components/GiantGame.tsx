'use client';

import React, { useCallback, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { GiantVoiceDock } from '@/features/voice/components/GiantVoiceDock';
import { useGiantMultiplayerStore } from '@/stores/giant-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { HEIST_MS, PHASE_WOKEN } from '../engine/giant-constants';
import type { GiantEngine } from '../engine/giant-engine';
import { MAP_IDS } from '../engine/map-layout';
import { crewSucceeded, loudestOf } from '../engine/scoring';
import { useGiantGame } from '../hooks/use-giant-game';
import { giantStatsRepository } from '../services/giant-stats-repository';
import type { GiantPhase, GiantSeat } from '../types/giant.types';
import { GiantChamber } from './GiantChamber';
import { GiantLobby } from './GiantLobby';
import { GiantOfflineSetup } from './GiantOfflineSetup';
import { GiantRoomLobby } from './GiantRoomLobby';
import { GiantRoundOver } from './GiantRoundOver';

type Screen = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

/** The bits of a finished heist the results screen needs after the loop stops. */
interface Outcome {
  phase: GiantPhase;
  bankedTotal: number;
  peakNoise: number;
  loudest: GiantSeat | null;
}

export function GiantGame() {
  const [screen, setScreen] = useState<Screen>(() =>
    useGiantMultiplayerStore.getState().roomCode ? 'online-room' : 'lobby',
  );
  const [seats, setSeats] = useState<GiantSeat[]>([]);
  const [mapId, setMapId] = useState(MAP_IDS[0]);
  const [heistMs, setHeistMs] = useState(HEIST_MS);
  const [isOnline, setIsOnline] = useState(() =>
    Boolean(useGiantMultiplayerStore.getState().roomCode),
  );
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const player = usePlayerStore((s) => s.player);
  const roomCode = useGiantMultiplayerStore((s) => s.roomCode);
  const createRoom = useGiantMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useGiantMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useGiantMultiplayerStore((s) => s.leaveRoom);
  const error = useGiantMultiplayerStore((s) => s.error);
  const isHost = useGiantMultiplayerStore((s) => s.isHost());
  const storeSeats = useGiantMultiplayerStore((s) => s.seats);

  const activeSeats = isOnline ? storeSeats : seats;

  const handleSeatsFromHost = useCallback((incoming: GiantSeat[]) => {
    setSeats(incoming);
  }, []);

  const handleHeistEnd = useCallback(
    (engine: GiantEngine) => {
      const world = engine.getWorld();
      const localId = player?.id ?? null;

      setOutcome({
        phase: world.phase,
        bankedTotal: world.bankedTotal,
        peakNoise: world.peakNoise,
        loudest: loudestOf(activeSeats, world.thieves),
      });

      void giantStatsRepository.recordHeist({
        escaped: crewSucceeded(world),
        banked: (localId && engine.thief(localId)?.banked) || 0,
      });
    },
    [activeSeats, player?.id],
  );

  const game = useGiantGame({
    seats: activeSeats,
    mapId,
    heistMs,
    isOnline,
    isHost: isOnline ? isHost : true,
    localPlayerId: player?.id ?? null,
    onSeatsFromHost: handleSeatsFromHost,
    onHeistEnd: handleHeistEnd,
  });

  const handleOpenOnlineRoom = () => {
    setScreen('online-room');
  };

  const handleHostOnline = async () => {
    if (!player) return;
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕯️',
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
      avatar: player.avatar || '🕯️',
    });
    if (ok) {
      setIsOnline(true);
      setScreen('online-room');
    }
  };

  const handleStartOffline = (
    chosenSeats: GiantSeat[],
    chosenMap: string,
    chosenHeistMs: number,
  ) => {
    setIsOnline(false);
    setSeats(chosenSeats);
    setMapId(chosenMap);
    setHeistMs(chosenHeistMs);
    setOutcome(null);
    setScreen('playing');
  };

  const handleStartOnline = () => {
    setIsOnline(true);
    setOutcome(null);
    setScreen('playing');
  };

  const handleRematch = () => {
    setOutcome(null);
    game.startHeist();
  };

  const handleLeaveGame = () => {
    if (isOnline) leaveRoom();
    setIsOnline(false);
    setOutcome(null);
    setScreen('lobby');
  };

  if (screen === 'lobby') {
    return (
      <GiantLobby
        onSelectOffline={() => setScreen('offline-setup')}
        onSelectOnline={handleOpenOnlineRoom}
      />
    );
  }

  if (screen === 'offline-setup') {
    return <GiantOfflineSetup onBack={() => setScreen('lobby')} onStart={handleStartOffline} />;
  }

  if (screen === 'online-room') {
    if (!roomCode) {
      return (
        <div className="mx-auto w-full max-w-xl py-6">
          <OnlineRoomSetupCard
            title="Don't Wake the Giant — Online Match"
            description="Host a heist with your crew or join with a 6-digit room code."
            onHost={handleHostOnline}
            onJoin={handleJoinOnline}
            onBack={() => setScreen('lobby')}
            error={error}
          />
        </div>
      );
    }
    return <GiantRoomLobby onStartGame={handleStartOnline} onLeave={handleLeaveGame} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {isOnline && roomCode && <GiantVoiceDock />}
      <GiantChamber
        canvasRef={game.canvasRef}
        hud={game.hud}
        controls={game.controls}
        mapId={mapId}
        localPlayerId={player?.id ?? null}
        highContrast={game.highContrast}
        onToggleContrast={() => game.setHighContrast(!game.highContrast)}
        onLeave={handleLeaveGame}
      />
      {outcome && (
        <GiantRoundOver
          phase={outcome.phase ?? PHASE_WOKEN}
          standings={game.hud.standings}
          bankedTotal={outcome.bankedTotal}
          peakNoise={outcome.peakNoise}
          loudest={outcome.loudest}
          localPlayerId={player?.id ?? null}
          canRematch={isOnline ? isHost : true}
          onRematch={handleRematch}
          onExit={handleLeaveGame}
        />
      )}
    </div>
  );
}
