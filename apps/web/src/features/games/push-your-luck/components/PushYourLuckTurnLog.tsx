'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { OUTCOME_BUST, OUTCOME_SAVED } from '../engine/push-your-luck-constants';
import type { TurnEvent } from '../types/push-your-luck.types';

export interface PushYourLuckTurnLogProps {
  events: TurnEvent[];
}

function outcomeTone(event: TurnEvent): string {
  if (event.outcome === OUTCOME_BUST) return 'text-rose-400';
  if (event.outcome === OUTCOME_SAVED) return 'text-sky-400';
  return 'text-deck-800 dark:text-deck-200';
}

export function PushYourLuckTurnLog({ events }: PushYourLuckTurnLogProps) {
  return (
    <section className="w-full rounded-xl border border-surface-border bg-surface-overlay/60 p-3">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
        This turn
      </h2>

      {events.length === 0 ? (
        <p className="text-[11px] text-deck-500">
          Nothing drawn yet. The first card of a turn can never bust.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {events.map((event, index) => (
            <li
              key={`${index}-${event.card.label}`}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="w-4 shrink-0 text-deck-600 tabular-nums">{index + 1}.</span>
                <span className={cn('truncate font-semibold', outcomeTone(event))}>
                  {event.outcome === OUTCOME_SAVED ? 'Bust absorbed' : event.card.label}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-deck-500">pot {event.potAfter}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
