'use client';

import { Zap } from 'lucide-react';
import React from 'react';
import {
  CARD_COLOR_BLUE,
  CARD_COLOR_GREEN,
  CARD_COLOR_RED,
  COLOR_NAMES,
  COLOR_SYMBOLS,
  type Card,
  type CardColor,
  type UnoGameState,
  type UnoPlayer,
} from '../types/uno-cards.types';
import { UnoCardView } from './UnoCardView';

const GLOW_COLORS: Record<CardColor, string> = {
  [CARD_COLOR_RED]: 'bg-rose-500',
  [CARD_COLOR_BLUE]: 'bg-sky-500',
  [CARD_COLOR_GREEN]: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  wild: 'bg-amber-400',
};

interface UnoCenterTableProps {
  gameState: UnoGameState;
  topDiscard: Card;
  activePlayer: UnoPlayer;
  humanPlayer: UnoPlayer;
  onDraw: () => void;
  onPass: () => void;
  onCallLastCard: (id: string) => void;
}

export function UnoCenterTable({
  gameState,
  topDiscard,
  activePlayer,
  humanPlayer,
  onDraw,
  onPass,
  onCallLastCard,
}: UnoCenterTableProps) {
  return (
    <>
      {/* Center Arena: Draw Pile & Discard Pile */}
      <div className="my-6 flex items-center justify-center gap-8 sm:gap-14">
        {/* Draw Deck */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDraw}
            disabled={activePlayer.isBot || gameState.hasDrawnThisTurn}
            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none group"
          >
            <div className="absolute top-1 left-1 h-full w-full rounded-xl bg-slate-800" />
            <div className="absolute top-2 left-2 h-full w-full rounded-xl bg-slate-900" />
            <UnoCardView card={topDiscard} isFaceDown size="lg" />
            <span className="absolute -bottom-2 -right-2 rounded-full border border-amber-400 bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-black text-amber-400 shadow">
              {gameState.deck.length}
            </span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Draw Pile
          </span>
        </div>

        {/* Active Discard Pile */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className={`absolute -inset-3 rounded-2xl opacity-40 blur-lg transition-colors ${GLOW_COLORS[gameState.activeColor] ?? 'bg-amber-400'}`}
            />
            <UnoCardView card={topDiscard} size="lg" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-bold text-slate-200">
            <span className="text-sm">{COLOR_SYMBOLS[gameState.activeColor]}</span>
            <span>{COLOR_NAMES[gameState.activeColor]}</span>
            <span className="font-mono text-slate-500">
              ({gameState.direction === 1 ? '↻ CW' : '↺ CCW'})
            </span>
          </div>
        </div>
      </div>

      {/* Player Action Buttons Bar */}
      <div className="mb-3 flex items-center justify-between gap-3 w-full max-w-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onDraw}
            disabled={activePlayer.isBot || gameState.hasDrawnThisTurn}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 shadow transition-all hover:bg-slate-700 disabled:opacity-40"
          >
            Draw Card
          </button>
          {gameState.hasDrawnThisTurn && !activePlayer.isBot && (
            <button
              onClick={onPass}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow transition-all hover:bg-amber-500/30"
            >
              Pass Turn
            </button>
          )}
        </div>

        {/* Last Card Shout Button */}
        {humanPlayer.hand.length <= 2 && (
          <button
            onClick={() => onCallLastCard(humanPlayer.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
              humanPlayer.hasCalledLastCard
                ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500 bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse'
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            {humanPlayer.hasCalledLastCard ? '✓ Last Card Called!' : 'Call "Last Card!"'}
          </button>
        )}
      </div>
    </>
  );
}
