'use client';

import React from 'react';

import { Badge } from '@playdeck/ui';

import type { OneWordStoryState, StoryPlayer } from '../types/one-word-story.types';

export interface StoryBookStageProps {
  gameState: OneWordStoryState;
  players: StoryPlayer[];
}

export const StoryBookStage: React.FC<StoryBookStageProps> = ({ gameState, players }) => {
  const { selectedPrompt, words, maxWords, activePlayerId } = gameState;
  const activePlayer = players.find((p) => p.id === activePlayerId);
  const progressPercent = Math.min(100, (words.length / maxWords) * 100);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap justify-between items-center bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="uppercase tracking-widest text-[10px] text-amber-400 border-amber-500/30"
          >
            {selectedPrompt.genre}
          </Badge>
          <span className="font-bold text-slate-200">{selectedPrompt.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">Progress:</span>
            <span className="font-bold text-amber-400">
              {words.length} / {maxWords} words
            </span>
          </div>
          {activePlayer && (
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-2 py-1 rounded">
              <span className="text-slate-400">Active:</span>
              <span className="text-sm">{activePlayer.avatar}</span>
              <span className="font-bold text-amber-300">{activePlayer.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Story Parchment Scroll Area */}
      <div className="relative p-6 sm:p-10 rounded-2xl bg-[#fdf6e2] text-[#2b2416] shadow-2xl border-4 border-[#e6d5b8] min-h-[300px] max-h-[460px] overflow-y-auto font-serif leading-relaxed text-lg sm:text-2xl selection:bg-amber-300">
        {/* Subtle vintage paper watermark lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Starter Phrase */}
        <span className="font-bold text-[#4a3b2c] mr-2 italic">{selectedPrompt.starterPhrase}</span>

        {/* Real-time word flow with contributor tooltips */}
        {words.map((item, idx) => {
          const isLatest = idx === words.length - 1;
          return (
            <span
              key={item.id}
              className={`group relative inline-block mx-1 transition-all rounded px-1 cursor-default ${
                isLatest
                  ? 'bg-amber-300/60 font-bold text-amber-950 animate-pulse'
                  : 'hover:bg-amber-200/50 text-[#1e1b18]'
              }`}
            >
              {item.word}

              {/* Contributor Hover Card */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[11px] font-sans px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20 border border-slate-700">
                Word #{idx + 1} by {item.authorName}
              </span>
            </span>
          );
        })}

        {/* Blinking Typewriter Cursor */}
        <span className="inline-block w-2.5 h-6 bg-amber-700 ml-1.5 align-middle animate-pulse" />
      </div>
    </div>
  );
};
