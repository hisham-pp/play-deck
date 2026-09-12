'use client';

import { Dices } from 'lucide-react';
import { Button } from '@playdeck/ui';
import type { LudoGameState } from '../types/ludo.types';

interface LudoDiceProps {
  state: LudoGameState;
  isMyTurn: boolean;
  onRollDice: () => void;
}

export function LudoDice({ state, isMyTurn, onRollDice }: LudoDiceProps) {
  const canRoll = isMyTurn && state.turnPhase === 'awaiting-roll' && state.status === 'playing';

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center gap-4">
        <div
          aria-live="polite"
          className="w-16 h-16 rounded-xl bg-slate-950 border-2 border-amber-500/40 flex items-center justify-center text-3xl font-black text-amber-400 shadow-inner"
        >
          {state.dice.value ?? '-'}
        </div>

        <Button
          size="lg"
          onClick={onRollDice}
          disabled={!canRoll}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-6 text-lg shadow-lg disabled:opacity-50"
        >
          <Dices className="w-6 h-6 mr-2 animate-bounce" />
          Roll Dice
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        {state.turnPhase === 'awaiting-roll' && canRoll && 'Tap Roll Dice to take your turn!'}
        {state.turnPhase === 'awaiting-move' && 'Select a glowing piece on the board to move.'}
        {state.turnPhase === 'turn-end' && 'Passing turn...'}
      </p>
    </div>
  );
}
