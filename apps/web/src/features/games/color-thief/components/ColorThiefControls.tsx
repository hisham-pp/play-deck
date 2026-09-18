'use client';

import { Droplets, LogOut, Pause, Play, RotateCcw, SkipForward, Sparkles, X } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { STATUS_PAUSED } from '../engine/color-thief-constants';
import type { ColorThiefAbility, ColorThiefGameState } from '../types/color-thief.types';

export interface ColorThiefControlsProps {
  state: ColorThiefGameState;
  ability: ColorThiefAbility | null;
  abilityReady: boolean;
  isTargeting: boolean;
  /** Plain-language prompt while an ability is being aimed. */
  targetPrompt: string | null;
  canAct: boolean;
  canPause: boolean;
  canRestart: boolean;
  onToggleAbility: () => void;
  onEndTurn: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onLeave: () => void;
}

function abilityHint(
  ability: ColorThiefAbility,
  state: ColorThiefGameState,
  ready: boolean,
): string {
  if (ability.kind === 'passive') return 'Passive — it works on its own';
  const player = state.players.find((p) => p.seatIndex === state.currentTurnSeatIndex);
  if (player && state.round < player.abilityReadyOnRound) {
    return `Ready in round ${player.abilityReadyOnRound}`;
  }
  if (!ready) return `Needs ${ability.paintCost} paint`;
  return ability.description;
}

export function ColorThiefControls({
  state,
  ability,
  abilityReady,
  isTargeting,
  targetPrompt,
  canAct,
  canPause,
  canRestart,
  onToggleAbility,
  onEndTurn,
  onPause,
  onResume,
  onRestart,
  onLeave,
}: ColorThiefControlsProps) {
  const isPaused = state.status === STATUS_PAUSED;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Droplets className="h-4 w-4 text-amber-400" aria-hidden="true" />
          <span>
            Paint <span className="font-mono text-amber-400">{state.paintRemaining}</span>
          </span>
        </span>
        <span className="text-xs text-slate-500">
          Round {state.round} / {state.settings.totalRounds}
        </span>
      </div>

      {ability && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-200">{ability.name}</span>
            {ability.kind === 'active' && (
              <span className="font-mono text-[11px] text-slate-500">
                {ability.paintCost} paint
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {abilityHint(ability, state, abilityReady)}
          </p>

          {ability.kind === 'active' && (
            <Button
              size="sm"
              variant={isTargeting ? 'outline' : 'primary'}
              onClick={onToggleAbility}
              disabled={!canAct || (!abilityReady && !isTargeting)}
              className="mt-2 w-full"
            >
              {isTargeting ? (
                <>
                  <X className="mr-1.5 h-4 w-4" /> Cancel aim
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" /> Use {ability.name}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {targetPrompt && (
        <p
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300"
        >
          {targetPrompt}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onEndTurn} disabled={!canAct} className="flex-1">
          <SkipForward className="mr-1.5 h-4 w-4" /> End turn
        </Button>

        {canPause && (
          <Button size="sm" variant="outline" onClick={isPaused ? onResume : onPause}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span className="sr-only">{isPaused ? 'Resume match' : 'Pause match'}</span>
          </Button>
        )}

        {canRestart && (
          <Button size="sm" variant="outline" onClick={onRestart} aria-label="Restart match">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={onLeave} aria-label="Leave match">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Arrow keys or WASD move across the grid, Enter claims,{' '}
        <kbd className="font-mono text-slate-500">Q</kbd> aims your ability,{' '}
        <kbd className="font-mono text-slate-500">E</kbd> ends the turn.
      </p>
    </div>
  );
}
