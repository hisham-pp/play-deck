'use client';

import React from 'react';

import type { FoundWord, HoneycombPuzzle, SpellingBeeRank } from '../types/spelling-bee.types';
import { FoundWordsList } from './FoundWordsList';
import { HoneycombGrid } from './HoneycombGrid';
import { SpellingBeeRankBar } from './SpellingBeeRankBar';

interface Props {
  puzzle: HoneycombPuzzle;
  outerLetters: string[];
  currentInput: string;
  feedbackMessage: string | null;
  feedbackType: 'valid' | 'invalid' | 'pangram' | 'already-found' | null;
  score: number;
  rank: SpellingBeeRank;
  foundWords: FoundWord[];
  onLetterClick: (letter: string) => void;
  onDelete: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
}

export function SpellingBeePlayingView({
  puzzle,
  outerLetters,
  currentInput,
  feedbackMessage,
  feedbackType,
  score,
  rank,
  foundWords,
  onLetterClick,
  onDelete,
  onShuffle,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl px-4">
      {/* Rank Progress Bar */}
      <SpellingBeeRankBar score={score} maxScore={puzzle.maxScore} currentRank={rank} />

      {/* Main Play Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-start">
        {/* Left / Center: Honeycomb Grid & Input */}
        <div className="md:col-span-7 flex flex-col items-center gap-4">
          {/* Input Box with Feedback */}
          <div className="h-16 flex flex-col items-center justify-center relative w-full">
            {feedbackMessage ? (
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold animate-bounce shadow-md ${
                  feedbackType === 'pangram'
                    ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300'
                    : feedbackType === 'valid'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                }`}
              >
                {feedbackMessage}
              </div>
            ) : (
              <div className="flex items-center text-3xl sm:text-4xl font-extrabold tracking-widest min-h-[44px]">
                {currentInput.split('').map((char, i) => (
                  <span
                    key={`${char}-${i}`}
                    className={char === puzzle.centerLetter ? 'text-amber-400' : 'text-slate-100'}
                  >
                    {char}
                  </span>
                ))}
                <span className="w-0.5 h-8 bg-amber-400 animate-pulse ml-1" />
              </div>
            )}
          </div>

          {/* Honeycomb Grid */}
          <HoneycombGrid
            centerLetter={puzzle.centerLetter}
            outerLetters={outerLetters}
            onLetterClick={onLetterClick}
            onDelete={onDelete}
            onShuffle={onShuffle}
            onSubmit={onSubmit}
          />
        </div>

        {/* Right: Found Words Drawer */}
        <div className="md:col-span-5 w-full">
          <FoundWordsList foundWords={foundWords} totalWordsPossible={puzzle.validWords.length} />
        </div>
      </div>
    </div>
  );
}
