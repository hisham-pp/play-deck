'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useLootDashMultiplayerStore } from '@/stores/loot-dash-multiplayer.store';
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

  const { roomCode, createRoom, joinRoomByCode } = useLootDashMultiplayerStore();

  // Handle URL room code parameter
  useEffect(() => {
    if (roomParam && !roomCode) {
      setMode('online_room');
      void joinRoomByCode(roomParam, {
        id: `runner-${Date.now().toString().slice(-4)}`,
        displayName: 'Guest Runner',
        avatar: '🏃',
      });
    }
  }, [roomParam, roomCode, joinRoomByCode]);

  const handleStartSolo = (customConfig?: Parameters<typeof startMatch>[0]) => {
    startMatch(customConfig);
    setMode('playing');
  };

  const handleOpenOnlineRoom = async () => {
    setMode('online_room');
    if (!roomCode) {
      await createRoom({
        id: `sprinter-${Date.now().toString().slice(-4)}`,
        displayName: 'Host Sprinter',
        avatar: '💎',
      });
    }
  };

  const handleStartMultiplayerMatch = () => {
    startMatch({ botCount: 3 });
    setMode('playing');
  };

  const handleReturnToLobby = () => {
    hookReturnToLobby();
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

      {mode === 'online_room' && (
        <LootDashRoomLobby
          onStartMatch={handleStartMultiplayerMatch}
          onBackToLobby={() => setMode('lobby')}
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
