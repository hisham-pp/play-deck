'use client';

import { UserPlus, Bot, Play, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { LudoVoiceDock } from '@/features/voice/components/LudoVoiceDock';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { LudoPlayer } from '../types/ludo.types';

const VARIANT_OUTLINE = 'outline';

interface LudoRoomLobbyProps {
  onStartGame: (players: LudoPlayer[]) => void;
}

export function LudoRoomLobby({ onStartGame }: LudoRoomLobbyProps) {
  const { roomCode, hostId, players, addBot, fillRemainingWithBots, leaveRoom } =
    useLudoMultiplayerStore();
  const player = usePlayerStore((s) => s.player);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = player?.id === hostId || !hostId;
  const canStart = players.length >= 2;

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-amber-500/20 bg-slate-900/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              🎲 Ludo Online Room
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Share room code or invite friends (2–6 players)
            </p>
          </div>
          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm px-3 py-1 bg-slate-800 rounded text-amber-400 font-bold">
                {roomCode}
              </span>
              <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 border border-slate-700">
                    {p.type === 'bot' ? '🤖' : '👤'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Seat {idx + 1}: {p.displayName}
                    </div>
                    <div className="text-xs text-slate-400 uppercase">Color: {p.color}</div>
                  </div>
                </div>
                <Badge variant={p.type === 'bot' ? 'outline' : 'default'}>
                  {p.type === 'bot' ? 'Bot' : 'Ready'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={leaveRoom}
              className="text-slate-400 hover:text-slate-200"
            >
              <LogOut className="w-4 h-4 mr-2" /> Leave
            </Button>

            {isHost && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={VARIANT_OUTLINE}
                  onClick={() => setShowInviteModal(true)}
                  className="border-slate-700"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" /> Invite
                </Button>
                <Button
                  size="sm"
                  variant={VARIANT_OUTLINE}
                  onClick={addBot}
                  className="border-slate-700"
                >
                  <Bot className="w-4 h-4 mr-1.5" /> + Bot
                </Button>
                <Button
                  size="sm"
                  variant={VARIANT_OUTLINE}
                  onClick={() => fillRemainingWithBots(4)}
                  className="border-slate-700"
                >
                  Fill 4
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStartGame(players)}
                  disabled={!canStart}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  <Play className="w-4 h-4 mr-1.5" /> Start
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warm up voice while seats fill, so the mesh is live before the first roll. */}
      <LudoVoiceDock anchorClassName="bottom-4 right-4" />

      {showInviteModal && roomCode && (
        <InviteToRoomModal
          isOpen={showInviteModal}
          roomCode={roomCode}
          gameId="ludo"
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
