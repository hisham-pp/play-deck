'use client';

import { RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import {
  CARD_COLOR_BLUE,
  CARD_COLOR_GREEN,
  CARD_COLOR_RED,
  CARD_COLOR_YELLOW,
  COLOR_SYMBOLS,
  GAME_STATUS_GAME_OVER,
  GAME_STATUS_ROUND_OVER,
  STANDARD_COLORS,
  type CardColor,
  type UnoGameState,
} from '../types/uno-cards.types';

const COLOR_BUTTON_STYLES: Record<CardColor, string> = {
  [CARD_COLOR_RED]: 'border-rose-400 bg-rose-600 text-white',
  [CARD_COLOR_BLUE]: 'border-sky-400 bg-sky-600 text-white',
  [CARD_COLOR_GREEN]: 'border-emerald-400 bg-emerald-600 text-white',
  [CARD_COLOR_YELLOW]: 'border-amber-300 bg-amber-400 text-slate-950 font-black',
  wild: '',
};

interface WildColorModalProps {
  onSelectColor: (color: CardColor) => void;
}

export function WildColorModal({ onSelectColor }: WildColorModalProps) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md">
      <h3 className="mb-2 text-xl font-black text-amber-400">Choose Wild Color</h3>
      <p className="mb-6 text-xs text-slate-300">Select the active color for the next player</p>

      <div className="grid grid-cols-2 gap-4">
        {STANDARD_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`flex h-20 w-32 flex-col items-center justify-center rounded-2xl border-2 p-3 font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg ${COLOR_BUTTON_STYLES[color]}`}
          >
            <span className="text-2xl">{COLOR_SYMBOLS[color]}</span>
            <span className="text-xs uppercase tracking-wider">{color}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface GameOverModalProps {
  gameState: UnoGameState;
  humanPlayerId: string;
  onRestart: () => void;
}

export function GameOverModal({ gameState, humanPlayerId, onRestart }: GameOverModalProps) {
  if (gameState.status !== GAME_STATUS_ROUND_OVER && gameState.status !== GAME_STATUS_GAME_OVER) {
    return null;
  }

  const isHumanWinner = gameState.winnerId === humanPlayerId;
  const winnerName = gameState.players.find((p) => p.id === gameState.winnerId)?.name;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-md">
      <Trophy className="mb-3 h-16 w-16 text-amber-400 animate-bounce" />
      <h2 className="text-3xl font-black text-white">
        {isHumanWinner ? 'Victory! You Won!' : `${winnerName} Won!`}
      </h2>
      <p className="mt-2 text-sm text-slate-300 max-w-md">{gameState.lastActionMessage}</p>

      <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
        {gameState.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs"
          >
            <span className="font-bold text-slate-200">{p.name}</span>
            <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
        Next Round
      </button>
    </div>
  );
}

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl">
        <h3 className="text-lg font-bold text-amber-400">UNO-Style Cards Rules</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-slate-300">
          <li>
            <strong>Object:</strong> Be the first player to shed all cards in your hand.
          </li>
          <li>
            <strong>Matching:</strong> Match the top discard card by Color, Number, or Action
            symbol.
          </li>
          <li>
            <strong>Action Cards:</strong>
            <ul className="list-circle pl-4 pt-1 space-y-1">
              <li>
                <strong>Skip (⊘):</strong> Next player misses their turn.
              </li>
              <li>
                <strong>Reverse (⇄):</strong> Changes the direction of play.
              </li>
              <li>
                <strong>Draw Two (+2):</strong> Next player draws 2 cards and misses their turn.
              </li>
              <li>
                <strong>Wild (★):</strong> Choose the active color for the next player.
              </li>
              <li>
                <strong>Wild Draw Four (+4):</strong> Choose color + victim draws 4 cards and loses
                turn.
              </li>
            </ul>
          </li>
          <li>
            <strong>Last Card:</strong> When down to 1 card, announce &quot;Last Card!&quot;
          </li>
          <li>
            <strong>Color-Blind Friendly:</strong> Every color is paired with a distinct geometric
            symbol (◆ Red, ● Blue, ▲ Green, ★ Yellow).
          </li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
