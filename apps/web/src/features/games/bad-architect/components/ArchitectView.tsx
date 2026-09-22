'use client';

import { CheckCircle2, Clock, Eye, Mic, Sparkles } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { Blueprint, ArchitectPlayer } from '../types/bad-architect.types';

export interface ArchitectViewProps {
  blueprint: Blueprint;
  timeLeft: number;
  phase: 'briefing' | 'building';
  builders: ArchitectPlayer[];
  submittedBuilderIds: string[];
  isHost: boolean;
  onCallTime: () => void;
}

const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const ArchitectView: React.FC<ArchitectViewProps> = ({
  blueprint,
  timeLeft,
  phase,
  builders,
  submittedBuilderIds,
  isHost,
  onCallTime,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1222]/95 border border-sky-500/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Top Banner: Architect Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-800/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/40">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-sky-300">
                You are the Lead Architect!
              </h2>
              <Badge variant="outline" className="border-sky-400 text-sky-300">
                Voice Only
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Speak into your mic and guide your builders. You cannot draw—only describe!
            </p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
              timeLeft <= 10
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-[#172033] border-sky-500/40 text-sky-300'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>

          {isHost && phase === 'building' && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCallTime}
              className="border-sky-500/40 text-sky-300 hover:bg-sky-950 text-xs py-2 px-3"
            >
              Early Reveal
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Blueprint Grid Viewer */}
        <div className="flex flex-col items-center p-4 rounded-xl bg-[#090d18] border border-sky-950 shadow-inner">
          <div className="flex items-center justify-between w-full max-w-[320px] mb-3">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Classified Blueprint
              </span>
            </div>
            <span className="text-sm font-black text-amber-400">{blueprint.name}</span>
          </div>

          {/* Grid with coordinates */}
          <div className="relative p-2 bg-[#121929] rounded-lg border border-sky-900/50 shadow-lg">
            {/* Column labels (A-H) */}
            <div className="grid grid-cols-8 gap-1 mb-1 pl-5 w-64 sm:w-72">
              {COL_LABELS.map((col) => (
                <div key={col} className="text-center font-mono text-[10px] text-slate-500">
                  {col}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Row labels (1-8) */}
              <div className="flex flex-col justify-around pr-1.5 font-mono text-[10px] text-slate-500">
                {ROW_LABELS.map((row) => (
                  <div key={row} className="h-7 sm:h-8 flex items-center justify-center">
                    {row}
                  </div>
                ))}
              </div>

              {/* 8x8 Pixel Grid */}
              <div className="grid grid-cols-8 gap-1 w-64 sm:w-72">
                {blueprint.grid.map((row, rIdx) =>
                  row.map((color, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm border border-slate-800/80 transition-all flex items-center justify-center shadow-xs"
                      style={{
                        backgroundColor: color ?? '#1e293b',
                      }}
                    />
                  )),
                )}
              </div>
            </div>
          </div>

          {/* Color Palette Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-slate-400 font-mono">Colors:</span>
            <div className="flex gap-1.5">
              {blueprint.colorPalette.map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Speaking Guidance & Builder Status */}
        <div className="flex flex-col gap-4">
          {/* Pro Tips Box */}
          <div className="p-4 rounded-xl bg-[#111827] border border-sky-900/40 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Architect's Guide</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {blueprint.descriptionHints[0] ??
                'Start by stating the object type and major anchor blocks (e.g. "Row 7 has 4 blue blocks in columns C through F").'}
            </p>
            <div className="text-[11px] text-slate-400 bg-[#0c1222] p-2.5 rounded-lg border border-slate-800">
              💡 <strong>Hint:</strong> Builders can't see this screen! Be precise about coordinates
              (Row 1-8, Column A-H).
            </div>
          </div>

          {/* Builders Submission Tracker */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Builder Progress</span>
              <span>
                {submittedBuilderIds.length} / {builders.length} Submitted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {builders.map((b) => {
                const isSubmitted = submittedBuilderIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                      isSubmitted
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#141d30] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{b.avatar}</span>
                      <span className="truncate">{b.displayName}</span>
                    </div>
                    {isSubmitted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-amber-400/80 animate-pulse">
                        Building...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
