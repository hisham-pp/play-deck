'use client';

import React from 'react';
import type { PushYourLuckState } from '../types/push-your-luck.types';
import { PushYourLuckControlsCard } from './PushYourLuckControlsCard';
import { PushYourLuckScoreboard } from './PushYourLuckScoreboard';
import { PushYourLuckTable } from './PushYourLuckTable';
import { PushYourLuckTurnLog } from './PushYourLuckTurnLog';

export interface PushYourLuckArenaProps {
  state: PushYourLuckState;
  reducedMotion: boolean;
  onPush: () => void;
  onBank: () => void;
  onNewMatch: () => void;
  onOpenSetup: () => void;
}

export function PushYourLuckArena({
  state,
  reducedMotion,
  onPush,
  onBank,
  onNewMatch,
  onOpenSetup,
}: PushYourLuckArenaProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_240px] items-start gap-3 lg:gap-4">
      <div className="md:col-start-1 md:row-start-1 flex flex-col gap-3">
        <PushYourLuckScoreboard
          seats={state.seats}
          activeSeat={state.activeSeat}
          targetScore={state.targetScore}
          winnerId={state.winnerId}
          stolenFrom={state.stolenFrom}
        />
      </div>

      <div className="md:col-start-2 md:row-start-1">
        <PushYourLuckTable
          state={state}
          reducedMotion={reducedMotion}
          onPush={onPush}
          onBank={onBank}
        />
      </div>

      <div className="md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 flex flex-col gap-3">
        <PushYourLuckTurnLog events={state.turn.events} />
        <PushYourLuckControlsCard onNewMatch={onNewMatch} onOpenSetup={onOpenSetup} />
      </div>
    </div>
  );
}
