'use client';

import { Check, Copy, LogOut, Magnet, PlayCircle, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { MagnetMayhemVoiceDock } from '@/features/voice/components/MagnetMayhemVoiceDock';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  useMagnetMayhemMultiplayerStore,
} from '@/stores/magnet-mayhem-multiplayer.store';

export interface MagnetMayhemRoomLobbyProps {
  onStartGame: () => void;
  onLeave: () => void;
}

export function MagnetMayhemRoomLobby({ onStartGame, onLeave }: MagnetMayhemRoomLobbyProps) {
  const roomCode = useMagnetMayhemMultiplayerStore((s) => s.roomCode);
  const players = useMagnetMayhemMultiplayerStore((s) => s.players);
  const isHost = useMagnetMayhemMultiplayerStore((s) => s.isHost());
  const addBot = useMagnetMayhemMultiplayerStore((s) => s.addBot);
  const removeBot = useMagnetMayhemMultiplayerStore((s) => s.removeBot);
  const transport = useMagnetMayhemMultiplayerStore((s) => s.transport);

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
      <Card className="border-cyan-500/30 bg-[#090d16] shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Magnet className="w-6 h-6 text-cyan-400" />
              Magnet Mayhem Arena Room
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Physics arena duel ({MIN_PLAYERS}–{MAX_PLAYERS} players). Sling across metallic
              anchors, blast opponents, and claim target orbs!
            </p>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#1e293b] px-3 py-1.5 font-mono text-sm font-bold text-cyan-400 border border-[#334155]">
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
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#111827] rounded-xl border border-[#1e293b]">
            <div className="flex-1 min-w-[240px]">
              {roomCode && (
                <ShareRoomLink
                  gameId="magnet-mayhem"
                  roomCode={roomCode}
                  gameName="Magnet Mayhem"
                />
              )}
            </div>
            {roomCode && <MagnetMayhemVoiceDock roomCode={roomCode} transport={transport} />}
          </div>

          {/* Roster List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Pilots ({players.length} / {MAX_PLAYERS})
              </h3>

              {isHost && players.length < MAX_PLAYERS && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBot}
                  className="text-xs text-cyan-400 border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add AI Pilot
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1e293b]"
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
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
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
          <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
            <Button variant="ghost" onClick={onLeave} className="text-slate-400">
              <LogOut className="w-4 h-4 mr-1.5" />
              Leave Room
            </Button>

            {isHost ? (
              <Button
                disabled={!canStart}
                onClick={onStartGame}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 shadow-lg shadow-cyan-600/20"
              >
                <PlayCircle className="w-5 h-5 mr-1.5" />
                Launch Match
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Waiting for host to launch the match...
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
