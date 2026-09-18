'use client';

import { Bot, HandCoins, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { OUTCOME_BUST, SEAT_BOT } from '../engine/push-your-luck-constants';
import { activeSeatOf } from '../engine/push-your-luck-utils';
import type { PushYourLuckState } from '../types/push-your-luck.types';
import { PushYourLuckDrawCard } from './PushYourLuckDrawCard';
import { PushYourLuckRiskMeter } from './PushYourLuckRiskMeter';

export interface PushYourLuckTableProps {
  state: PushYourLuckState;
  reducedMotion: boolean;
  onPush: () => void;
  onBank: () => void;
}

function turnHeadline(state: PushYourLuckState): string {
  const seat = activeSeatOf(state);
  if (state.turn.resolved === OUTCOME_BUST) return `${seat.name} busted`;
  if (state.turn.resolved) return `${seat.name} banked ${state.turn.pot}`;
  if (seat.kind === SEAT_BOT) return `${seat.name} is deciding…`;
  return `${seat.name}, push or bank?`;
}

export function PushYourLuckTable({
  state,
  reducedMotion,
  onPush,
  onBank,
}: PushYourLuckTableProps) {
  const seat = activeSeatOf(state);
  const isBotSeat = seat.kind === SEAT_BOT;
  const canAct = !state.turn.resolved && !isBotSeat;
  const busted = state.turn.resolved === OUTCOME_BUST;

  return (
    <section className="w-full rounded-2xl border border-surface-border bg-surface-base/60 arcade-texture p-4 sm:p-5 flex flex-col items-center gap-4 shadow-arcade">
      <header className="w-full flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
          Round {state.round}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-deck-900 dark:text-white">
          {isBotSeat && <Bot className="w-4 h-4 text-deck-500" />}
          <span aria-hidden="true">{seat.avatar}</span>
          <span>{turnHeadline(state)}</span>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
          Draw {state.turn.draws}
        </span>
      </header>

      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-5">
        <PushYourLuckDrawCard
          card={state.lastCard}
          outcome={state.lastOutcome}
          reducedMotion={reducedMotion}
        />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
            Pot at risk
          </span>
          <span
            className={cn(
              'text-5xl sm:text-6xl font-black font-display tabular-nums leading-none',
              busted ? 'text-rose-500 line-through' : 'text-amber-400',
            )}
          >
            {busted ? 0 : state.turn.pot}
          </span>
          <span className="text-[11px] text-deck-500">
            Safe total {seat.banked} · needs {Math.max(0, state.targetScore - seat.banked)}
          </span>
        </div>
      </div>

      <PushYourLuckRiskMeter bustChance={state.bustChance} insurance={seat.insurance} />

      <div className="w-full grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="lg"
          disabled={!canAct}
          onClick={onPush}
          className="flex items-center justify-center gap-2"
          aria-keyshortcuts="P"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Push</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={!canAct || state.turn.pot <= 0}
          onClick={onBank}
          className="flex items-center justify-center gap-2"
          aria-keyshortcuts="B"
        >
          <HandCoins className="w-4 h-4" />
          <span>Bank {state.turn.pot > 0 ? state.turn.pot : ''}</span>
        </Button>
      </div>
    </section>
  );
}
