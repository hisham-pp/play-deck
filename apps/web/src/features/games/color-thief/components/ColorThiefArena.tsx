'use client';

import { ArrowLeft, Contrast } from 'lucide-react';
import Link from 'next/link';
import React, { type KeyboardEvent } from 'react';
import { Button } from '@playdeck/ui';
import type { ColorThiefAbility } from '../types/color-thief.types';
import type {
  ColorThiefGameState,
  ColorThiefScore,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { ColorThiefBoard } from './ColorThiefBoard';
import { ColorThiefControls } from './ColorThiefControls';
import { ColorThiefScoreboard } from './ColorThiefScoreboard';
import { ColorThiefTurnLog } from './ColorThiefTurnLog';

export interface ColorThiefArenaProps {
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  scores: ColorThiefScore[];
  ability: ColorThiefAbility | null;
  abilityReady: boolean;
  isTargeting: boolean;
  targetPrompt: string | null;
  selectedTargets: number[];
  focusedIndex: number;
  canAct: boolean;
  canPause: boolean;
  canRestart: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  thinkingSeatIndex: number | null;
  localPlayerId: string | null;
  onSelectTile: (index: number) => void;
  onFocusTile: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  registerTile: (index: number) => (node: HTMLButtonElement | null) => void;
  onToggleAbility: () => void;
  onToggleContrast: () => void;
  onEndTurn: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onLeave: () => void;
}

/** Board on the left, standings and controls beside it — one column on a phone. */
export function ColorThiefArena(props: ColorThiefArenaProps) {
  const { state, seats, scores, thinkingSeatIndex, localPlayerId, highContrast } = props;
  const actingSeatIndex = state.currentTurnSeatIndex;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-2">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to games</span>
        </Link>

        <Button
          size="sm"
          variant="ghost"
          onClick={props.onToggleContrast}
          aria-pressed={highContrast}
        >
          <Contrast className="mr-1.5 h-4 w-4" />
          <span className="text-xs">High contrast {highContrast ? 'on' : 'off'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col items-center gap-3">
          <ColorThiefBoard
            state={state}
            seats={seats}
            actingSeatIndex={actingSeatIndex}
            isTargeting={props.isTargeting}
            selectedTargets={props.selectedTargets}
            focusedIndex={props.focusedIndex}
            interactive={props.canAct}
            highContrast={highContrast}
            reducedMotion={props.reducedMotion}
            onSelectTile={props.onSelectTile}
            onFocusTile={props.onFocusTile}
            onKeyDown={props.onKeyDown}
            registerTile={props.registerTile}
          />
          <ColorThiefTurnLog log={state.log} seats={seats} />
        </div>

        <div className="flex flex-col gap-4">
          <ColorThiefScoreboard
            state={state}
            seats={seats}
            scores={scores}
            thinkingSeatIndex={thinkingSeatIndex}
            localPlayerId={localPlayerId}
          />
          <ColorThiefControls
            state={state}
            ability={props.ability}
            abilityReady={props.abilityReady}
            isTargeting={props.isTargeting}
            targetPrompt={props.targetPrompt}
            canAct={props.canAct}
            canPause={props.canPause}
            canRestart={props.canRestart}
            onToggleAbility={props.onToggleAbility}
            onEndTurn={props.onEndTurn}
            onPause={props.onPause}
            onResume={props.onResume}
            onRestart={props.onRestart}
            onLeave={props.onLeave}
          />
        </div>
      </div>
    </div>
  );
}
