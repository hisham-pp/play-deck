'use client';

import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useFloorIsLavaMultiplayerStore } from '@/stores/floor-is-lava-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

import { useFloorIsLavaGame } from '../hooks/use-floor-is-lava-game';
import { FloorIsLavaCanvas } from './FloorIsLavaCanvas';
import { FloorIsLavaHud } from './FloorIsLavaHud';
import { FloorIsLavaLobby } from './FloorIsLavaLobby';
import { FloorIsLavaRoomLobby } from './FloorIsLavaRoomLobby';
import { FloorIsLavaToolbar } from './FloorIsLavaToolbar';
import { FloorIsLavaVictoryModal } from './FloorIsLavaVictoryModal';

type GameScreen = 'lobby' | 'room-lobby' | 'playing';

export function FloorIsLavaGame() {
  const searchParams = useSearchParams();
  const roomCodeQuery = searchParams.get('room');

  const [screen, setScreen] = useState<GameScreen>(roomCodeQuery ? 'room-lobby' : 'lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'online'>(roomCodeQuery ? 'online' : 'solo');
  const [botCount, setBotCount] = useState(3);
  const [showVictory, setShowVictory] = useState(false);

  const player = usePlayerStore((s) => s.player);

  const createRoom = useFloorIsLavaMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useFloorIsLavaMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useFloorIsLavaMultiplayerStore((s) => s.leaveRoom);

  const localPlayerIdentity = useMemo(() => {
    return {
      id: player?.id || 'player-local',
      displayName: player?.displayName || 'Magma Survivor',
      avatar: player?.avatar || '🔥',
    };
  }, [player]);

  const { canvasRef, arena, localPlayer, elapsedSec, triggerPush, restartGame } =
    useFloorIsLavaGame({
      isMultiplayer: gameMode === 'online',
      botCount,
      onVictory: (_winner, _survivalSec) => {
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
        <FloorIsLavaLobby
          onStartSolo={handleStartSolo}
          onCreateOnlineRoom={handleCreateRoom}
          onJoinOnlineRoom={handleJoinRoom}
        />
      )}

      {screen === 'room-lobby' && (
        <FloorIsLavaRoomLobby
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
          <FloorIsLavaToolbar
            onRestart={() => {
              setShowVictory(false);
              restartGame();
            }}
            onLeave={handleLeave}
            isMultiplayer={gameMode === 'online'}
          />

          <div className="relative w-full h-[620px] rounded-xl overflow-hidden bg-[#0d0303] border border-[#450a0a]">
            <FloorIsLavaCanvas canvasRef={canvasRef} />
            <FloorIsLavaHud
              arena={arena}
              localPlayer={localPlayer}
              elapsedSec={elapsedSec}
              onPush={triggerPush}
            />
          </div>

          {showVictory && (
            <FloorIsLavaVictoryModal
              players={arena.players}
              localPlayerId={localPlayer?.id ?? null}
              survivalTimeMs={elapsedSec * 1000}
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
