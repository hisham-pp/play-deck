'use client';

import React from 'react';

import { getLetterPoints, isRareLetter } from '../engine/word-battle-engine';

interface WordRackProps {
  letters: string[];
  selectedIndices: number[];
  onLetterClick: (letter: string, index: number) => void;
  onShuffle: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const WordRack: React.FC<WordRackProps> = ({
  letters,
  selectedIndices,
  onLetterClick,
  onShuffle,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const isSelected = (index: number) => selectedIndices.includes(index);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Letter tiles row */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#0d1322]/80 border border-[#232f45] shadow-inner backdrop-blur-sm max-w-xl w-full"
        role="group"
        aria-label="Letter rack"
      >
        {letters.map((char, index) => {
          const used = isSelected(index);
          const points = getLetterPoints(char);
          const rare = isRareLetter(char);

          return (
            <button
              key={`${char}-${index}`}
              type="button"
              disabled={disabled || used}
              onClick={() => onLetterClick(char, index)}
              className={`relative flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl font-bold font-mono text-xl sm:text-2xl transition-all duration-150 select-none shadow-md ${
                used
                  ? 'opacity-30 bg-[#162032] text-slate-500 border border-slate-700/50 scale-95 cursor-not-allowed'
                  : rare
                    ? 'bg-gradient-to-b from-[#2d224d] to-[#1a1435] text-amber-300 border-2 border-amber-500/70 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-amber-500/10'
                    : 'bg-gradient-to-b from-[#1c2438] to-[#121929] text-white border-2 border-[#2f3d5c] hover:border-indigo-400 hover:scale-105 active:scale-95 shadow-indigo-500/10'
              }`}
              aria-label={`Letter ${char}, ${points} points${used ? ', used' : ''}`}
            >
              <span>{char}</span>
              <span
                className={`absolute top-1 right-1.5 text-[10px] sm:text-xs font-sans font-semibold ${
                  rare ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {points}
              </span>
              {rare && (
                <span className="absolute bottom-1 text-[8px] tracking-wider uppercase text-amber-400/80 font-sans font-bold">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rack control buttons */}
      <div className="flex items-center gap-2 sm:gap-3 w-full max-w-xl justify-between px-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onShuffle}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#162032] text-slate-300 border border-[#26354f] hover:bg-[#1e2c45] hover:text-white transition-all active:scale-95 disabled:opacity-50"
          title="Shuffle letters (Spacebar)"
        >
          <svg
            className="w-4 h-4 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Shuffle</span>
        </button>

        <button
          type="button"
          disabled={disabled || selectedIndices.length === 0}
          onClick={onClear}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#162032] text-slate-300 border border-[#26354f] hover:bg-[#1e2c45] hover:text-red-300 transition-all active:scale-95 disabled:opacity-50"
          title="Clear word (Backspace)"
        >
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Clear</span>
        </button>

        <button
          type="button"
          disabled={disabled || selectedIndices.length < 3}
          onClick={onSubmit}
          className="flex-[1.5] flex items-center justify-center gap-2 py-2 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Submit word (Enter)"
        >
          <span>Submit</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
