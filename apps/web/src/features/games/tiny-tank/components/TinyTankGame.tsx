'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useTinyTankMultiplayerStore } from '@/stores/tiny-tank-multiplayer.store';
import { useTinyTankGame } from '../hooks/use-tiny-tank-game';
import { TinyTankCanvas } from './TinyTankCanvas';
import { TinyTankHud } from './TinyTankHud';
import { TinyTankLobby } from './TinyTankLobby';
import { TinyTankRoomLobby } from './TinyTankRoomLobby';
import { TinyTankToolbar } from './TinyTankToolbar';
import { TinyTankVictoryModal } from './TinyTankVictoryModal';

export function TinyTankGame() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');

  const [mode, setMode] = useState<'lobby' | 'online_room' | 'playing'>('lobby');

  const {
    arenaState,
    config,
    stats,
    isPaused,
    mousePos,
    startMatch,
    restartMatch,
    pauseMatch,
    resumeMatch,
    returnToLobby: hookReturnToLobby,
    toggleSound,
    toggleHighContrast,
    toggleReducedMotion,
    switchWeapon,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
  } = useTinyTankGame();

  const { roomCode, createRoom, joinRoomByCode } = useTinyTankMultiplayerStore();

  // Handle URL room code parameter
  useEffect(() => {
    if (roomParam && !roomCode) {
      setMode('online_room');
      void joinRoomByCode(roomParam, {
        id: `cadet-${Date.now().toString().slice(-4)}`,
        displayName: 'Guest Tanker',
        avatar: '🤖',
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
        id: `commander-${Date.now().toString().slice(-4)}`,
        displayName: 'Commander Tank',
        avatar: '🛡️',
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
        <TinyTankLobby
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
        <TinyTankRoomLobby
          onStartMatch={handleStartMultiplayerMatch}
          onBackToLobby={() => setMode('lobby')}
        />
      )}

      {mode === 'playing' && (
        <div className="w-full flex flex-col items-center">
          <TinyTankHud
            arenaState={arenaState}
            localPlayerId="player-1"
            onSwitchWeapon={switchWeapon}
          />

          <TinyTankCanvas
            arenaState={arenaState}
            config={config}
            localPlayerId="player-1"
            mousePos={mousePos}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
          />

          <TinyTankToolbar
            config={config}
            isPaused={isPaused}
            onPause={pauseMatch}
            onResume={resumeMatch}
            onRestart={restartMatch}
            onReturnToLobby={handleReturnToLobby}
            onToggleSound={toggleSound}
            onToggleHighContrast={toggleHighContrast}
            onToggleReducedMotion={toggleReducedMotion}
          />

          {arenaState.status === 'match_over' && (
            <TinyTankVictoryModal
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
