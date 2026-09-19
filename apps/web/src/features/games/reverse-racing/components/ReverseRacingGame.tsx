'use client';

import React, { useMemo, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useReverseRacingMultiplayerStore } from '@/stores/reverse-racing-multiplayer.store';
import { useReverseRacingGame } from '../hooks/use-reverse-racing-game';
import type { RacingPlayer } from '../types/reverse-racing.types';
import { ReverseRacingCanvas } from './ReverseRacingCanvas';
import { ReverseRacingHud } from './ReverseRacingHud';
import { ReverseRacingLobby } from './ReverseRacingLobby';
import { ReverseRacingRoomLobby } from './ReverseRacingRoomLobby';
import { ReverseRacingToolbar } from './ReverseRacingToolbar';
import { ReverseRacingVictoryModal } from './ReverseRacingVictoryModal';

type GameScreen = 'lobby' | 'room-lobby' | 'playing';

export function ReverseRacingGame() {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'online'>('solo');

  const player = usePlayerStore((s) => s.player);
  const reducedMotionPref = usePreferencesStore((s) => s.reducedMotion);

  // Multiplayer store
  const roomPlayers = useReverseRacingMultiplayerStore((s) => s.players);
  const transport = useReverseRacingMultiplayerStore((s) => s.transport);
  const createRoom = useReverseRacingMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useReverseRacingMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useReverseRacingMultiplayerStore((s) => s.leaveRoom);

  // Local Player Identity
  const localPlayerIdentity = useMemo(() => {
    const displayName = player?.displayName || 'Speed Demon';
    return {
      id: player?.id || 'player-local',
      name: displayName,
      displayName,
      avatar: player?.avatar || '🏎️',
      color: '#ef4444',
    };
  }, [player]);

  const [activeRoster, setActiveRoster] = useState<RacingPlayer[]>([]);

  // Lobby actions
  const handleStartSolo = (botCount: number) => {
    const bots: RacingPlayer[] = [];
    const botNames = ['Apex AI', 'Nitro CPU', 'Drift King', 'Viper Bot', 'Turbo Bot'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < botCount; i++) {
      bots.push({
        id: `bot-${i + 1}`,
        name: botNames[i % botNames.length] || `Bot ${i + 1}`,
        avatar: '🤖',
        seatIndex: i + 1,
        color: colors[i % colors.length],
        isBot: true,
        ready: true,
        trackId: `track-bot-${i + 1}`,
      });
    }

    const soloRoster: RacingPlayer[] = [
      {
        id: localPlayerIdentity.id,
        name: localPlayerIdentity.name,
        avatar: localPlayerIdentity.avatar,
        seatIndex: 0,
        color: localPlayerIdentity.color,
        isBot: false,
        ready: true,
        trackId: `track-${localPlayerIdentity.id}`,
      },
      ...bots,
    ];

    setActiveRoster(soloRoster);
    setGameMode('solo');
    setScreen('playing');
  };

  const handleCreateRoom = async () => {
    const code = await createRoom(localPlayerIdentity);
    if (code) {
      setGameMode('online');
      setScreen('room-lobby');
    }
  };

  const handleJoinRoom = async (code: string) => {
    const success = await joinRoomByCode(code, localPlayerIdentity);
    if (success) {
      setGameMode('online');
      setScreen('room-lobby');
    }
  };

  const handleStartOnlineRace = () => {
    setActiveRoster(roomPlayers);
    setScreen('playing');
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setScreen('lobby');
  };

  // Game Engine Hook
  const {
    raceState,
    countdown,
    elapsedTimeMs,
    players,
    targetPlayerId,
    attackerPlayerId,
    localVehicle,
    otherVehicles,
    trackObstacles,
    saboteur,
    standings,
    isVictoryModalOpen,
    setIsVictoryModalOpen,
    soundEnabled,
    setSoundEnabled,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    handleSteerLeft,
    handleSteerRight,
    handleJump,
    handleBrake,
    handleSelectObstacle,
    handlePlaceObstacle,
    restartRace,
  } = useReverseRacingGame({
    mode: gameMode,
    localPlayer: localPlayerIdentity,
    initialPlayers: activeRoster,
    transport: gameMode === 'online' ? transport : null,
  });

  const targetPlayer = useMemo(
    () => players.find((p) => p.id === targetPlayerId) || null,
    [players, targetPlayerId],
  );

  const attackerPlayer = useMemo(
    () => players.find((p) => p.id === attackerPlayerId) || null,
    [players, attackerPlayerId],
  );

  const targetVehicle = targetPlayerId
    ? targetPlayerId === localPlayerIdentity.id
      ? localVehicle
      : otherVehicles[targetPlayerId] || null
    : null;

  const targetTrackObs = targetPlayerId ? trackObstacles[targetPlayerId] || [] : [];
  const localTrackObs = trackObstacles[localPlayerIdentity.id] || [];

  return (
    <div className="w-full space-y-4 py-4">
      {screen === 'lobby' && (
        <ReverseRacingLobby
          onStartSolo={handleStartSolo}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {screen === 'room-lobby' && (
        <ReverseRacingRoomLobby onStartRace={handleStartOnlineRace} onLeave={handleLeaveRoom} />
      )}

      {screen === 'playing' && (
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {/* Top HUD */}
          <ReverseRacingHud
            localVehicle={localVehicle}
            targetVehicle={targetVehicle}
            targetPlayer={targetPlayer}
            attackerPlayer={attackerPlayer}
            saboteur={saboteur}
            allPlayers={players}
            allVehicles={otherVehicles}
            elapsedTimeMs={elapsedTimeMs}
          />

          {/* Interactive Dual-View Canvas */}
          <div className="relative">
            <ReverseRacingCanvas
              localVehicle={localVehicle}
              localTrackObstacles={localTrackObs}
              targetVehicle={targetVehicle}
              targetTrackObstacles={targetTrackObs}
              saboteur={saboteur}
              allPlayers={players}
              highContrast={highContrast}
              reducedMotion={reducedMotion || reducedMotionPref}
              onSteerLeft={handleSteerLeft}
              onSteerRight={handleSteerRight}
              onJump={handleJump}
              onBrake={handleBrake}
              onSelectObstacle={handleSelectObstacle}
              onPlaceObstacle={handlePlaceObstacle}
            />

            {/* Countdown Overlay */}
            {raceState === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-deck-950/75 backdrop-blur-sm">
                <div className="text-center">
                  <div className="animate-pulse text-7xl font-black tracking-widest text-amber-400">
                    {countdown > 0 ? countdown : 'GO!'}
                  </div>
                  <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-deck-200">
                    Prepare to Drive and Sabotage!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar & Controls */}
          <ReverseRacingToolbar
            saboteur={saboteur}
            onSelectObstacle={handleSelectObstacle}
            onSteerLeft={handleSteerLeft}
            onSteerRight={handleSteerRight}
            onJump={handleJump}
            onBrake={handleBrake}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            highContrast={highContrast}
            onToggleContrast={() => setHighContrast(!highContrast)}
            reducedMotion={reducedMotion}
            onToggleMotion={() => setReducedMotion(!reducedMotion)}
            onRestart={restartRace}
          />

          {/* Victory Modal */}
          <ReverseRacingVictoryModal
            isOpen={isVictoryModalOpen}
            onClose={() => setIsVictoryModalOpen(false)}
            standings={standings}
            localPlayerId={localPlayerIdentity.id}
            onRestart={restartRace}
            onExit={() => {
              setIsVictoryModalOpen(false);
              setScreen('lobby');
            }}
          />
        </div>
      )}
    </div>
  );
}
