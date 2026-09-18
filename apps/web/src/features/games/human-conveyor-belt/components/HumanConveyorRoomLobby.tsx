'use client';

import { Bot, Check, Copy, LogOut, Play, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { HumanConveyorVoiceDock } from '@/features/voice/components/HumanConveyorVoiceDock';
import {
  useHumanConveyorMultiplayerStore,
  type ConveyorPlayerSeat,
} from '@/stores/human-conveyor-multiplayer.store';
import { CONVEYOR_LAYOUTS } from '../engine/conveyor-layouts';

const GAME_ID = 'human-conveyor-belt';
const GAME_NAME = 'Human Conveyor Belt';

interface HumanConveyorRoomLobbyProps {
  onStartGame: (seats: ConveyorPlayerSeat[], layoutId: string) => void;
  onLeave: () => void;
}

export function HumanConveyorRoomLobby({ onStartGame, onLeave }: HumanConveyorRoomLobbyProps) {
  const {
    roomCode,
    isHost,
    seats,
    selectedLayoutId,
    toggleBot,
    setLayout,
    setReady,
    startGame,
    leaveRoom,
  } = useHumanConveyorMultiplayerStore();

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const handleStart = () => {
    if (!isHost) return;
    startGame();
    onStartGame(seats, selectedLayoutId);
  };

  const selectedLayout =
    CONVEYOR_LAYOUTS.find((l) => l.id === selectedLayoutId) ?? CONVEYOR_LAYOUTS[0];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Header card with room code & share links */}
      <Card className="bg-[#0b101d] border-[#1e293b]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <span>{GAME_NAME} Lobby</span>
              <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                Co-op Physics
              </Badge>
            </CardTitle>
            <p className="text-xs text-deck-400 mt-1">
              Position your platforms and coordinate via voice to move objects through the machine!
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            className="gap-1.5 text-deck-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-[#1e293b]">
          {/* Room Code Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-deck-400 uppercase tracking-wider">
              Room Code:
            </span>
            <div className="flex items-center gap-1.5 bg-[#111a2e] px-3 py-1 rounded-lg border border-[#1e2a44]">
              <span className="font-mono text-lg font-black text-amber-400 tracking-widest">
                {roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-deck-400 hover:text-white p-1 transition-colors"
                title="Copy Room Code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Share room link */}
          {roomCode && (
            <ShareRoomLink
              roomCode={roomCode}
              gameId={GAME_ID}
              gameName={GAME_NAME}
              className="w-full sm:w-auto"
            />
          )}
        </CardContent>
      </Card>

      {/* Voice Chat Dock */}
      <HumanConveyorVoiceDock />

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Machine Layout Selection (Host Controlled) */}
        <Card className="bg-[#0b101d] border-[#1e293b] md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-deck-200 uppercase tracking-wider">
              Machine Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {CONVEYOR_LAYOUTS.map((cfg) => (
              <button
                key={cfg.id}
                type="button"
                disabled={!isHost}
                onClick={() => setLayout(cfg.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedLayoutId === cfg.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg'
                    : 'bg-[#111a2e] border-[#1e2a44] text-deck-300 hover:border-deck-600'
                } ${!isHost ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{cfg.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {cfg.targetDeliveries} items
                  </Badge>
                </div>
                <p className="text-[11px] text-deck-400 line-clamp-2">{cfg.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 6-Player Platform Roster */}
        <Card className="bg-[#0b101d] border-[#1e293b] md:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-deck-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-deck-400" />
              <span>Living Platform Segments (2–6 Players)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seats.map((seat) => (
              <div
                key={seat.seatIndex}
                className="p-3 rounded-xl bg-[#111a2e] border border-[#1e2a44] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-inner"
                    style={{ backgroundColor: seat.color }}
                  >
                    {seat.glyph}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {seat.playerId ? (
                        <>
                          <User className="w-3.5 h-3.5 text-deck-400" />
                          <span>{seat.displayName || 'Connected Player'}</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-amber-400" />
                          <span>AI Assistant</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-deck-400 font-mono">
                      Segment {seat.seatIndex + 1}
                    </span>
                  </div>
                </div>

                {isHost && seat.seatIndex > 0 && !seat.playerId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBot(seat.seatIndex)}
                    className="text-xs px-2 py-1 h-7 text-deck-300 border-[#232f45]"
                  >
                    {seat.isBot ? 'Bot Enabled' : 'Seat Empty'}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Start / Ready Bar */}
      <div className="flex items-center justify-between bg-[#0b101d] p-4 rounded-xl border border-[#1e293b]">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-deck-300">
            Selected Layout: <strong className="text-white">{selectedLayout.name}</strong>
          </span>
          <span className="text-[11px] text-deck-400">
            Target quota: {selectedLayout.targetDeliveries} items • Time limit:{' '}
            {selectedLayout.timeLimit}s
          </span>
        </div>

        {isHost ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            className="gap-2 px-6 font-bold shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Conveyor Machine</span>
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setReady(true)}
            className="gap-2 px-6 font-bold"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Ready to Deliver</span>
          </Button>
        )}
      </div>
    </div>
  );
}
