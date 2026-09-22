'use client';

import React from 'react';

import { Badge } from '@playdeck/ui';

import type { FoundWord } from '../types/spelling-bee.types';

interface Props {
  foundWords: FoundWord[];
  totalWordsPossible: number;
}

export function FoundWordsList({ foundWords, totalWordsPossible }: Props) {
  const sorted = [...foundWords].sort((a, b) => a.word.localeCompare(b.word));

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col h-full max-h-96">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <h3 className="text-sm font-semibold text-slate-300">
          Found Words ({foundWords.length} / {totalWordsPossible})
        </h3>
        <span className="text-xs text-amber-400 font-medium">
          {foundWords.reduce((sum, w) => sum + w.score, 0)} pts
        </span>
      </div>

      {foundWords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8">
          <span>Your found words will appear here.</span>
          <span className="mt-1">Tap letters or type to begin!</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 overflow-y-auto pr-1">
          {sorted.map((item) => (
            <span
              key={item.word}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                item.isPangram
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-200 border-slate-700/50'
              }`}
            >
              <span>{item.word}</span>
              <span className="text-[10px] opacity-70">+{item.score}</span>
              {item.isPangram && (
                <Badge variant="warning" className="text-[9px] px-1 py-0 h-4">
                  PANGRAM
                </Badge>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
