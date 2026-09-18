'use client';

import { Bot, Crown, ShieldCheck, Skull } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { SEAT_BOT } from '../engine/push-your-luck-constants';
import { progressPercent } from '../engine/push-your-luck-utils';
import type { PushYourLuckSeat } from '../types/push-your-luck.types';

export interface PushYourLuckScoreboardProps {
  seats: PushYourLuckSeat[];
  activeSeat: number;
  targetScore: number;
  winnerId: string | null;
  stolenFrom: string | null;
}

interface SeatRowProps {
  seat: PushYourLuckSeat;
  isActive: boolean;
  isWinner: boolean;
  wasRobbed: boolean;
  targetScore: number;
}

function SeatRow({ seat, isActive, isWinner, wasRobbed, targetScore }: SeatRowProps) {
  const percent = progressPercent(seat.banked, targetScore);

  return (
    <li
      className={cn(
        'rounded-xl border px-3 py-2.5 transition-colors',
        isActive
          ? 'border-amber-500/70 bg-amber-500/10'
          : 'border-surface-border bg-surface-raised',
        wasRobbed && 'border-fuchsia-500/60',
      )}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none" aria-hidden="true">
          {seat.avatar}
        </span>
        <span className="flex-1 min-w-0 truncate text-sm font-bold text-deck-900 dark:text-white">
          {seat.name}
        </span>
        {seat.kind === SEAT_BOT && (
          <>
            <Bot className="w-3.5 h-3.5 text-deck-500" aria-hidden="true" />
            <span className="sr-only">Deck bot</span>
          </>
        )}
        {isWinner && <Crown className="w-4 h-4 text-amber-400" />}
        <span className="text-sm font-black tabular-nums text-amber-400 font-display">
          {seat.banked}
        </span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-surface-overlay overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isActive ? 'bg-amber-400' : 'bg-deck-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-deck-500">
        <span>
          {percent}% of {targetScore}
          {isActive && ' · at the table'}
        </span>
        <span className="flex items-center gap-2">
          {seat.insurance > 0 && (
            <span className="flex items-center gap-0.5 text-sky-400">
              <ShieldCheck className="w-3 h-3" />
              {seat.insurance}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Skull className="w-3 h-3" />
            {seat.busts}
          </span>
        </span>
      </div>
    </li>
  );
}

export function PushYourLuckScoreboard({
  seats,
  activeSeat,
  targetScore,
  winnerId,
  stolenFrom,
}: PushYourLuckScoreboardProps) {
  return (
    <section className="w-full rounded-xl border border-surface-border bg-surface-overlay/60 p-3">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
        Table · first to {targetScore}
      </h2>
      <ul className="flex flex-col gap-2">
        {seats.map((seat, index) => (
          <SeatRow
            key={seat.id}
            seat={seat}
            isActive={index === activeSeat && !winnerId}
            isWinner={seat.id === winnerId}
            wasRobbed={seat.id === stolenFrom}
            targetScore={targetScore}
          />
        ))}
      </ul>
    </section>
  );
}
