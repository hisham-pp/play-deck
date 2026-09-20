'use client';

import { Bot, Copy, HelpCircle, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { LiePlayer, PromptCategory } from '../types/guess-the-lie.types';

export interface LieLobbyProps {
  roomCode: string;
  players: LiePlayer[];
  isHost: boolean;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: (
    category: PromptCategory | 'all',
    maxRounds: number,
    answerDuration: number,
    discussionDuration: number,
  ) => void;
}

export const LieLobby: React.FC<LieLobbyProps> = ({
  roomCode,
  players,
  isHost,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [maxRounds, setMaxRounds] = useState<number>(3);
  const [answerDuration, setAnswerDuration] = useState<number>(45);
  const [discussionDuration, setDiscussionDuration] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);

  const canStart = players.length >= 3;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/play/guess-the-lie?join=${roomCode}`;
      void navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 backdrop-blur border border-indigo-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-indigo-400">
              Guess the Lie
            </h2>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300">
              Social Deduction Q&A
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Everyone tells the truth except one secret liar. Can you sniff out the deception?
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#141e33] px-3 py-1.5 rounded-lg border border-indigo-500/30">
          <span className="text-xs text-slate-400 font-mono">ROOM:</span>
          <span className="text-lg font-bold tracking-widest text-indigo-400 font-mono">
            {roomCode}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="text-slate-300 hover:text-indigo-300 ml-1 p-1 h-auto"
            title="Copy invite link"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {copied && <span className="text-xs text-emerald-400">Copied!</span>}
        </div>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Match Options & Prompts */}
        <div className="flex flex-col gap-5">
          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Prompt Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'all', label: 'Variety Mix', desc: 'All categories' },
                  { id: 'factual', label: 'Factual', desc: 'Geography & Science' },
                  { id: 'trivia', label: 'Trivia', desc: 'Odd curiosities' },
                  { id: 'personal', label: 'Personal', desc: 'Quirks & Stories' },
                  { id: 'creative', label: 'Creative', desc: 'Wild imaginations' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedCategory === c.id
                      ? 'bg-indigo-950/80 border-indigo-400 shadow-md shadow-indigo-950/50'
                      : 'bg-[#121a2d] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-200">{c.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rounds & Timers */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Rounds
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[3, 5, 7].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMaxRounds(r)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                      maxRounds === r
                        ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                        : 'bg-[#121a2d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Answer Time
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[30, 45, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAnswerDuration(t)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-bold text-xs transition-all ${
                      answerDuration === t
                        ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                        : 'bg-[#121a2d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Discussion
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[45, 60, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDiscussionDuration(t)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-bold text-xs transition-all ${
                      discussionDuration === t
                        ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                        : 'bg-[#121a2d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* How To Play Overview Card */}
          <div className="bg-[#101726] border border-indigo-900/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>How To Play</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-indigo-300">Secret Roles:</strong> One player is secretly
                chosen as the Liar. Everyone else must submit the absolute truth.
              </li>
              <li>
                <strong className="text-indigo-300">Voice Debate:</strong> Answers are revealed
                anonymously. Debate over microphones: who wrote what? Whose answer feels completely
                fabricated?
              </li>
              <li>
                <strong className="text-indigo-300">Scoring:</strong> Spotting the lie awards{' '}
                <span className="text-amber-400 font-semibold">+100 pts</span>. The Liar gains{' '}
                <span className="text-rose-400 font-semibold">+50 pts per fooled player</span> (+150
                majority bonus)!
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Player Roster & Bot Management */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Players ({players.length}/8)
              </label>
            </div>
            {isHost && players.length < 8 && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAddBot}
                className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 flex items-center gap-1.5 py-1 px-2.5 h-auto"
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
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#121a2d] border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{player.displayName}</span>
                      {player.isBot && (
                        <Badge
                          variant="neutral"
                          className="text-[10px] px-1.5 py-0 bg-indigo-950 text-indigo-300 border-indigo-800 uppercase"
                        >
                          {player.botPersona} bot
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
                onClick={() =>
                  onStartGame(selectedCategory, maxRounds, answerDuration, discussionDuration)
                }
                disabled={!canStart}
                className="w-full py-4 text-base font-bold bg-indigo-500 hover:bg-indigo-400 text-slate-950 shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Investigation</span>
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-sm text-slate-400">
                Waiting for host to start the game...
              </div>
            )}
            {!canStart && isHost && (
              <p className="text-xs text-rose-400 text-center mt-2">
                Need at least 3 players to start (add AI bots if playing solo or with 2).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
