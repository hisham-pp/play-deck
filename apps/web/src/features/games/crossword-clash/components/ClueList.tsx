'use client';

import React, { useState } from 'react';

import type { CrosswordClue, CrosswordPlayer } from '../engine/crossword-clash-engine';

interface ClueListProps {
  clues: CrosswordClue[];
  players: CrosswordPlayer[];
  selectedClueId: string;
  highContrast: boolean;
  largeText: boolean;
  onSelectClue: (clueId: string) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  players,
  selectedClueId,
  highContrast,
  largeText,
  onSelectClue,
}) => {
  const [activeTab, setActiveTab] = useState<'across' | 'down'>('across');

  const acrossClues = clues.filter((c) => c.direction === 'across');
  const downClues = clues.filter((c) => c.direction === 'down');

  const currentClues = activeTab === 'across' ? acrossClues : downClues;

  const renderClueSection = (sectionTitle: string, sectionClues: CrosswordClue[]) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60">
        <h3
          className={`font-black uppercase tracking-wider ${
            largeText ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
          } ${highContrast ? 'text-yellow-400' : 'text-amber-400'}`}
        >
          {sectionTitle}
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {sectionClues.filter((c) => c.isCompleted).length} / {sectionClues.length} solved
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {sectionClues.map((clue) => {
          const isSelected = clue.id === selectedClueId;
          const solver = clue.completedByPlayerId
            ? players.find((p) => p.id === clue.completedByPlayerId)
            : null;

          return (
            <button
              key={clue.id}
              type="button"
              onClick={() => onSelectClue(clue.id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs sm:text-sm flex items-start gap-2.5 ${
                isSelected
                  ? highContrast
                    ? 'bg-zinc-800 border-yellow-400 ring-1 ring-yellow-400 text-yellow-300'
                    : 'bg-amber-500/15 border-amber-400/80 ring-1 ring-amber-400 text-amber-200'
                  : clue.isCompleted
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75'
                    : highContrast
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-500'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100'
              }`}
            >
              {/* Clue Identifier Badge */}
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] leading-tight shrink-0 ${
                  isSelected
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-amber-400 text-slate-950'
                    : clue.isCompleted
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-700 text-slate-300'
                }`}
              >
                {clue.number}
                {clue.direction === 'across' ? 'A' : 'D'}
              </span>

              {/* Clue Text & Status */}
              <div className="flex-1 flex flex-col gap-0.5">
                <span
                  className={`${clue.isCompleted ? 'line-through' : ''} ${
                    largeText ? 'text-sm sm:text-base font-medium' : 'text-xs sm:text-sm'
                  }`}
                >
                  {clue.text}
                </span>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({clue.length} letters)
                  </span>

                  {clue.isCompleted && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full border flex items-center gap-1"
                      style={{
                        borderColor: solver?.color ?? '#10b981',
                        color: solver?.color ?? '#10b981',
                      }}
                    >
                      ✓ Solved by {solver?.name ?? 'Player'}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 border shadow-xl flex flex-col gap-3 ${
        highContrast
          ? 'bg-black border-white'
          : 'bg-slate-900/90 border-slate-700/60 shadow-black/40'
      }`}
    >
      {/* Mobile / Narrow Tab Header */}
      <div className="flex md:hidden items-center gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('across')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'across'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Across ({acrossClues.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('down')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'down'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Down ({downClues.length})
        </button>
      </div>

      {/* Mobile Tab View */}
      <div className="block md:hidden">
        {renderClueSection(activeTab === 'across' ? 'Across Clues' : 'Down Clues', currentClues)}
      </div>

      {/* Desktop Dual-Column View */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {renderClueSection('Across Clues', acrossClues)}
        {renderClueSection('Down Clues', downClues)}
      </div>
    </div>
  );
};
