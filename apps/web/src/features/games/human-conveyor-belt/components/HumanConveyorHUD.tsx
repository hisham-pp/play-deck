'use client';

import { Clock, Flame, PackageCheck, Trophy } from 'lucide-react';
import React from 'react';
import { Badge } from '@playdeck/ui';
import type { ConveyorGameState } from '../engine/conveyor-types';

interface HumanConveyorHUDProps {
  gameState: ConveyorGameState;
  localSeatIndex: number | null;
}

export function HumanConveyorHUD({ gameState, localSeatIndex }: HumanConveyorHUDProps) {
  const localSegment =
    localSeatIndex !== null && localSeatIndex !== undefined
      ? gameState.segments[localSeatIndex]
      : null;

  const targetQuota = gameState.layout.targetDeliveries;
  const progressPct = Math.min(100, Math.round((gameState.deliveredCount / targetQuota) * 100));

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d1424] p-3.5 rounded-xl border border-[#1e293b]">
        {/* Deliveries */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-deck-400 tracking-wider">
              Deliveries
            </span>
            <span className="text-sm font-black text-white font-mono">
              {gameState.deliveredCount} / {targetQuota} ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-deck-400 tracking-wider">
              Team Score
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white font-mono">{gameState.score}</span>
              {gameState.comboStreak > 1 && (
                <Badge variant="warning" className="px-1.5 py-0 text-[10px] font-bold">
                  <Flame className="w-3 h-3 mr-0.5 inline" />
                  {gameState.comboStreak}x
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-deck-400 tracking-wider">
              Timer
            </span>
            <span className="text-sm font-black text-white font-mono">
              {Math.ceil(gameState.timeRemaining)}s
            </span>
          </div>
        </div>

        {/* Your Segment */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
            style={{ backgroundColor: localSegment?.color ?? '#64748b' }}
          >
            {localSegment?.glyph ?? '●'}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-deck-400 tracking-wider">
              Your Segment
            </span>
            <span className="text-xs font-semibold text-deck-200 truncate">
              {localSegment ? localSegment.label : 'Spectating'}
            </span>
          </div>
        </div>
      </div>

      {/* Event banner / toast */}
      {gameState.lastEvent && (
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between animate-fadeIn transition-colors ${
            gameState.lastEvent.type === 'delivered'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
              : 'bg-red-950/60 text-red-300 border border-red-800/40'
          }`}
        >
          <span>{gameState.lastEvent.text}</span>
          <span className="text-[10px] font-mono text-deck-400">Live Telemetry</span>
        </div>
      )}
    </div>
  );
}
