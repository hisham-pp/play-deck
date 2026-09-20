'use client';

import { Award, Check, Copy, RotateCcw, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import { compileFullStoryText } from '../engine/story-engine';
import type { OneWordStoryState, StoryPlayer } from '../types/one-word-story.types';

export interface StoryGameOverModalProps {
  gameState: OneWordStoryState;
  players: StoryPlayer[];
  onRestart: () => void;
}

export const StoryGameOverModal: React.FC<StoryGameOverModalProps> = ({
  gameState,
  players,
  onRestart,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const fullStory = compileFullStoryText(gameState.selectedPrompt, gameState.words);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      void navigator.clipboard.writeText(fullStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0f172a]/95 backdrop-blur border border-amber-500/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header with Trophy */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            <h2 className="text-3xl font-black text-amber-400">Story Coronation!</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Grand storycraft awards and final player rankings for &ldquo;
            {gameState.selectedPrompt.title}&rdquo;.
          </p>
        </div>

        {winner && (
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500/20 to-amber-900/40 border border-amber-500/50 px-4 py-2 rounded-xl">
            <span className="text-2xl">{winner.avatar}</span>
            <div>
              <div className="text-[10px] text-amber-300 uppercase font-mono tracking-wider">
                Top Storyteller
              </div>
              <div className="font-bold text-slate-100 text-sm">
                {winner.displayName} ({winner.score} pts)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Awards Showcase */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          Story Awards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gameState.awards.map((award) => (
            <div
              key={award.awardType}
              className="p-4 rounded-xl bg-[#1e293b]/80 border border-amber-500/30 flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-amber-400">
                  {award.title}
                </span>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">
                  {award.voteCount} votes
                </Badge>
              </div>

              <div className="text-xl font-serif font-bold text-amber-200 bg-black/30 p-2 rounded text-center">
                &ldquo;{award.word}&rdquo;
              </div>

              <div className="text-xs text-slate-400 text-center">
                Contributed by <span className="font-bold text-slate-200">{award.authorName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Leaderboard &amp; Contributions
        </h3>

        <div className="flex flex-col gap-2">
          {sortedPlayers.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                  : 'bg-[#1e293b]/60 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono text-sm font-bold text-amber-400">#{idx + 1}</span>
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    {p.displayName}
                    {idx === 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1 border-amber-400 text-amber-300"
                      >
                        Champion
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{p.wordsContributed} words</span>
                    {p.awardsReceived.length > 0 && (
                      <span className="text-amber-300 font-semibold">
                        • {p.awardsReceived.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="font-mono text-base font-bold text-amber-400">{p.score} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Story Review Box */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Full Finished Tale
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="text-xs text-amber-300 hover:text-amber-200 p-1 h-auto flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copied to clipboard' : 'Copy Story'}
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-[#fdf6e2] text-[#2b2416] font-serif text-sm sm:text-base leading-relaxed border-2 border-[#e6d5b8] max-h-[160px] overflow-y-auto">
          {fullStory}
        </div>
      </div>

      {/* Footer / Restart */}
      <div className="flex justify-end pt-2 border-t border-amber-900/30">
        <Button
          size="lg"
          onClick={onRestart}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <RotateCcw className="w-5 h-5" />
          Play Another Story
        </Button>
      </div>
    </div>
  );
};
