'use client';

import { Compass, Gamepad2, Skull, Sparkles, Timer } from 'lucide-react';
import React from 'react';
import type { CourseDefinition, PlayerPair, SharedBrainRole } from '../types/shared-brain.types';

interface SharedBrainHudProps {
  course: CourseDefinition;
  pair: PlayerPair;
  role: SharedBrainRole;
  elapsedTime: number;
  deathCount: number;
  collectedTokensCount: number;
  totalTokensCount: number;
}

export function SharedBrainHud({
  course,
  pair,
  role,
  elapsedTime,
  deathCount,
  collectedTokensCount,
  totalTokensCount,
}: SharedBrainHudProps) {
  const elapsedSec = elapsedTime.toFixed(1);

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Course Info */}
        <div className="flex items-center gap-3 rounded-lg border border-sky-500/20 bg-deck-800/80 p-3 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <span className="text-xl">🧠</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
              Course
            </div>
            <div className="truncate font-semibold text-sky-300">{course.name}</div>
          </div>
        </div>

        {/* Stopwatch Time */}
        <div className="flex items-center gap-3 rounded-lg border border-deck-border bg-deck-800/80 p-3 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">Time</div>
            <div className="font-mono text-xl font-bold text-amber-400">{elapsedSec}s</div>
          </div>
        </div>

        {/* Brain Tokens Collected */}
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-deck-800/80 p-3 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
              Tokens
            </div>
            <div className="font-mono text-xl font-bold text-amber-300">
              {collectedTokensCount} / {totalTokensCount}
            </div>
          </div>
        </div>

        {/* Synapse Resets (Deaths) */}
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-deck-800/80 p-3 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <Skull className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
              Resets
            </div>
            <div className="font-mono text-xl font-bold text-rose-400">{deathCount}</div>
          </div>
        </div>
      </div>

      {/* Role Assignment Strip */}
      <div className="flex flex-wrap items-center justify-between rounded-lg border border-deck-border bg-deck-900/90 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-deck-400">Active Pair:</span>
          <span className="font-bold text-deck-200">{pair.pairId.toUpperCase()}</span>
          <div className="flex items-center gap-1 pl-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: pair.colorA }}
            />
            <span className="text-deck-300">{pair.navigatorName} (Navigator)</span>
          </div>
          <span className="text-deck-500">+</span>
          <div className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: pair.colorB }}
            />
            <span className="text-deck-300">{pair.motorName} (Motor)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-deck-400">Your Controls:</span>
          {role === 'navigator' && (
            <span className="flex items-center gap-1 rounded bg-sky-500/20 px-2 py-0.5 font-bold text-sky-300">
              <Compass className="h-3 w-3" /> Navigator (A / D or ◄ / ►)
            </span>
          )}
          {role === 'motor' && (
            <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 font-bold text-amber-300">
              <Gamepad2 className="h-3 w-3" /> Motor (Space / W = Jump, E = Lever)
            </span>
          )}
          {role === 'both' && (
            <span className="flex items-center gap-1 rounded bg-purple-500/20 px-2 py-0.5 font-bold text-purple-300">
              🧠 Dual Control (A/D to Move + Space to Jump + E to Lever)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
