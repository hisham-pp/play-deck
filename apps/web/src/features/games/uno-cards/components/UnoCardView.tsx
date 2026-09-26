'use client';

import React from 'react';
import { COLOR_SYMBOLS, type Card, type CardColor } from '../engine/uno-cards-engine';

interface UnoCardViewProps {
  card: Card;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isFaceDown?: boolean;
}

const COLOR_CLASSES: Record<
  CardColor,
  { bg: string; border: string; text: string; badge: string }
> = {
  red: {
    bg: 'bg-gradient-to-br from-rose-500 to-red-700',
    border: 'border-rose-400',
    text: 'text-rose-100',
    badge: 'bg-red-900/60 text-red-200',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-500 to-blue-700',
    border: 'border-sky-400',
    text: 'text-sky-100',
    badge: 'bg-blue-900/60 text-blue-200',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 to-green-700',
    border: 'border-emerald-400',
    text: 'text-emerald-100',
    badge: 'bg-emerald-900/60 text-emerald-200',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    border: 'border-amber-300',
    text: 'text-amber-950',
    badge: 'bg-amber-900/40 text-amber-950 font-black',
  },
  wild: {
    bg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-black',
    border: 'border-amber-400 shadow-amber-400/40',
    text: 'text-amber-300',
    badge: 'bg-purple-900/80 text-amber-300',
  },
};

export function UnoCardView({
  card,
  isPlayable = false,
  onClick,
  size = 'md',
  isFaceDown = false,
}: UnoCardViewProps) {
  const styles = COLOR_CLASSES[card.color];

  const sizeClasses = {
    sm: 'w-12 h-18 text-xs',
    md: 'w-18 h-26 sm:w-20 sm:h-28 text-sm',
    lg: 'w-24 h-36 sm:w-28 sm:h-40 text-base',
  }[size];

  if (isFaceDown) {
    return (
      <div
        className={`${sizeClasses} relative flex flex-col items-center justify-center rounded-xl border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-1 shadow-lg shadow-black/60 select-none`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-700/60 bg-red-950/40">
          <span className="font-mono text-xs font-black tracking-widest text-red-500/70">PLAY</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={isPlayable ? onClick : undefined}
      disabled={!isPlayable && !!onClick}
      aria-label={`${card.color} ${card.symbol}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 ${styles.border} ${styles.bg} p-1.5 shadow-xl transition-all duration-150 select-none ${sizeClasses} ${
        isPlayable
          ? 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:shadow-amber-400/30 ring-2 ring-amber-400 active:scale-95'
          : onClick
            ? 'opacity-60 cursor-not-allowed'
            : ''
      }`}
    >
      {/* Top Left Corner Stamp */}
      <div className="flex items-center gap-0.5 leading-none">
        <span className="font-mono text-xs font-black">{card.symbol}</span>
        <span className="text-[10px] opacity-80">{COLOR_SYMBOLS[card.color]}</span>
      </div>

      {/* Center Main Symbol Oval */}
      <div className="flex h-11 w-full items-center justify-center self-center rounded-full bg-white/15 backdrop-blur-[1px] shadow-inner">
        {card.color === 'wild' ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xl font-black text-amber-300 drop-shadow-md">
              {card.type === 'wild_draw4' ? '+4' : '★'}
            </span>
            <div className="flex gap-0.5 text-[8px]">
              <span className="text-rose-400">◆</span>
              <span className="text-sky-400">●</span>
              <span className="text-emerald-400">▲</span>
              <span className="text-amber-400">★</span>
            </div>
          </div>
        ) : (
          <span
            className={`font-mono text-2xl font-black drop-shadow-md ${
              card.color === 'yellow' ? 'text-amber-950' : 'text-white'
            }`}
          >
            {card.symbol}
          </span>
        )}
      </div>

      {/* Bottom Right Inverted Stamp */}
      <div className="flex items-center justify-end gap-0.5 leading-none self-end">
        <span className="text-[10px] opacity-80">{COLOR_SYMBOLS[card.color]}</span>
        <span className="font-mono text-xs font-black">{card.symbol}</span>
      </div>

      {/* Playable indicator shimmer */}
      {isPlayable && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
        </span>
      )}
    </button>
  );
}
