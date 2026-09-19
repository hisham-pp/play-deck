'use client';

import { ArrowRight, CircleDot, Disc, Play, RotateCcw, Shield, Square, Trash2 } from 'lucide-react';
import React from 'react';
import type { BallFlightStatus, GravityObjectType } from '../types/gravity-golf.types';

interface GravityGolfToolbarProps {
  selectedTool: GravityObjectType | null;
  onSelectTool: (tool: GravityObjectType | null) => void;
  allowedItems: Record<GravityObjectType, number>;
  itemCounts: Record<GravityObjectType, number>;
  selectedObjectId: string | null;
  onDeleteSelected: () => void;
  ballStatus: BallFlightStatus;
  onLaunch: () => void;
  onResetBall: () => void;
  onClearAll: () => void;
}

const TOOLS: {
  type: GravityObjectType;
  label: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    type: 'attractor',
    label: 'Attractor Well',
    key: '1',
    icon: CircleDot,
    color: 'text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10',
  },
  {
    type: 'repeller',
    label: 'Repeller Shield',
    key: '2',
    icon: Shield,
    color: 'text-pink-400 border-pink-500/40 hover:bg-pink-500/10',
  },
  {
    type: 'directional',
    label: 'Vector Booster',
    key: '3',
    icon: ArrowRight,
    color: 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10',
  },
  {
    type: 'orbit-ring',
    label: 'Orbit Ring',
    key: '4',
    icon: Disc,
    color: 'text-teal-400 border-teal-500/40 hover:bg-teal-500/10',
  },
  {
    type: 'gravity-wall',
    label: 'Deflector Bar',
    key: '5',
    icon: Square,
    color: 'text-amber-400 border-amber-500/40 hover:bg-amber-500/10',
  },
];

export function GravityGolfToolbar({
  selectedTool,
  onSelectTool,
  allowedItems,
  itemCounts,
  selectedObjectId,
  onDeleteSelected,
  ballStatus,
  onLaunch,
  onResetBall,
  onClearAll,
}: GravityGolfToolbarProps) {
  const isInFlight = ballStatus === 'in_flight';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-raised/90 backdrop-blur-md">
      {/* Object selector tool buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {TOOLS.map((tool) => {
          const count = itemCounts[tool.type] || 0;
          const limit = allowedItems[tool.type] || 0;
          const isExhausted = count >= limit;
          const isSelected = selectedTool === tool.type;
          const Icon = tool.icon;

          return (
            <button
              key={tool.type}
              type="button"
              disabled={isInFlight}
              onClick={() => onSelectTool(isSelected ? null : tool.type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                isSelected
                  ? `bg-surface-overlay ring-2 ring-amber-500/50 ${tool.color}`
                  : `bg-surface-overlay/60 ${tool.color} opacity-85 hover:opacity-100`
              } ${isExhausted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tool.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-base border border-surface-border text-deck-300 font-mono">
                {count}/{limit}
              </span>
              <span className="hidden sm:inline text-[9px] text-deck-500 font-mono">
                [{tool.key}]
              </span>
            </button>
          );
        })}

        {selectedObjectId && (
          <button
            type="button"
            onClick={onDeleteSelected}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Field [Del]</span>
          </button>
        )}
      </div>

      {/* Main Execution Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClearAll}
          disabled={isInFlight}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border bg-surface-overlay text-deck-400 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
          title="Clear all placed fields [R]"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset Hole</span>
        </button>

        {isInFlight ? (
          <button
            type="button"
            onClick={onResetBall}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Ball [Space]</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLaunch}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-black text-xs shadow-arcade uppercase tracking-wider transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch [Space]</span>
          </button>
        )}
      </div>
    </div>
  );
}
