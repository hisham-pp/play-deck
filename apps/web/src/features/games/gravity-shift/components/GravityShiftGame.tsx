'use client';

import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useGravityShiftMultiplayerStore } from '@/stores/gravity-shift-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { getCourseById } from '../engine/course-catalog';
import { useGravityShiftGame } from '../hooks/use-gravity-shift-game';
import type { GravityShiftPlayer } from '../types/gravity-shift.types';
import { GravityShiftCanvas } from './GravityShiftCanvas';
import { GravityShiftHud } from './GravityShiftHud';
import { GravityShiftLobby } from './GravityShiftLobby';
import { GravityShiftRoomLobby } from './GravityShiftRoomLobby';
import { GravityShiftToolbar } from './GravityShiftToolbar';
import { GravityShiftVictoryModal } from './GravityShiftVictoryModal';

type GameScreen = 'lobby' | 'room-lobby' | 'playing';

export function GravityShiftGame() {
  const searchParams = useSearchParams();
  const roomCodeQuery = searchParams.get('room');

  const [screen, setScreen] = useState<GameScreen>(roomCodeQuery ? 'room-lobby' : 'lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'online'>(roomCodeQuery ? 'online' : 'solo');
  const [showVictory, setShowVictory] = useState(false);
  const [_winner, setWinner] = useState<GravityShiftPlayer | null>(null);

  const player = usePlayerStore((s) => s.player);

  const selectedCourseId = useGravityShiftMultiplayerStore((s) => s.selectedCourseId);
  const selectCourse = useGravityShiftMultiplayerStore((s) => s.selectCourse);
  const createRoom = useGravityShiftMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useGravityShiftMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useGravityShiftMultiplayerStore((s) => s.leaveRoom);

  const localPlayerIdentity = useMemo(() => {
    return {
      id: player?.id || 'player-local',
      displayName: player?.displayName || 'Cosmic Runner',
      avatar: player?.avatar || '⚡',
    };
  }, [player]);

  const course = getCourseById(selectedCourseId);

  const {
    canvasRef,
    players,
    localPlayer,
    currentGravity,
    elapsedTimeMs,
    triggerGravityShift,
    restartGame,
  } = useGravityShiftGame({
    courseId: selectedCourseId,
    isMultiplayer: gameMode === 'online',
    onVictory: (wonPlayer) => {
      setWinner(wonPlayer);
      setShowVictory(true);
    },
  });

  const handleStartSolo = (_botCount: number) => {
    // Single player setup
    setGameMode('solo');
    setScreen('playing');
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

  const totalCheckpoints = course.elements.filter((e) => e.type === 'checkpoint').length;

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto space-y-4">
      {screen === 'lobby' && (
        <GravityShiftLobby
          selectedCourseId={selectedCourseId}
          onSelectCourse={selectCourse}
          onStartSolo={handleStartSolo}
          onCreateOnlineRoom={handleCreateRoom}
          onJoinOnlineRoom={handleJoinRoom}
        />
      )}

      {screen === 'room-lobby' && (
        <GravityShiftRoomLobby
          onStartRace={() => {
            setScreen('playing');
            restartGame();
          }}
          onLeave={handleLeave}
        />
      )}

      {screen === 'playing' && (
        <div className="w-full flex flex-col space-y-3">
          <GravityShiftToolbar
            selectedCourseId={selectedCourseId}
            onSelectCourse={selectCourse}
            onRestart={restartGame}
            onLeave={handleLeave}
            isMultiplayer={gameMode === 'online'}
          />

          <div className="relative w-full h-[620px] rounded-xl overflow-hidden">
            <GravityShiftCanvas canvasRef={canvasRef} />
            <GravityShiftHud
              currentGravity={currentGravity}
              localPlayer={localPlayer}
              players={players}
              elapsedTimeMs={elapsedTimeMs}
              totalCheckpoints={totalCheckpoints}
              onShift={triggerGravityShift}
            />
          </div>

          {showVictory && (
            <GravityShiftVictoryModal
              players={players}
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
