'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { useLootDashMultiplayerStore } from '@/stores/loot-dash-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { useLootDashGame } from '../hooks/use-loot-dash-game';
import { LootDashCanvas } from './LootDashCanvas';
import { LootDashHud } from './LootDashHud';
import { LootDashLobby } from './LootDashLobby';
import { LootDashRoomLobby } from './LootDashRoomLobby';
import { LootDashToolbar } from './LootDashToolbar';
import { LootDashVictoryModal } from './LootDashVictoryModal';

export function LootDashGame() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const player = usePlayerStore((s) => s.player);

  const [mode, setMode] = useState<'lobby' | 'online_room' | 'playing'>('lobby');

  const {
    arenaState,
    config,
    stats,
    isPaused,
    startMatch,
    restartMatch,
    pauseMatch,
    resumeMatch,
    returnToLobby: hookReturnToLobby,
    toggleSound,
    toggleHighContrast,
    toggleReducedMotion,
    handleVirtualMove,
    handleDeployTrap,
    handleCanvasMouseMove,
  } = useLootDashGame('Sprinter');

  const { roomCode, error, createRoom, joinRoomByCode, leaveRoom } = useLootDashMultiplayerStore();

  // Handle URL room code parameter
  useEffect(() => {
    if (roomParam && !roomCode) {
      setMode('online_room');
      void joinRoomByCode(roomParam, {
        id: player?.id || `runner-${Date.now().toString().slice(-4)}`,
        displayName: player?.displayName || 'Guest Runner',
        avatar: player?.avatar || '🏃',
      });
    }
  }, [roomParam, roomCode, joinRoomByCode, player]);

  const handleStartSolo = (customConfig?: Parameters<typeof startMatch>[0]) => {
    startMatch(customConfig);
    setMode('playing');
  };

  const handleOpenOnlineRoom = () => {
    setMode('online_room');
  };

  const handleHostRoom = async () => {
    await createRoom({
      id: player?.id || `sprinter-${Date.now().toString().slice(-4)}`,
      displayName: player?.displayName || 'Host Sprinter',
      avatar: player?.avatar || '💎',
    });
  };

  const handleJoinRoom = async (code: string) => {
    const joined = await joinRoomByCode(code, {
      id: player?.id || `runner-${Date.now().toString().slice(-4)}`,
      displayName: player?.displayName || 'Guest Runner',
      avatar: player?.avatar || '🏃',
    });
    if (joined) {
      setMode('online_room');
    }
  };

  const handleStartMultiplayerMatch = () => {
    startMatch({ botCount: 3 });
    setMode('playing');
  };

  const handleReturnToLobby = () => {
    hookReturnToLobby();
    leaveRoom();
    setMode('lobby');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[580px] p-2 sm:p-4">
      {mode === 'lobby' && (
        <LootDashLobby
          config={config}
          stats={stats}
          onStartSolo={handleStartSolo}
          onOpenOnlineRoom={handleOpenOnlineRoom}
          onToggleSound={toggleSound}
          onToggleHighContrast={toggleHighContrast}
          onToggleReducedMotion={toggleReducedMotion}
        />
      )}

      {mode === 'online_room' && !roomCode && (
        <div className="w-full max-w-xl py-6">
          <OnlineRoomSetupCard
            title="Loot Dash — Online Match"
            description="Host a race for crystals or enter a 6-digit room code to join."
            onHost={handleHostRoom}
            onJoin={handleJoinRoom}
            onBack={() => setMode('lobby')}
            error={error}
          />
        </div>
      )}

      {mode === 'online_room' && roomCode && (
        <LootDashRoomLobby
          onStartMatch={handleStartMultiplayerMatch}
          onBackToLobby={() => {
            leaveRoom();
            setMode('lobby');
          }}
        />
      )}

      {mode === 'playing' && (
        <div className="w-full flex flex-col items-center">
          <LootDashHud
            arenaState={arenaState}
            localPlayerId="player-1"
            isPaused={isPaused}
            soundEnabled={config.soundEnabled}
            onToggleSound={toggleSound}
            onPause={pauseMatch}
            onResume={resumeMatch}
            onReturnToLobby={handleReturnToLobby}
          />

          <LootDashCanvas
            arenaState={arenaState}
            config={config}
            onMouseMove={handleCanvasMouseMove}
          />

          <LootDashToolbar
            config={config}
            isPaused={isPaused}
            onPause={pauseMatch}
            onResume={resumeMatch}
            onRestart={restartMatch}
            onReturnToLobby={handleReturnToLobby}
            onToggleSound={toggleSound}
            onToggleHighContrast={toggleHighContrast}
            onToggleReducedMotion={toggleReducedMotion}
            onVirtualMove={handleVirtualMove}
            onDeployTrap={handleDeployTrap}
          />

          {arenaState.status === 'match_over' && (
            <LootDashVictoryModal
              arenaState={arenaState}
              localPlayerId="player-1"
              onRematch={restartMatch}
              onReturnToLobby={handleReturnToLobby}
            />
          )}
        </div>
      )}
    </div>
  );
}
