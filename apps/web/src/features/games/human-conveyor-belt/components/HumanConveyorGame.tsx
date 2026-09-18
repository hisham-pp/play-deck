'use client';

import { ArrowLeft, Bot, Globe, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { HumanConveyorVoiceDock } from '@/features/voice/components/HumanConveyorVoiceDock';
import { useHumanConveyorMultiplayerStore } from '@/stores/human-conveyor-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { CONVEYOR_LAYOUTS } from '../engine/conveyor-layouts';
import { useConveyorEngine } from '../hooks/use-conveyor-engine';
import { useConveyorMultiplayer } from '../hooks/use-conveyor-multiplayer';
import { HumanConveyorCanvas } from './HumanConveyorCanvas';
import { HumanConveyorControls } from './HumanConveyorControls';
import { HumanConveyorHUD } from './HumanConveyorHUD';
import { HumanConveyorRoomLobby } from './HumanConveyorRoomLobby';

type ScreenState = 'menu' | 'lobby' | 'playing';

export function HumanConveyorGame() {
  const { player } = usePlayerStore();
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [activeLayoutId, setActiveLayoutId] = useState(CONVEYOR_LAYOUTS[0].id);

  const { roomCode, localSeatIndex, createRoom, joinRoomByCode, leaveRoom, error } =
    useHumanConveyorMultiplayerStore();

  const { gameState, startMatch, adjustSegment, applyRemoteSegmentUpdate } = useConveyorEngine({
    layoutId: activeLayoutId,
    onPlatformUpdate: (seatIndex, angle, elevation, speed) => {
      broadcastPlatformUpdate(seatIndex, angle, elevation, speed);
    },
  });

  const { broadcastPlatformUpdate } = useConveyorMultiplayer({
    onRemotePlatformUpdate: (seatIndex, angle, elevation, speed) => {
      applyRemoteSegmentUpdate(seatIndex, angle, elevation, speed);
    },
    onRemoteStartGame: (layoutId) => {
      setActiveLayoutId(layoutId);
      startMatch(layoutId);
      setScreen('playing');
    },
  });

  const handleStartSolo = () => {
    setActiveLayoutId(CONVEYOR_LAYOUTS[0].id);
    startMatch(CONVEYOR_LAYOUTS[0].id);
    setScreen('playing');
  };

  const handleCreateOnlineRoom = async () => {
    if (!player) return;
    await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
    });
    setScreen('lobby');
  };

  const handleJoinOnlineRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !joinCodeInput) return;
    const ok = await joinRoomByCode(joinCodeInput, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
    });
    if (ok) setScreen('lobby');
  };

  const handleLobbyStartGame = (_seats: unknown, layoutId: string) => {
    setActiveLayoutId(layoutId);
    startMatch(layoutId);
    setScreen('playing');
  };

  // If in a room and on lobby screen
  if (roomCode && screen === 'lobby') {
    return (
      <HumanConveyorRoomLobby
        onStartGame={handleLobbyStartGame}
        onLeave={() => setScreen('menu')}
      />
    );
  }

  // Active game stage
  if (screen === 'playing') {
    const isOver = gameState.phase === 'wave_cleared' || gameState.phase === 'failed';
    const isVictory = gameState.phase === 'wave_cleared';

    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 py-3">
        {/* Top Header bar with Quit button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              leaveRoom();
              setScreen('menu');
            }}
            className="gap-1.5 text-deck-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Machine</span>
          </Button>

          {roomCode && <HumanConveyorVoiceDock />}
        </div>

        {/* HUD */}
        <HumanConveyorHUD gameState={gameState} localSeatIndex={localSeatIndex ?? 0} />

        {/* Canvas & Overlay */}
        <div className="relative w-full">
          <HumanConveyorCanvas gameState={gameState} localSeatIndex={localSeatIndex ?? 0} />

          {/* Game Over / Victory Modal Overlay */}
          {isOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  isVictory
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {isVictory ? <Sparkles className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                {isVictory ? 'WAVE DELIVERED!' : 'CONVEYOR OVERLOAD'}
              </h2>
              <p className="text-sm text-deck-300 max-w-md mb-6">
                {isVictory
                  ? `Outstanding coordination! All ${gameState.deliveredCount} objects delivered safely to the target hopper.`
                  : 'Time expired or too many objects were lost. Re-align platforms and try again!'}
              </p>

              <div className="flex items-center gap-6 mb-8 bg-[#111a2e] px-6 py-3 rounded-xl border border-[#1e2a44]">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-deck-400">Total Score</span>
                  <span className="text-xl font-black text-white font-mono">{gameState.score}</span>
                </div>
                <div className="w-px h-8 bg-deck-700" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-deck-400">Deliveries</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {gameState.deliveredCount}
                  </span>
                </div>
                <div className="w-px h-8 bg-deck-700" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-deck-400">
                    Shattered/Dropped
                  </span>
                  <span className="text-xl font-black text-red-400 font-mono">
                    {gameState.brokenCount + gameState.droppedCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startMatch(activeLayoutId)}
                  className="gap-2 px-6"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    leaveRoom();
                    setScreen('menu');
                  }}
                >
                  Return to Menu
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <HumanConveyorControls
          onAdjust={(delta) => adjustSegment(localSeatIndex ?? 0, delta)}
          disabled={isOver}
        />
      </div>
    );
  }

  // Main Mode Select Menu
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6">
      {/* Title Hero */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Cooperative Physics Machine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Human Conveyor Belt
        </h1>
        <p className="text-deck-400 text-sm max-w-lg">
          You and your friends ARE the machine parts. Tilt, elevate, and drive your conveyor
          segments to move delicate cargo across the factory floor.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Solo + AI Assistants */}
        <Card className="bg-[#0b101d] border-[#1e293b] hover:border-amber-500/40 transition-all">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Solo & AI Helpers</h3>
              <p className="text-xs text-deck-400">
                Control the primary segment while intelligent AI platform assistants help keep cargo
                on track.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartSolo}
              className="w-full mt-2 font-bold"
            >
              Start Solo Run
            </Button>
          </CardContent>
        </Card>

        {/* Online Room Multiplayer */}
        <Card className="bg-[#0b101d] border-[#1e293b] hover:border-blue-500/40 transition-all">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Online Co-op Room</h3>
              <p className="text-xs text-deck-400">
                Host a room for 2–6 players with real-time WebRTC voice chat and shareable join
                links.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 mt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleCreateOnlineRoom}
                className="w-full font-bold gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Create 6-Player Room</span>
              </Button>

              <form onSubmit={handleJoinOnlineRoom} className="flex gap-2 w-full mt-1">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="flex-1 bg-[#111a2e] border border-[#1e2a44] rounded-lg px-3 text-sm text-center font-mono tracking-widest text-white placeholder:text-deck-500 focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={joinCodeInput.length !== 6}
                >
                  Join
                </Button>
              </form>

              {error && <span className="text-xs text-red-400 font-semibold">{error}</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
