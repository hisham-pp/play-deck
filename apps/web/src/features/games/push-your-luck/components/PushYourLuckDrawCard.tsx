'use client';

import { Coins, Layers, ShieldCheck, Skull, Sparkles, Swords } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import {
  KIND_BUST,
  KIND_INSURANCE,
  KIND_MULTIPLIER,
  KIND_POINTS,
  KIND_STEAL,
} from '../engine/push-your-luck-constants';
import type { DrawCard, DrawKind, TurnOutcome } from '../types/push-your-luck.types';

export interface PushYourLuckDrawCardProps {
  card: DrawCard | null;
  outcome: TurnOutcome | null;
  reducedMotion: boolean;
}

interface CardFace {
  icon: React.ComponentType<{ className?: string }>;
  frame: string;
  accent: string;
}

const FACES: Record<DrawKind, CardFace> = {
  [KIND_POINTS]: {
    icon: Coins,
    frame: 'border-emerald-500/60 bg-emerald-500/10',
    accent: 'text-emerald-400',
  },
  [KIND_MULTIPLIER]: {
    icon: Sparkles,
    frame: 'border-amber-400/70 bg-amber-400/10',
    accent: 'text-amber-300',
  },
  [KIND_STEAL]: {
    icon: Swords,
    frame: 'border-fuchsia-500/60 bg-fuchsia-500/10',
    accent: 'text-fuchsia-400',
  },
  [KIND_INSURANCE]: {
    icon: ShieldCheck,
    frame: 'border-sky-500/60 bg-sky-500/10',
    accent: 'text-sky-400',
  },
  [KIND_BUST]: {
    icon: Skull,
    frame: 'border-rose-600/70 bg-rose-600/15',
    accent: 'text-rose-400',
  },
};

const SAVED_FACE: CardFace = {
  icon: ShieldCheck,
  frame: 'border-sky-400/70 bg-sky-500/15',
  accent: 'text-sky-300',
};

/** The single card face at the centre of the table — the last thing drawn. */
export function PushYourLuckDrawCard({ card, outcome, reducedMotion }: PushYourLuckDrawCardProps) {
  if (!card) {
    return (
      <div className="w-36 h-52 sm:w-40 sm:h-56 rounded-2xl border-2 border-dashed border-surface-border bg-surface-overlay/60 flex flex-col items-center justify-center gap-2 text-deck-500">
        <Layers className="w-8 h-8" />
        <span className="text-[11px] font-semibold uppercase tracking-wider font-display">
          Risk deck
        </span>
        <span className="text-[10px] text-deck-600">First draw is free</span>
      </div>
    );
  }

  const face = outcome === 'saved' ? SAVED_FACE : FACES[card.kind];
  const Icon = face.icon;
  const isBust = outcome === 'bust';

  return (
    <div
      className={cn(
        'w-36 h-52 sm:w-40 sm:h-56 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 px-3 text-center shadow-arcade',
        face.frame,
        !reducedMotion && 'animate-in fade-in zoom-in-95 duration-300',
        !reducedMotion && isBust && 'animate-pulse',
      )}
    >
      <Icon className={cn('w-9 h-9', face.accent)} />
      <span className={cn('text-2xl font-black font-display tracking-tight', face.accent)}>
        {outcome === 'saved' ? 'Saved' : card.label}
      </span>
      <span className="text-[11px] leading-snug text-deck-400">
        {outcome === 'saved' ? 'Insurance absorbed the bust' : card.detail}
      </span>
    </div>
  );
}
