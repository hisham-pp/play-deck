'use client';

import { Radio, Wrench } from 'lucide-react';
import React from 'react';
import { CHANNEL_ROLES } from '../engine/bomb-factory-constants';
import type { BombFactorySeat, DistributionPlan } from '../types/bomb-factory.types';

interface BombFactoryCrewProps {
  seats: BombFactorySeat[];
  plan: DistributionPlan;
  operatorSeatId: string | null;
  localSeatId: string | null;
}

/**
 * The roster, including who holds which slice. Who to ask is public — what they
 * would answer is not — so showing the roles here gives nothing away.
 */
export function BombFactoryCrew({
  seats,
  plan,
  operatorSeatId,
  localSeatId,
}: BombFactoryCrewProps) {
  return (
    <section
      aria-label="Crew"
      className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised p-4"
    >
      <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-deck-900 dark:text-white">
        <Radio className="h-4 w-4 text-amber-400" aria-hidden="true" />
        Crew
      </h3>

      <ul className="flex flex-col gap-1.5">
        {seats.map((seat) => {
          const roles = [
            ...new Set(
              plan.filter((entry) => entry.seatId === seat.id).map((entry) => entry.channel),
            ),
          ].map((channel) => CHANNEL_ROLES[channel]);
          const isOperator = seat.id === operatorSeatId;

          return (
            <li
              key={seat.id}
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                isOperator
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-surface-border bg-surface-overlay'
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {seat.avatar}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-deck-200">
                  {seat.displayName}
                  {seat.id === localSeatId && (
                    <span className="ml-1 text-[10px] font-bold text-amber-300">(you)</span>
                  )}
                </span>
                <span className="block truncate text-[10px] uppercase tracking-wide text-deck-500">
                  {roles.length > 0 ? roles.join(' · ') : 'Floor runner'}
                </span>
              </span>
              {isOperator && (
                <Wrench
                  className="h-3.5 w-3.5 shrink-0 text-amber-300"
                  aria-label="Has the wrench"
                />
              )}
              {seat.status === 'disconnected' && (
                <span className="shrink-0 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-300">
                  Away
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
