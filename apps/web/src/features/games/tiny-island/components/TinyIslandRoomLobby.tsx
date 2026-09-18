'use client';

import { Bot, Check, Copy, LogOut, Play, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { TinyIslandVoiceDock } from '@/features/voice/components/TinyIslandVoiceDock';
import {
  useTinyIslandMultiplayerStore,
  type IslandPlayerSeat,
} from '@/stores/tiny-island-multiplayer.store';

const GAME_ID = 'tiny-island';
const GAME_NAME = 'Tiny Island';

interface TinyIslandRoomLobbyProps {
  onStartGame: (seats: IslandPlayerSeat[]) => void;
  onLeave: () => void;
}

export function TinyIslandRoomLobby({ onStartGame, onLeave }: TinyIslandRoomLobbyProps) {
  const { roomCode, isHost, seats, toggleBot, startGame, leaveRoom } =
    useTinyIslandMultiplayerStore();

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
    onStartGame(seats);
  };

  const filledSeats = seats.filter((s) => s.playerId !== null || s.isBot);
  const canStart = isHost && filledSeats.length >= 2;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Header Card with Room Code & Share link */}
      <Card className="bg-[#0b101d] border-[#1e293b]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <span>{GAME_NAME} Survival Lobby</span>
              <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                2–6 Players
              </Badge>
            </CardTitle>
            <p className="text-xs text-deck-400 mt-1">
              Strategize, form alliances, or plot betrayals before the island begins to submerge!
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
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Direct Share Link Component */}
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

      {/* Voice Chat Dock Integration */}
      <TinyIslandVoiceDock />

      {/* 6-Seat Roster Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-deck-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Expedition Roster ({filledSeats.length}/6)</span>
          </h3>
          <span className="text-xs text-deck-400">Min 2 players/bots to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {seats.map((seat) => {
            const isAssigned = seat.playerId !== null;
            const isBot = seat.isBot && !isAssigned;

            return (
              <div
                key={seat.seatIndex}
                className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  isAssigned
                    ? 'border-amber-500/40 bg-surface-raised shadow-md'
                    : isBot
                      ? 'border-[#1e293b] bg-surface-raised/70'
                      : 'border-dashed border-[#232f45] bg-[#090d16]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/10"
                      style={{ backgroundColor: seat.color }}
                    >
                      {isAssigned ? seat.avatar : isBot ? '🤖' : '➕'}
                    </div>

                    <div>
                      <div className="font-semibold text-sm text-deck-100 flex items-center gap-1.5">
                        <span>
                          {isAssigned
                            ? seat.displayName
                            : isBot
                              ? `Bot: ${seat.displayName}`
                              : `Seat ${seat.seatIndex + 1}`}
                        </span>
                        {seat.isHost && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                            HOST
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-deck-400 mt-0.5">
                        {isAssigned ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Player Ready
                          </span>
                        ) : isBot ? (
                          <span className="text-deck-500 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> AI Survivor
                          </span>
                        ) : (
                          <span className="text-deck-600">Open Slot</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Host controls to toggle Bot vs Open */}
                  {isHost && !seat.isHost && !isAssigned && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBot(seat.seatIndex)}
                      className="text-xs text-deck-400 hover:text-deck-100 px-2 h-7"
                    >
                      {isBot ? 'Remove' : '+ Add Bot'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Launch Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-border">
        <div className="text-xs text-deck-400">
          {!canStart ? (
            <span>Waiting for at least 2 expedition members...</span>
          ) : isHost ? (
            <span className="text-emerald-400">Ready to embark!</span>
          ) : (
            <span>Waiting for host to start the match...</span>
          )}
        </div>

        {isHost && (
          <Button
            variant="primary"
            size="lg"
            disabled={!canStart}
            onClick={handleStart}
            className="gap-2 px-8 font-bold tracking-wide"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Expedition</span>
          </Button>
        )}
      </div>
    </div>
  );
}
