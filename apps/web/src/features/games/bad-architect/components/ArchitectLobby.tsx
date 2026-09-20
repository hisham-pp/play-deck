'use client';

import { Bot, Compass, Copy, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { ArchitectDifficulty, ArchitectPlayer } from '../types/bad-architect.types';

export interface ArchitectLobbyProps {
  roomCode: string;
  players: ArchitectPlayer[];
  isHost: boolean;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: (difficulty: ArchitectDifficulty, maxRounds: number, buildDuration: number) => void;
}

export const ArchitectLobby: React.FC<ArchitectLobbyProps> = ({
  roomCode,
  players,
  isHost,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [difficulty, setDifficulty] = useState<ArchitectDifficulty>('medium');
  const [maxRounds, setMaxRounds] = useState<number>(3);
  const [buildDuration, setBuildDuration] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);

  const canStart = players.length >= 2;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/play/bad-architect?join=${roomCode}`;
      void navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1222]/95 backdrop-blur border border-sky-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-900/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-sky-400">
              Bad Architect
            </h2>
            <Badge variant="outline" className="border-sky-500/40 text-sky-300">
              Voice Construction Party
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            One Architect describes a secret blueprint with words alone. Builders place blocks
            blindly on an 8×8 grid!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#172033] px-3 py-1.5 rounded-lg border border-sky-500/30">
          <span className="text-xs text-slate-400 font-mono">ROOM:</span>
          <span className="text-lg font-bold tracking-widest text-sky-400 font-mono">
            {roomCode}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="text-slate-300 hover:text-sky-300 ml-1 p-1 h-auto"
            title="Copy invite link"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {copied && <span className="text-xs text-emerald-400">Copied!</span>}
        </div>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Rules & Match Options */}
        <div className="flex flex-col gap-5">
          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Blueprint Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'easy', label: 'Easy', desc: 'Simple shapes' },
                  { id: 'medium', label: 'Medium', desc: 'Detailed objects' },
                  { id: 'hard', label: 'Hard', desc: 'Complex structures' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === d.id
                      ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-950/50'
                      : 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-200">{d.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rounds & Timer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Rounds
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 7].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMaxRounds(r)}
                    className={`py-2 px-3 rounded-lg border text-center font-bold text-sm transition-all ${
                      maxRounds === r
                        ? 'bg-sky-950 border-sky-400 text-sky-200'
                        : 'bg-[#131b2e] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Build Timer
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '60s' },
                  { sec: 90, label: '90s' },
                ].map((t) => (
                  <button
                    key={t.sec}
                    onClick={() => setBuildDuration(t.sec)}
                    className={`py-2 px-2 rounded-lg border text-center font-bold text-sm transition-all ${
                      buildDuration === t.sec
                        ? 'bg-sky-950 border-sky-400 text-sky-200'
                        : 'bg-[#131b2e] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-[#111827] border border-sky-900/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Compass className="w-4 h-4" />
              <span>How To Play</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-sky-300">The Architect</strong> sees the secret blueprint
                and describes layout coordinates via microphone.
              </li>
              <li>
                <strong className="text-sky-300">Builders</strong> place colored blocks on their 8×8
                canvases before the clock runs out.
              </li>
              <li>
                At reveal, blueprints are compared. Vote for{' '}
                <span className="text-amber-400 font-semibold">Closest Match</span> and{' '}
                <span className="text-rose-400 font-semibold">Funniest Disaster</span>!
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Player Roster & Bot Management */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Players ({players.length}/8)
              </label>
            </div>
            {isHost && players.length < 8 && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAddBot}
                className="text-xs border-sky-500/40 text-sky-300 hover:bg-sky-950/40 flex items-center gap-1.5 py-1 px-2.5 h-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <Bot className="w-3.5 h-3.5" />
                <span>Add AI Bot</span>
              </Button>
            )}
          </div>

          {/* Player Cards */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#131b2e] border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{player.displayName}</span>
                      {player.isBot && (
                        <Badge
                          variant="neutral"
                          className="text-[10px] px-1.5 py-0 bg-sky-950 text-sky-300 border-sky-800 uppercase"
                        >
                          {player.botSkill} bot
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Score: {player.score} pts</span>
                  </div>
                </div>

                {isHost && player.isBot && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveBot(player.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 h-auto"
                    title="Remove Bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Start Game Button */}
          <div className="mt-auto pt-2">
            {isHost ? (
              <Button
                onClick={() => onStartGame(difficulty, maxRounds, buildDuration)}
                disabled={!canStart}
                className="w-full py-4 text-base font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-950 flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Construction</span>
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-sm text-slate-400">
                Waiting for the host to start the game...
              </div>
            )}
            {!canStart && isHost && (
              <p className="text-xs text-rose-400 text-center mt-2">
                Need at least 2 players (add AI bots if playing solo).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
