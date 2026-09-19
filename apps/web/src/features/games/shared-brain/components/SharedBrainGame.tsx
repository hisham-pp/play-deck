'use client';

import React, { useMemo, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { useSharedBrainMultiplayerStore } from '@/stores/shared-brain-multiplayer.store';
import { COURSES_CATALOG } from '../engine/course-catalog';
import { useSharedBrainGame } from '../hooks/use-shared-brain-game';
import { SharedBrainCanvas } from './SharedBrainCanvas';
import { SharedBrainHud } from './SharedBrainHud';
import type { SoloPlayMode } from './SharedBrainLobby';
import { SharedBrainLobby } from './SharedBrainLobby';
import { SharedBrainRoomLobby } from './SharedBrainRoomLobby';
import { SharedBrainToolbar } from './SharedBrainToolbar';
import { SharedBrainVictoryModal } from './SharedBrainVictoryModal';

type GameScreen = 'lobby' | 'room-lobby' | 'playing';

export function SharedBrainGame() {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [gameMode, setGameMode] = useState<'solo' | 'online'>('solo');
  const [soloPlayMode, setSoloPlayMode] = useState<SoloPlayMode>('both');

  const player = usePlayerStore((s) => s.player);

  // Multiplayer store
  const createRoom = useSharedBrainMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useSharedBrainMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useSharedBrainMultiplayerStore((s) => s.leaveRoom);

  // Local Player Identity
  const localPlayerIdentity = useMemo(() => {
    const displayName = player?.displayName || 'Synaptic Pilot';
    return {
      id: player?.id || 'player-local',
      displayName,
      avatar: player?.avatar || '🧠',
    };
  }, [player]);

  const handleStartSolo = (mode: SoloPlayMode) => {
    setSoloPlayMode(mode);
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

  const handleStartOnlineCourse = () => {
    setScreen('playing');
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setScreen('lobby');
  };

  // Game Engine Hook
  const {
    course,
    courseIndex,
    setCourseIndex,
    runStatus,
    elapsedTime,
    deathCount,
    victoryStats,
    localPairs,
    localPair,
    localRole,
    collectedTokenIds,
    activeSwitchIds,
    doorStates,
    startRun,
    resetCourse,
  } = useSharedBrainGame({
    isMultiplayer: gameMode === 'online',
    localSoloMode: soloPlayMode,
  });

  const totalTokens = course.elements.filter((e) => e.type === 'token').length;
  const hasNextCourse = courseIndex < COURSES_CATALOG.length - 1;

  const handleNextCourse = () => {
    if (hasNextCourse) {
      setCourseIndex(courseIndex + 1);
      resetCourse();
      startRun();
    }
  };

  return (
    <div className="w-full space-y-4 py-4">
      {screen === 'lobby' && (
        <SharedBrainLobby
          onStartSolo={handleStartSolo}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {screen === 'room-lobby' && (
        <SharedBrainRoomLobby onStartCourse={handleStartOnlineCourse} onLeave={handleLeaveRoom} />
      )}

      {screen === 'playing' && (
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {/* Top HUD */}
          {localPair && (
            <SharedBrainHud
              course={course}
              pair={localPair}
              role={localRole}
              elapsedTime={elapsedTime}
              deathCount={deathCount}
              collectedTokensCount={collectedTokenIds.size}
              totalTokensCount={totalTokens}
            />
          )}

          {/* Interactive Dual-Avatar Canvas */}
          <div className="relative">
            <SharedBrainCanvas
              course={course}
              pairs={localPairs}
              focusedPairId={localPair?.pairId || null}
              collectedTokenIds={collectedTokenIds}
              activeSwitchIds={activeSwitchIds}
              doorStates={doorStates}
            />

            {/* Waiting to Start Overlay */}
            {runStatus === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-deck-950/75 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-black tracking-widest text-sky-400 sm:text-4xl">
                    READY TO SYNC
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-deck-200">
                    Press &quot;Start Run&quot; below to initialize neural link
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <SharedBrainToolbar
            runStatus={runStatus}
            onStart={startRun}
            onReset={resetCourse}
            onLeaveOrLobby={() => {
              resetCourse();
              if (gameMode === 'online') {
                setScreen('room-lobby');
              } else {
                setScreen('lobby');
              }
            }}
          />

          {/* Victory Modal */}
          <SharedBrainVictoryModal
            isOpen={runStatus === 'completed'}
            timeSeconds={victoryStats?.time ?? elapsedTime}
            tokensCollected={victoryStats?.tokens ?? collectedTokenIds.size}
            totalTokens={totalTokens}
            hasNextCourse={hasNextCourse}
            onNextCourse={handleNextCourse}
            onReplay={() => {
              resetCourse();
              startRun();
            }}
            onLobby={() => {
              resetCourse();
              if (gameMode === 'online') {
                setScreen('room-lobby');
              } else {
                setScreen('lobby');
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
