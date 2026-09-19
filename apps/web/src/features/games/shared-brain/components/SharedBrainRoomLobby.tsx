'use client';

import { Check, Copy, LogOut, PlayCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { SharedBrainVoiceDock } from '@/features/voice/components/SharedBrainVoiceDock';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  useSharedBrainMultiplayerStore,
} from '@/stores/shared-brain-multiplayer.store';
import { COURSES_CATALOG } from '../engine/course-catalog';

interface SharedBrainRoomLobbyProps {
  onStartCourse: () => void;
  onLeave: () => void;
}

export function SharedBrainRoomLobby({ onStartCourse, onLeave }: SharedBrainRoomLobbyProps) {
  const roomCode = useSharedBrainMultiplayerStore((s) => s.roomCode);
  const players = useSharedBrainMultiplayerStore((s) => s.players);
  const pairs = useSharedBrainMultiplayerStore((s) => s.pairs);
  const selectedCourseId = useSharedBrainMultiplayerStore((s) => s.selectedCourseId);
  const selectCourse = useSharedBrainMultiplayerStore((s) => s.selectCourse);
  const swapRole = useSharedBrainMultiplayerStore((s) => s.swapRole);
  const error = useSharedBrainMultiplayerStore((s) => s.error);
  const isHost = useSharedBrainMultiplayerStore((s) => s.isHost());
  const addBot = useSharedBrainMultiplayerStore((s) => s.addBot);
  const removeBot = useSharedBrainMultiplayerStore((s) => s.removeBot);
  const transport = useSharedBrainMultiplayerStore((s) => s.transport);

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
      <Card className="border-sky-500/30 bg-deck-900 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-deck-100">
              🧠 Shared Brain Team Room
            </CardTitle>
            <p className="mt-1 text-xs text-deck-400">
              Cooperate in pairs ({MIN_PLAYERS}–{MAX_PLAYERS} players). Each team controls one
              dual-hemisphere brain!
            </p>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-deck-800 px-3 py-1.5 font-mono text-sm font-bold text-sky-400 shadow-inner">
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
              <ShareRoomLink gameId="shared-brain" roomCode={roomCode} gameName="Shared Brain" />
            </div>
          )}

          {/* WebRTC Voice Chat */}
          {roomCode && transport && (
            <div className="rounded-lg border border-deck-border/60 bg-deck-850 p-3">
              <SharedBrainVoiceDock roomCode={roomCode} transport={transport} />
            </div>
          )}

          {/* Course Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-deck-400">
              Select Course Level
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {COURSES_CATALOG.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => selectCourse(c.id)}
                  className={`rounded-lg border p-2.5 text-left transition ${
                    selectedCourseId === c.id
                      ? 'border-sky-500 bg-sky-500/10 text-deck-100'
                      : 'border-deck-border bg-deck-800/60 text-deck-400 hover:bg-deck-800'
                  }`}
                >
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="mt-1 text-[10px] text-deck-400">{c.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Teams & Pairs Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-deck-400">
                Active Teams & Pairs ({players.length}/{MAX_PLAYERS})
              </span>
              {isHost && players.length < MAX_PLAYERS && (
                <Button size="sm" variant="outline" onClick={addBot} className="text-xs">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add AI Bot
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {pairs.map((pair) => (
                <div
                  key={pair.pairId}
                  className="rounded-lg border border-deck-border bg-deck-800/80 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-deck-300">
                      {pair.pairId.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: pair.colorA }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: pair.colorB }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {/* Navigator Hemisphere */}
                    <div className="flex items-center justify-between rounded-md border border-sky-500/20 bg-deck-900/60 p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pair.navigatorAvatar}</span>
                        <div>
                          <div className="font-bold text-deck-100">{pair.navigatorName}</div>
                          <div className="text-[10px] text-sky-400">🧭 Navigator (Left/Right)</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => swapRole(pair.navigatorId)}
                          title="Swap Role"
                          className="h-7 w-7 p-0"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-deck-400" />
                        </Button>
                        {isHost && pair.isBotA && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBot(pair.navigatorId)}
                            className="h-7 w-7 p-0 text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Motor Hemisphere */}
                    <div className="flex items-center justify-between rounded-md border border-amber-500/20 bg-deck-900/60 p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pair.motorAvatar}</span>
                        <div>
                          <div className="font-bold text-deck-100">{pair.motorName}</div>
                          <div className="text-[10px] text-amber-400">🕹️ Motor (Jump/Levers)</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => swapRole(pair.motorId)}
                          title="Swap Role"
                          className="h-7 w-7 p-0"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-deck-400" />
                        </Button>
                        {isHost && pair.isBotB && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBot(pair.motorId)}
                            className="h-7 w-7 p-0 text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {players.length % 2 !== 0 && (
                <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-center text-xs text-amber-400">
                  Waiting for 1 more player (or add an AI Bot) to complete the team pair!
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-center text-xs font-semibold text-rose-400">{error}</div>}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3">
            <Button variant="ghost" onClick={onLeave} className="text-deck-400">
              <LogOut className="mr-2 h-4 w-4" /> Leave Room
            </Button>

            {isHost ? (
              <Button
                disabled={!canStart}
                onClick={onStartCourse}
                className="bg-sky-500 font-bold text-deck-950 hover:bg-sky-400 disabled:opacity-50"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {players.length < MIN_PLAYERS ? `Need ${MIN_PLAYERS}+ Players` : 'Launch Course'}
              </Button>
            ) : (
              <div className="text-xs font-semibold text-sky-400/80">
                Waiting for host to launch course...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
