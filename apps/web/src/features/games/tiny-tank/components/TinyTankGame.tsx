'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { usePlayerStore } from '@/stores/player.store';
import { useTinyTankMultiplayerStore } from '@/stores/tiny-tank-multiplayer.store';
import { useTinyTankGame } from '../hooks/use-tiny-tank-game';
import { DEFAULT_PLAYER_ID } from '../types/tiny-tank.types';
import { TinyTankCanvas } from './TinyTankCanvas';
import { TinyTankHud } from './TinyTankHud';
import { TinyTankLobby } from './TinyTankLobby';
import { TinyTankRoomLobby } from './TinyTankRoomLobby';
import { TinyTankToolbar } from './TinyTankToolbar';
import { TinyTankVictoryModal } from './TinyTankVictoryModal';

const MODE_LOBBY = 'lobby' as const;
const MODE_ONLINE_ROOM = 'online_room' as const;
const MODE_PLAYING = 'playing' as const;

type TankGameMode = typeof MODE_LOBBY | typeof MODE_ONLINE_ROOM | typeof MODE_PLAYING;

export function TinyTankGame() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const player = usePlayerStore((s) => s.player);

  const [mode, setMode] = useState<TankGameMode>(MODE_LOBBY);

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

  const { roomCode, error, createRoom, joinRoomByCode, leaveRoom } = useTinyTankMultiplayerStore();

  useEffect(() => {
    if (roomParam && !roomCode) {
      void joinRoomByCode(roomParam, {
        id: player?.id || `commander-${Date.now().toString().slice(-4)}`,
        displayName: player?.displayName || 'Commander Tank',
        avatar: player?.avatar || '🛡️',
      }).then((joined) => {
        if (joined) setMode(MODE_ONLINE_ROOM);
      });
    }
  }, [roomParam, roomCode, joinRoomByCode, player]);

  const handleStartSolo = (customConfig?: Partial<typeof config>) => {
    startMatch(customConfig);
    setMode(MODE_PLAYING);
  };

  const handleOpenOnlineRoom = () => {
    setMode(MODE_ONLINE_ROOM);
  };

  const handleHostRoom = async () => {
    await createRoom({
      id: player?.id || `commander-${Date.now().toString().slice(-4)}`,
      displayName: player?.displayName || 'Commander Tank',
      avatar: player?.avatar || '🛡️',
    });
  };

  const handleJoinRoom = async (code: string) => {
    const joined = await joinRoomByCode(code, {
      id: player?.id || `commander-${Date.now().toString().slice(-4)}`,
      displayName: player?.displayName || 'Commander Tank',
      avatar: player?.avatar || '🛡️',
    });
    if (joined) {
      setMode(MODE_ONLINE_ROOM);
    }
  };

  const handleStartMultiplayerMatch = () => {
    startMatch({ botCount: 3 });
    setMode(MODE_PLAYING);
  };

  const handleReturnToLobby = () => {
    hookReturnToLobby();
    leaveRoom();
    setMode(MODE_LOBBY);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[580px] p-2 sm:p-4">
      {mode === MODE_LOBBY && (
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

      {mode === MODE_ONLINE_ROOM && !roomCode && (
        <div className="w-full max-w-xl py-6">
          <OnlineRoomSetupCard
            title="Tiny Tank — Online Match"
            description="Host an armored skirmish or enter a 6-digit room code to join."
            onHost={handleHostRoom}
            onJoin={handleJoinRoom}
            onBack={() => setMode(MODE_LOBBY)}
            error={error}
          />
        </div>
      )}

      {mode === MODE_ONLINE_ROOM && roomCode && (
        <TinyTankRoomLobby
          onStartMatch={handleStartMultiplayerMatch}
          onBackToLobby={() => {
            leaveRoom();
            setMode(MODE_LOBBY);
          }}
        />
      )}

      {mode === MODE_PLAYING && (
        <div className="w-full flex flex-col items-center">
          <TinyTankHud
            arenaState={arenaState}
            localPlayerId={DEFAULT_PLAYER_ID}
            onSwitchWeapon={switchWeapon}
          />

          <TinyTankCanvas
            arenaState={arenaState}
            config={config}
            localPlayerId={DEFAULT_PLAYER_ID}
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
              localPlayerId={DEFAULT_PLAYER_ID}
              onRematch={restartMatch}
              onReturnToLobby={handleReturnToLobby}
            />
          )}
        </div>
      )}
    </div>
  );
}
