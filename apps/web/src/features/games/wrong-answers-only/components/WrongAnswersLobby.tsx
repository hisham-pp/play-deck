'use client';

import { Bot, Copy, HelpCircle, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { WrongAnswersPlayer } from '../types/wrong-answers.types';

export interface WrongAnswersLobbyProps {
  roomCode: string | null;
  players: WrongAnswersPlayer[];
  localPlayerId: string | null;
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
}

export const WrongAnswersLobby: React.FC<WrongAnswersLobbyProps> = ({
  roomCode,
  players,
  localPlayerId,
  isHost,
  minPlayers,
  maxPlayers,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  const canStart = players.length >= minPlayers && isHost;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              Wrong Answers Only
            </h1>
            <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
              Party Show
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit believable lies, outrageous theories, and vote for the funniest fake answers!
          </p>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showRules ? 'Hide Rules' : 'How to Play'}</span>
        </button>
      </div>

      {/* Rules Accordion */}
      {showRules && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/40 text-xs sm:text-sm text-slate-300 space-y-2 animate-fadeIn">
          <h3 className="font-bold text-amber-300 text-sm">How to Play</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-300/90 text-xs sm:text-sm">
            <li>
              <strong className="text-white">The Question:</strong> A trivia, hypothetical, or
              absurd question appears.
            </li>
            <li>
              <strong className="text-white">Wrong Answers Only:</strong> Write a funny, creative,
              or believable falsehood.
            </li>
            <li>
              <strong className="text-white">Dramatic Read-Aloud:</strong> Read everyone’s fake
              answers aloud (or use automated voice narration).
            </li>
            <li>
              <strong className="text-white">Vote & Score:</strong> Vote for your favorite fake
              answer (+1 pt per vote, +3 pts for crowd favorite, +2 pts streak bonus).
            </li>
          </ul>
        </div>
      )}

      {/* Room Code & Invite Banner */}
      {roomCode && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-amber-800/30 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Room Code:
            </span>
            <span className="font-mono text-xl font-bold tracking-widest text-amber-400 bg-black/40 px-3 py-1 rounded-lg border border-amber-600/30">
              {roomCode}
            </span>
          </div>

          <Button
            onClick={handleCopyLink}
            variant="secondary"
            className="w-full sm:w-auto text-xs flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Link!' : 'Invite Players'}</span>
          </Button>
        </div>
      )}

      {/* Player Roster */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <span>
              Players in Green Room ({players.length}/{maxPlayers})
            </span>
          </span>
          <span className="text-[11px] text-slate-500">Min {minPlayers} required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {players.map((p) => {
            const isLocal = p.id === localPlayerId;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isLocal
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                    : 'bg-[#11192b]/80 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1 rounded-lg bg-black/30 border border-slate-700/50">
                    {p.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{p.displayName}</span>
                      {isLocal && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 border-amber-500/40 text-amber-400"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.isHost && (
                        <Badge variant="warning" className="text-[9px] py-0 px-1">
                          Host
                        </Badge>
                      )}
                      {p.isBot && (
                        <Badge variant="neutral" className="text-[9px] py-0 px-1 bg-slate-800">
                          Bot ({p.botStyle})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isHost && p.isBot && (
                  <button
                    onClick={() => onRemoveBot(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/30"
                    title="Remove Bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Bot Action */}
        {isHost && players.length < maxPlayers && (
          <button
            onClick={onAddBot}
            className="w-full py-2.5 border border-dashed border-amber-700/40 hover:border-amber-500/60 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/10 hover:bg-amber-950/20 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <Bot className="w-4 h-4" />
            <span>Add Comedian Bot</span>
          </button>
        )}
      </div>

      {/* Start Game Action */}
      <div className="pt-3 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          {!canStart && !isHost
            ? 'Waiting for host to kick off the show...'
            : !canStart
              ? `Need at least ${minPlayers} players or bots to begin`
              : 'Everyone ready! Start whenever you are.'}
        </p>

        {isHost ? (
          <Button
            onClick={onStartGame}
            disabled={!canStart}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Game</span>
          </Button>
        ) : (
          <div className="text-xs font-mono text-amber-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Waiting for Host...</span>
          </div>
        )}
      </div>
    </div>
  );
};
