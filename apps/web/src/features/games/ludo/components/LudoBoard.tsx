'use client';

import dynamic from 'next/dynamic';
import type { LudoGameState } from '../types/ludo.types';

const LudoScene = dynamic(() => import('./three/LudoScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span>Initializing 3D Board & Physics...</span>
      </div>
    </div>
  ),
});

interface LudoBoardProps {
  state: LudoGameState;
  legalPieceIds: string[];
  numberedPieceIds: string[];
  onSelectPiece: (pieceId: string) => void;
  rolling: boolean;
  onRollSettled: () => void;
  onRollDice?: () => void;
}

export function LudoBoard({
  state,
  legalPieceIds,
  numberedPieceIds,
  onSelectPiece,
  rolling,
  onRollSettled,
  onRollDice,
}: LudoBoardProps) {
  return (
    <div className="absolute inset-0 bg-slate-950 group">
      <LudoScene
        state={state}
        legalPieceIds={legalPieceIds}
        numberedPieceIds={numberedPieceIds}
        onSelectPiece={onSelectPiece}
        rolling={rolling}
        diceTargetValue={state.dice.value}
        onRollComplete={onRollSettled}
        onRollDice={onRollDice}
      />

      <div className="absolute top-3 left-3 pointer-events-none px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-400 backdrop-blur opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
        <span>🎮 Drag to rotate 3D view</span>
        <span>•</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
}
