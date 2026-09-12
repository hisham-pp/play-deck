'use client';

import {
  ArrowLeft,
  Globe,
  RotateCcw,
  Settings,
  Swords,
  Turtle,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import type { PenFightPlayerId, PenFightState } from '../types/pen-fight.types';

interface PenFightHUDProps {
  state: PenFightState;
  onOpenSetup: () => void;
  onResetPositions: () => void;
}

const ICON_SM = 'h-4 w-4';

function PlayerCard({
  state,
  playerId,
  align,
}: {
  state: PenFightState;
  playerId: PenFightPlayerId;
  align: 'left' | 'right';
}) {
  const player = state.players[playerId];
  const isActive =
    state.activePlayer === playerId && state.phase !== 'round-over' && state.phase !== 'match-over';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-md transition-all ${
        isActive
          ? 'border-amber-500/70 bg-surface-raised/90 shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_8px_24px_-8px_rgba(245,158,11,0.4)]'
          : 'border-surface-border/70 bg-surface-raised/70'
      } ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
    >
      <span
        className="h-8 w-8 shrink-0 rounded-full border-2 border-white/20 shadow-inner"
        style={{ backgroundColor: player.color }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-deck-900 dark:text-white font-display">
          <span className="truncate max-w-[110px]">{player.displayName}</span>
          {player.isAI && (
            <span className="rounded bg-surface-overlay px-1 py-0.5 text-[9px] font-semibold text-deck-500">
              CPU
            </span>
          )}
        </div>
        <div className={`mt-1 flex gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
          {Array.from({ length: state.maxRounds }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full ${
                i < player.roundWins ? 'bg-amber-500' : 'bg-surface-border'
              }`}
            />
          ))}
        </div>
      </div>
      {isActive && <Swords className="h-3.5 w-3.5 shrink-0 text-amber-500 animate-pulse" />}
    </div>
  );
}

function phaseLabel(state: PenFightState): string {
  const active = state.players[state.activePlayer];
  switch (state.phase) {
    case 'aiming':
      return active.isAI
        ? `${active.displayName} is aiming…`
        : 'Drag your pen, then release to flick';
    case 'flicking':
    case 'settling':
      return 'Resolving the flick…';
    case 'round-over':
      return 'Round complete';
    case 'match-over':
      return 'Match complete';
    default:
      return '';
  }
}

export function PenFightHUD({ state, onOpenSetup, onResetPositions }: PenFightHUDProps) {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);
  const { roomCode } = useMultiplayerStore();

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <Link
          href="/games"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-surface-border/70 bg-surface-raised/80 px-3 py-2 text-xs font-medium text-deck-500 backdrop-blur-md transition-colors hover:text-deck-900 dark:hover:text-white"
        >
          <ArrowLeft className={ICON_SM} />
          <span className="hidden sm:inline">Back to games</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-surface-border/70 bg-surface-raised/80 px-4 py-2 text-center backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 font-display">
              Pen Fight
            </span>
            <span className="text-[11px] font-medium text-deck-500">
              Round {state.round} / {state.maxRounds}
            </span>
          </div>

          {/* Speed Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-surface-border/70 bg-surface-raised/80 px-3 py-2 text-xs font-bold text-deck-300 backdrop-blur-md">
            {state.speedMode === 'slow' ? (
              <>
                <Turtle className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-cyan-300">Slow</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300">Normal</span>
              </>
            )}
          </div>

          {/* Online Room Badge */}
          {state.mode === 'online' && roomCode && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono">{roomCode}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSound()}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border/70 bg-surface-raised/80 text-deck-500 backdrop-blur-md transition-colors hover:text-deck-900 dark:hover:text-white"
          >
            {soundEnabled ? <Volume2 className={ICON_SM} /> : <VolumeX className={ICON_SM} />}
          </button>
          <button
            type="button"
            onClick={onOpenSetup}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-surface-border/70 bg-surface-raised/80 px-3 py-2 text-xs font-medium text-deck-500 backdrop-blur-md transition-colors hover:text-deck-900 dark:hover:text-white"
          >
            <Settings className={ICON_SM} />
            <span className="hidden sm:inline">Match Setup</span>
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <PlayerCard state={state} playerId="p1" align="left" />

        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <span className="rounded-full border border-surface-border/70 bg-surface-raised/80 px-4 py-1.5 text-xs font-semibold text-deck-700 dark:text-deck-200 backdrop-blur-md">
            {phaseLabel(state)}
          </span>
          {state.phase === 'aiming' && (
            <button
              type="button"
              onClick={onResetPositions}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-surface-border/70 bg-surface-raised/60 px-3 py-1 text-[11px] font-medium text-deck-500 backdrop-blur-md transition-colors hover:text-deck-900 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Re-center pens
            </button>
          )}
        </div>

        <PlayerCard state={state} playerId="p2" align="right" />
      </div>
    </div>
  );
}
