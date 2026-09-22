'use client';

import { BookOpen, Copy, Plus, Trash2, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import { STORY_PROMPTS } from '../engine/story-prompts';
import type { StoryMode, StoryPlayer, StoryPrompt } from '../types/one-word-story.types';

export interface StoryLobbyProps {
  roomCode: string;
  players: StoryPlayer[];
  isHost: boolean;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: (mode: StoryMode, prompt: StoryPrompt, maxWords: number) => void;
}

export const StoryLobby: React.FC<StoryLobbyProps> = ({
  roomCode,
  players,
  isHost,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [selectedMode, setSelectedMode] = useState<StoryMode>('classic');
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [targetWordCount, setTargetWordCount] = useState<number>(30);
  const [copied, setCopied] = useState<boolean>(false);

  const canStart = players.length >= 3;
  const currentPrompt = STORY_PROMPTS[selectedPromptIndex] ?? STORY_PROMPTS[0]!;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/play/one-word-story?join=${roomCode}`;
      void navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0f172a]/90 backdrop-blur border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-amber-400">
              One Word Story
            </h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Cooperative Storycraft
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Build hilarious, dramatic tales one word at a time. Read back, vote, and crown the best
            storyteller.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-amber-500/30">
          <span className="text-xs text-slate-400 font-mono">ROOM:</span>
          <span className="text-lg font-bold tracking-widest text-amber-400 font-mono">
            {roomCode}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="text-slate-300 hover:text-amber-300 ml-1 p-1 h-auto"
            title="Copy invite link"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {copied && <span className="text-xs text-emerald-400">Copied!</span>}
        </div>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Game Options & Theme */}
        <div className="flex flex-col gap-5">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'classic', label: 'Classic', desc: '15s timer' },
                  { id: 'speed', label: 'Speed', desc: '6s panic!' },
                  { id: 'challenge', label: 'Challenge', desc: 'Secret targets' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-left transition-all ${
                    selectedMode === m.id
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                      : 'bg-[#1e293b]/70 border-slate-700 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold">{m.label}</span>
                  <span className="text-[11px] text-slate-400">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Word Length Limit */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Story Length
              </label>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {targetWordCount} words
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[20, 30, 45].map((count) => (
                <button
                  key={count}
                  onClick={() => setTargetWordCount(count)}
                  className={`py-2 rounded-lg font-mono text-sm font-bold border transition-colors ${
                    targetWordCount === count
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-[#1e293b]/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {count} Words
                </button>
              ))}
            </div>
          </div>

          {/* Story Prompt Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Story Prompt &amp; Genre
            </label>
            <div className="p-4 rounded-xl bg-[#1e293b]/80 border border-slate-700 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  {currentPrompt.genre.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedPromptIndex + 1} / {STORY_PROMPTS.length}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-100">{currentPrompt.title}</h4>
              <p className="text-sm italic text-amber-200/80 bg-black/20 p-2.5 rounded border border-slate-700/50">
                &ldquo;{currentPrompt.starterPhrase}...&rdquo;
              </p>
              {isHost && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedPromptIndex((prev) =>
                        prev > 0 ? prev - 1 : STORY_PROMPTS.length - 1,
                      )
                    }
                    className="flex-1 text-xs border-slate-700"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedPromptIndex((prev) => (prev + 1) % STORY_PROMPTS.length)
                    }
                    className="flex-1 text-xs border-slate-700"
                  >
                    Next Prompt
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Player Roster */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Authors ({players.length}/8)
            </label>
            {isHost && players.length < 8 && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAddBot}
                className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/30 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add AI Author
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#1e293b]/70 border border-slate-700/80"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-mono text-slate-500">#{idx + 1}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5 text-slate-200">
                      {p.displayName}
                      {p.isHost && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 border-amber-400 text-amber-300"
                        >
                          Host
                        </Badge>
                      )}
                      {p.isBot && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 border-blue-400 text-blue-300"
                        >
                          Bot
                        </Badge>
                      )}
                    </div>
                    {p.botPersonality && (
                      <span className="text-[11px] text-slate-400 capitalize">
                        Style: {p.botPersonality}
                      </span>
                    )}
                  </div>
                </div>

                {isHost && p.isBot && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveBot(p.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30 p-1.5 h-auto"
                    title="Remove bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!canStart && (
            <div className="p-3 bg-amber-950/30 border border-amber-700/40 rounded-xl text-xs text-amber-300">
              Need at least 3 players to start storytelling. Add AI authors if playing solo or with
              2 players.
            </div>
          )}

          {isHost ? (
            <Button
              size="lg"
              disabled={!canStart}
              onClick={() => onStartGame(selectedMode, currentPrompt, targetWordCount)}
              className="mt-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base py-6 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Start Storycraft
            </Button>
          ) : (
            <div className="mt-auto p-4 bg-slate-900/60 rounded-xl text-center text-sm text-slate-400 flex items-center justify-center gap-2 border border-slate-800">
              <BookOpen className="w-4 h-4 text-amber-400 animate-pulse" />
              Waiting for host to begin the tale...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
