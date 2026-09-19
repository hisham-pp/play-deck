'use client';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, RotateCw, Zap } from 'lucide-react';
import React from 'react';
import { Badge } from '@playdeck/ui';
import type { GravityDirection, GravityShiftPlayer } from '../types/gravity-shift.types';

export interface GravityShiftHudProps {
  currentGravity: GravityDirection;
  localPlayer: GravityShiftPlayer | null;
  players: GravityShiftPlayer[];
  elapsedTimeMs: number;
  totalCheckpoints: number;
  onShift: (dir: GravityDirection) => void;
}

export function GravityShiftHud({
  currentGravity,
  localPlayer,
  players,
  elapsedTimeMs,
  totalCheckpoints,
  onShift,
}: GravityShiftHudProps) {
  const charges = localPlayer?.character.shiftCharges ?? 0;
  const cooldown = localPlayer?.character.shiftCooldown ?? 0;
  const checkpointsPassed = localPlayer?.character.checkpointsPassed ?? 0;

  const seconds = Math.floor(elapsedTimeMs / 1000);
  const hundredths = Math.floor((elapsedTimeMs % 1000) / 10);
  const timeFormatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;

  const gravityIcon = () => {
    switch (currentGravity) {
      case 'down':
        return <ArrowDown className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'up':
        return <ArrowUp className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'left':
        return <ArrowLeft className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'right':
        return <ArrowRight className="w-5 h-5 text-amber-400 animate-bounce" />;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Gravity Compass Pill */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#111827]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#232f45] shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gravity
            </span>
            <div className="p-1.5 bg-[#1c2438] rounded-lg border border-[#232f45]">
              {gravityIcon()}
            </div>
            <span className="text-sm font-bold uppercase text-amber-400 tracking-wide">
              {currentGravity}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#232f45]" />

          {/* Touch/Quick Shift Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (currentGravity === 'down') onShift('right');
                else if (currentGravity === 'right') onShift('up');
                else if (currentGravity === 'up') onShift('left');
                else onShift('down');
              }}
              disabled={charges <= 0 || cooldown > 0}
              title="Rotate Counter-Clockwise (Q)"
              className="p-1.5 bg-[#1c2438] hover:bg-[#232f45] disabled:opacity-40 rounded-lg text-slate-300 hover:text-white transition-colors border border-[#232f45]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (currentGravity === 'down') onShift('left');
                else if (currentGravity === 'left') onShift('up');
                else if (currentGravity === 'up') onShift('right');
                else onShift('down');
              }}
              disabled={charges <= 0 || cooldown > 0}
              title="Rotate Clockwise (E)"
              className="p-1.5 bg-[#1c2438] hover:bg-[#232f45] disabled:opacity-40 rounded-lg text-slate-300 hover:text-white transition-colors border border-[#232f45]"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Race Timer */}
        <div className="flex items-center gap-2 bg-[#111827]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#232f45] shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Time
          </span>
          <span className="font-mono text-base font-bold text-cyan-400">{timeFormatted}</span>
        </div>

        {/* Checkpoint Counter */}
        <div className="flex items-center gap-2 bg-[#111827]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#232f45] shadow-lg">
          <Badge
            variant="outline"
            className="bg-emerald-950/60 text-emerald-400 border-emerald-800"
          >
            Checkpoints {checkpointsPassed} / {totalCheckpoints}
          </Badge>
        </div>
      </div>

      {/* Bottom Bar: Shift Charges & Standings */}
      <div className="flex items-end justify-between w-full">
        {/* Shift Energy Charges */}
        <div className="flex flex-col gap-1 bg-[#111827]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#232f45] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Shift Charges
            </span>
            {cooldown > 0 && (
              <span className="text-amber-400 font-mono text-[10px]">{cooldown.toFixed(1)}s</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {[0, 1, 2].map((idx) => {
              const active = idx < charges;
              return (
                <div
                  key={idx}
                  className={`w-8 h-2.5 rounded transition-all duration-200 ${
                    active
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-[#1c2438] border border-[#232f45]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Racer Progress Pills */}
        <div className="flex items-center gap-2 bg-[#111827]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#232f45] shadow-lg max-w-md overflow-x-auto">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1c2438] border border-[#232f45] text-xs whitespace-nowrap"
            >
              <span>{p.avatar}</span>
              <span className="font-semibold text-slate-200">{p.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {p.rank ? `#${p.rank}` : `CP ${p.character.checkpointsPassed}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
