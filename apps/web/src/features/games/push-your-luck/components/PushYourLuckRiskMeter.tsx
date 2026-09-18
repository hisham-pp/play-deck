'use client';

import { Flame, ShieldCheck } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { formatBustChance, riskLevel } from '../engine/push-your-luck-utils';

export interface PushYourLuckRiskMeterProps {
  bustChance: number;
  insurance: number;
}

const SEGMENTS = 12;

interface RiskBand {
  label: string;
  bar: string;
  text: string;
}

function bandFor(level: number): RiskBand {
  if (level < 0.2) return { label: 'Safe', bar: 'bg-emerald-500', text: 'text-emerald-400' };
  if (level < 0.45) return { label: 'Warm', bar: 'bg-amber-400', text: 'text-amber-300' };
  if (level < 0.7) return { label: 'Hot', bar: 'bg-orange-500', text: 'text-orange-400' };
  return { label: 'Critical', bar: 'bg-rose-500', text: 'text-rose-400' };
}

export function PushYourLuckRiskMeter({ bustChance, insurance }: PushYourLuckRiskMeterProps) {
  const level = riskLevel(bustChance);
  const band = bandFor(level);
  const lit = Math.round(level * SEGMENTS);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-display">
        <span className="flex items-center gap-1.5 text-deck-500">
          <Flame className="w-3.5 h-3.5" />
          <span>Bust risk</span>
        </span>
        <span className={cn('font-bold tabular-nums', band.text)}>
          {formatBustChance(bustChance)} · {band.label}
        </span>
      </div>

      <div
        className="flex items-center gap-1"
        role="meter"
        aria-valuenow={Math.round(bustChance * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Chance the next push busts: ${formatBustChance(bustChance)}`}
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-2.5 flex-1 rounded-sm transition-colors duration-300',
              index < lit ? band.bar : 'bg-surface-overlay border border-surface-border',
            )}
          />
        ))}
      </div>

      {insurance > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Insurance ×{insurance} — the next bust is absorbed</span>
        </p>
      )}
    </div>
  );
}
