'use client';

import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useMagnetMayhemMultiplayerStore } from '@/stores/magnet-mayhem-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { useMagnetMayhemGame } from '../hooks/use-magnet-mayhem-game';
import { MagnetMayhemCanvas } from './MagnetMayhemCanvas';
import { MagnetMayhemHud } from './MagnetMayhemHud';
import { MagnetMayhemLobby } from './MagnetMayhemLobby';
import { MagnetMayhemRoomLobby } from './MagnetMayhemRoomLobby';
import { MagnetMayhemToolbar } from './MagnetMayhemToolbar';
import { MagnetMayhemVictoryModal } from './MagnetMayhemVictoryModal';

type GameScreen = 'lobby' | 'room-lobby' | 'playing';

export function MagnetMayhemGame() {
  const searchParams = useSearchParams();
  const roomCodeQuery = searchParams.get('room');

  const [screen, setScreen] = useState<GameScreen>(roomCodeQuery ? 'room-lobby' : 'lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'online'>(roomCodeQuery ? 'online' : 'solo');
  const [botCount, setBotCount] = useState(3);
  const [showVictory, setShowVictory] = useState(false);

  const player = usePlayerStore((s) => s.player);

  const createRoom = useMagnetMayhemMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useMagnetMayhemMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useMagnetMayhemMultiplayerStore((s) => s.leaveRoom);

  const localPlayerIdentity = useMemo(() => {
    return {
      id: player?.id || 'player-local',
      displayName: player?.displayName || 'Magnet Pilot',
      avatar: player?.avatar || '🧲',
    };
  }, [player]);

  const {
    canvasRef,
    arena,
    localPlayer,
    isGameOver,
    restartGame,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    setTouchAction,
  } = useMagnetMayhemGame({
    isMultiplayer: gameMode === 'online',
    botCount,
    onVictory: () => {
      setShowVictory(true);
    },
  });

  const handleStartSolo = (selectedBotCount: number) => {
    setBotCount(selectedBotCount);
    setGameMode('solo');
    setScreen('playing');
    setShowVictory(false);
    restartGame();
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

  const handleLeave = () => {
    leaveRoom();
    setGameMode('solo');
    setScreen('lobby');
    setShowVictory(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto space-y-4">
      {screen === 'lobby' && (
        <MagnetMayhemLobby
          onStartSolo={handleStartSolo}
          onCreateOnlineRoom={handleCreateRoom}
          onJoinOnlineRoom={handleJoinRoom}
        />
      )}

      {screen === 'room-lobby' && (
        <MagnetMayhemRoomLobby
          onStartGame={() => {
            setScreen('playing');
            setShowVictory(false);
            restartGame();
          }}
          onLeave={handleLeave}
        />
      )}

      {screen === 'playing' && (
        <div className="w-full flex flex-col space-y-3">
          <MagnetMayhemToolbar
            onRestart={() => {
              setShowVictory(false);
              restartGame();
            }}
            onLeave={handleLeave}
            isMultiplayer={gameMode === 'online'}
          />

          <div className="relative w-full h-[540px] sm:h-[620px] rounded-xl overflow-hidden bg-[#060913] border border-[#1e293b]">
            <MagnetMayhemCanvas
              canvasRef={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            />
            <MagnetMayhemHud
              arena={arena}
              localPlayer={localPlayer}
              onTouchAction={setTouchAction}
            />
          </div>

          {(showVictory || isGameOver) && (
            <MagnetMayhemVictoryModal
              players={arena.players}
              localPlayerId={localPlayer?.id ?? null}
              onPlayAgain={() => {
                setShowVictory(false);
                restartGame();
              }}
              onReturnToLobby={handleLeave}
            />
          )}
        </div>
      )}
    </div>
  );
}
