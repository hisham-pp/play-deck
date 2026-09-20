'use client';

import { Check, Clock, Eraser, Mic, RotateCcw, Send } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { BlockColor, Grid8x8, ArchitectPlayer } from '../types/bad-architect.types';

export interface BuilderCanvasProps {
  grid: Grid8x8;
  timeLeft: number;
  architect: ArchitectPlayer;
  selectedColor: BlockColor;
  onSelectColor: (color: BlockColor) => void;
  onCellClick: (row: number, col: number, color: BlockColor) => void;
  onClear: () => void;
  onSubmit: (grid: Grid8x8) => void;
  isSubmitted: boolean;
}

const PALETTE: { color: BlockColor; label: string }[] = [
  { color: '#ef4444', label: 'Red' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#f8fafc', label: 'White' },
];

const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  grid,
  timeLeft,
  architect,
  selectedColor,
  onSelectColor,
  onCellClick,
  onClear,
  onSubmit,
  isSubmitted,
}) => {
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const handleCellAction = (row: number, col: number) => {
    if (isSubmitted) return;
    const nextColor: BlockColor = isEraser ? null : selectedColor;
    onCellClick(row, col, nextColor);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown && !isSubmitted) {
      handleCellAction(row, col);
    }
  };

  return (
    <div
      className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1222]/95 border border-sky-900/40 rounded-2xl shadow-2xl text-slate-100 select-none"
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      {/* Top Banner: Architect Direction & Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Mic className="w-5 h-5 animate-pulse text-amber-400" />
            <span className="text-xl">{architect.avatar}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-200">
                Listen to{' '}
                <span className="text-amber-400 font-extrabold">{architect.displayName}</span>
              </h2>
              <Badge variant="outline" className="border-sky-500/40 text-sky-300">
                Builder Mode
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Your lead architect is describing what to build. Click or drag to lay blocks!
            </p>
          </div>
        </div>

        {/* Timer */}
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
      </div>

      {/* Main Builder Stage: Canvas + Tools */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Interactive 8x8 Canvas */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-[#080d1a] border border-sky-950 shadow-inner">
          <div className="relative p-2 bg-[#121929] rounded-xl border border-sky-900/50 shadow-2xl">
            {/* Column labels (A-H) */}
            <div className="grid grid-cols-8 gap-1 mb-1.5 pl-6 w-72 sm:w-80">
              {COL_LABELS.map((col) => (
                <div key={col} className="text-center font-mono text-xs font-bold text-slate-400">
                  {col}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Row labels (1-8) */}
              <div className="flex flex-col justify-around pr-2 font-mono text-xs font-bold text-slate-400">
                {ROW_LABELS.map((row) => (
                  <div key={row} className="h-8 sm:h-9 flex items-center justify-center">
                    {row}
                  </div>
                ))}
              </div>

              {/* 8x8 Grid Canvas */}
              <div className="grid grid-cols-8 gap-1.5 w-72 sm:w-80">
                {grid.map((row, rIdx) =>
                  row.map((cellColor, cIdx) => (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      disabled={isSubmitted}
                      onMouseDown={() => {
                        setIsMouseDown(true);
                        handleCellAction(rIdx, cIdx);
                      }}
                      onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md border transition-all cursor-pointer shadow-xs ${
                        cellColor
                          ? 'border-white/20 hover:scale-105 active:scale-95'
                          : 'bg-[#1a233a] border-slate-700/60 hover:bg-[#232f4e]'
                      } ${isSubmitted ? 'opacity-90 cursor-not-allowed' : ''}`}
                      style={{
                        backgroundColor: cellColor ?? '#1a233a',
                      }}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tools Palette & Actions */}
        <div className="flex flex-col gap-6 w-full max-w-xs">
          {/* Color Picker */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Block Colors
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {PALETTE.map((item) => {
                const isSelected = !isEraser && selectedColor === item.color;
                return (
                  <button
                    key={item.color as string}
                    type="button"
                    onClick={() => {
                      setIsEraser(false);
                      onSelectColor(item.color);
                    }}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white ring-2 ring-sky-400 scale-105 shadow-md'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: item.color as string }}
                    title={item.label}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-slate-950 font-black drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Eraser & Clear */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
              <Button
                size="sm"
                variant={isEraser ? 'primary' : 'outline'}
                onClick={() => setIsEraser(!isEraser)}
                className={`text-xs flex items-center justify-center gap-1.5 ${
                  isEraser
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'border-slate-700 text-slate-300'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onClear}
                disabled={isSubmitted}
                className="text-xs border-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Submit Build Button */}
          <div>
            <Button
              onClick={() => onSubmit(grid)}
              disabled={isSubmitted}
              className={`w-full py-4 text-base font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg ${
                isSubmitted
                  ? 'bg-emerald-600/80 text-white cursor-default'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-950'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Build Submitted!</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Blueprint</span>
                </>
              )}
            </Button>
            {isSubmitted && (
              <p className="text-xs text-slate-400 text-center mt-2 animate-pulse">
                Waiting for remaining builders or time expiry...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
