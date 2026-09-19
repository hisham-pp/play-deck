'use client';

import { Check, Copy, Flame, LogOut, PlayCircle, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';

import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { FloorIsLavaVoiceDock } from '@/features/voice/components/FloorIsLavaVoiceDock';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  useFloorIsLavaMultiplayerStore,
} from '@/stores/floor-is-lava-multiplayer.store';

export interface FloorIsLavaRoomLobbyProps {
  onStartGame: () => void;
  onLeave: () => void;
}

export function FloorIsLavaRoomLobby({ onStartGame, onLeave }: FloorIsLavaRoomLobbyProps) {
  const roomCode = useFloorIsLavaMultiplayerStore((s) => s.roomCode);
  const players = useFloorIsLavaMultiplayerStore((s) => s.players);
  const isHost = useFloorIsLavaMultiplayerStore((s) => s.isHost());
  const addBot = useFloorIsLavaMultiplayerStore((s) => s.addBot);
  const removeBot = useFloorIsLavaMultiplayerStore((s) => s.removeBot);
  const transport = useFloorIsLavaMultiplayerStore((s) => s.transport);

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && players.length >= MIN_PLAYERS;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="border-red-500/30 bg-[#1c0a0a] shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#450a0a] pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500" />
              Floor Is Lava Battle Room
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Battle across disappearing tiles ({MIN_PLAYERS}–{MAX_PLAYERS} players). Push rivals
              into the molten depths to survive!
            </p>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#2a1212] px-3 py-1.5 font-mono text-sm font-bold text-amber-400 border border-[#450a0a]">
                {roomCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                aria-label="Copy room code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Share Link & Voice Dock */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#2a1212] rounded-xl border border-[#450a0a]">
            <div className="flex-1 min-w-[240px]">
              {roomCode && (
                <ShareRoomLink
                  gameId="floor-is-lava"
                  roomCode={roomCode}
                  gameName="Floor Is Lava"
                />
              )}
            </div>
            {roomCode && <FloorIsLavaVoiceDock roomCode={roomCode} transport={transport} />}
          </div>

          {/* Roster List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Combatants ({players.length} / {MAX_PLAYERS})
              </h3>

              {isHost && players.length < MAX_PLAYERS && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBot}
                  className="text-xs text-amber-400 border-amber-400/40 hover:bg-amber-400/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add AI Fighter
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#2a1212] border border-[#450a0a]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/50"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-base">{p.avatar}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        {p.name}
                        {p.isHost && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            Host
                          </span>
                        )}
                        {p.isBot && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Bot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isHost && p.isBot && (
                    <button
                      onClick={() => removeBot(p.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove Bot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#450a0a]">
            <Button variant="ghost" onClick={onLeave} className="text-slate-400">
              <LogOut className="w-4 h-4 mr-1.5" />
              Leave Room
            </Button>

            {isHost ? (
              <Button
                disabled={!canStart}
                onClick={onStartGame}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 shadow-lg shadow-red-600/20"
              >
                <PlayCircle className="w-5 h-5 mr-1.5" />
                Start Battle
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Waiting for host to start the battle...
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
