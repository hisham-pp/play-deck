'use client';

import { Dices } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@playdeck/ui';
import { STATUS_PLAYING } from '../engine/ludo-constants';
import type { LudoGameState } from '../types/ludo.types';
import { isPlainKeypress, isTypingTarget } from '../utils/keyboard';

interface LudoDiceProps {
  state: LudoGameState;
  isMyTurn: boolean;
  isSettling: boolean;
  onRollDice: () => void;
  /** How many pieces can legally move right now, i.e. how many hotkeys are live. */
  moveOptionCount?: number;
}

const TUMBLE_TICK_MS = 60;
const ROLL_KEYS = new Set([' ', 'Spacebar', 'r', 'R']);

function isRollKey(event: KeyboardEvent): boolean {
  return isPlainKeypress(event) && ROLL_KEYS.has(event.key) && !isTypingTarget();
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-300">
      {children}
    </kbd>
  );
}

interface TurnHintProps {
  phase: LudoGameState['turnPhase'];
  canRoll: boolean;
  moveOptionCount: number;
}

function TurnHint({ phase, canRoll, moveOptionCount }: TurnHintProps) {
  if (phase === 'turn-end') return <>Passing turn...</>;

  if (phase === 'awaiting-move') {
    if (moveOptionCount < 1) return <>Select a glowing piece on the board to move.</>;
    return (
      <>
        Press <Key>{moveOptionCount > 1 ? `1–${moveOptionCount}` : '1'}</Key> or click the numbered
        piece
      </>
    );
  }

  if (!canRoll) return null;
  return (
    <>
      Press <Key>Space</Key> or <Key>R</Key> to roll
    </>
  );
}

export function LudoDice({
  state,
  isMyTurn,
  isSettling,
  onRollDice,
  moveOptionCount = 0,
}: LudoDiceProps) {
  const canRoll =
    isMyTurn &&
    !isSettling &&
    state.turnPhase === 'awaiting-roll' &&
    state.status === STATUS_PLAYING;

  const settledValue = state.dice.value;
  const [tumblingFace, setTumblingFace] = useState<number | null>(null);

  // The readout shuffles for exactly as long as the physics die is in flight, so
  // the number here can never contradict the face the die comes to rest on.
  useEffect(() => {
    if (!isSettling) {
      setTumblingFace(null);
      return;
    }
    const ticker = setInterval(() => {
      setTumblingFace(Math.floor(Math.random() * 6) + 1);
    }, TUMBLE_TICK_MS);
    return () => clearInterval(ticker);
  }, [isSettling]);

  useEffect(() => {
    if (!canRoll) return;
    const onKey = (e: KeyboardEvent) => {
      if (!isRollKey(e)) return;
      e.preventDefault();
      onRollDice();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canRoll, onRollDice]);

  const isTumbling = isSettling;
  const shownValue = isSettling ? (tumblingFace ?? settledValue) : settledValue;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center gap-4">
        <div
          aria-live="polite"
          className={`w-16 h-16 rounded-xl bg-slate-950 border-2 flex items-center justify-center text-3xl font-black text-amber-400 shadow-inner ${
            isTumbling ? 'dice-tumble border-amber-400' : 'border-amber-500/40'
          }`}
        >
          {shownValue ?? '-'}
        </div>

        <Button
          size="lg"
          onClick={onRollDice}
          disabled={!canRoll}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-6 text-lg shadow-lg disabled:opacity-50"
        >
          <Dices className={`w-6 h-6 mr-2 ${canRoll ? 'animate-bounce' : ''}`} />
          Roll Dice
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        <TurnHint phase={state.turnPhase} canRoll={canRoll} moveOptionCount={moveOptionCount} />
      </p>
    </div>
  );
}
