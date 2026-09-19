'use client';

import { Check, Copy, LogOut, PlayCircle, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { ReverseRacingVoiceDock } from '@/features/voice/components/ReverseRacingVoiceDock';
import {
  MAX_RACERS,
  MIN_RACERS,
  useReverseRacingMultiplayerStore,
} from '@/stores/reverse-racing-multiplayer.store';
import { buildSabotageChain } from '../engine/chain-manager';

interface ReverseRacingRoomLobbyProps {
  onStartRace: () => void;
  onLeave: () => void;
}

export function ReverseRacingRoomLobby({ onStartRace, onLeave }: ReverseRacingRoomLobbyProps) {
  const roomCode = useReverseRacingMultiplayerStore((s) => s.roomCode);
  const players = useReverseRacingMultiplayerStore((s) => s.players);
  const error = useReverseRacingMultiplayerStore((s) => s.error);
  const isHost = useReverseRacingMultiplayerStore((s) => s.isHost());
  const addBot = useReverseRacingMultiplayerStore((s) => s.addBot);
  const removeBot = useReverseRacingMultiplayerStore((s) => s.removeBot);
  const transport = useReverseRacingMultiplayerStore((s) => s.transport);

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sabotageChain = buildSabotageChain(players);
  const canStart = isHost && players.length >= MIN_RACERS;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header Card */}
      <Card className="border-amber-500/30 bg-deck-900 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-deck-100">
              🏎️ Reverse Racing Grand Prix Room
            </CardTitle>
            <p className="mt-1 text-xs text-deck-400">
              Gather {MIN_RACERS}–{MAX_RACERS} racers. Each driver will sabotage the competitor
              behind them in the circular grid!
            </p>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-deck-800 px-3 py-1.5 font-mono text-sm font-bold text-amber-400 shadow-inner">
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
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Share Room Link */}
          {roomCode && (
            <div className="rounded-lg border border-deck-border/60 bg-deck-850 p-3">
              <ShareRoomLink
                gameId="reverse-racing"
                roomCode={roomCode}
                gameName="Reverse Racing"
              />
            </div>
          )}

          {/* Voice Chat Dock */}
          {roomCode && transport && (
            <div className="rounded-lg border border-deck-border/60 bg-deck-850 p-3">
              <ReverseRacingVoiceDock roomCode={roomCode} transport={transport} />
            </div>
          )}

          {/* Connected Grid / Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-deck-400">
                Starting Grid ({players.length}/{MAX_RACERS})
              </span>
              {isHost && players.length < MAX_RACERS && (
                <Button size="sm" variant="outline" onClick={addBot} className="text-xs">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add AI Bot
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {players.map((p) => {
                const targetId = sabotageChain.get(p.id);
                const target = players.find((pl) => pl.id === targetId);

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-deck-border bg-deck-800/80 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm shadow"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.avatar || '🏎️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-deck-100">
                          <span>{p.name}</span>
                          {p.isBot && (
                            <Badge variant="outline" size="sm">
                              AI
                            </Badge>
                          )}
                        </div>
                        {target && (
                          <div className="text-[10px] text-amber-400/80">
                            Sabotages ➔ {target.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {isHost && p.isBot && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBot(p.id)}
                        aria-label={`Remove ${p.name}`}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <div className="text-center text-xs font-semibold text-rose-400">{error}</div>}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3">
            <Button variant="ghost" onClick={onLeave} className="text-deck-400">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Room
            </Button>

            {isHost ? (
              <Button
                disabled={!canStart}
                onClick={onStartRace}
                className="bg-amber-500 font-bold text-deck-950 hover:bg-amber-400 disabled:opacity-50"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {players.length < MIN_RACERS ? `Need ${MIN_RACERS}+ Racers` : 'Start Grand Prix'}
              </Button>
            ) : (
              <div className="text-xs font-semibold text-amber-400/80">
                Waiting for host to start race...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
