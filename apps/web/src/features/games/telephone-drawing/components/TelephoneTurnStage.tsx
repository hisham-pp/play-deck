'use client';

import { Clock, EyeOff, Palette, PenTool } from 'lucide-react';
import React from 'react';

import { Badge } from '@playdeck/ui';

import { getStepTypeForIndex } from '../engine/telephone-engine';
import type { TelephoneState } from '../types/telephone-drawing.types';
import { TelephoneCanvas } from './TelephoneCanvas';
import { TelephoneDescribe } from './TelephoneDescribe';

export interface TelephoneTurnStageProps {
  gameState: TelephoneState;
  localPlayerId: string;
  onSubmitDrawing: (drawingData: string) => void;
  onSubmitDescription: (description: string) => void;
}

export const TelephoneTurnStage: React.FC<TelephoneTurnStageProps> = ({
  gameState,
  localPlayerId,
  onSubmitDrawing,
  onSubmitDescription,
}) => {
  const {
    currentStepIndex,
    totalSteps,
    activePlayerId,
    players,
    steps,
    timeRemaining,
    initialPhrase,
  } = gameState;

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const isMyTurn = activePlayerId === localPlayerId;
  const stepType = getStepTypeForIndex(currentStepIndex);
  const previousStep = steps[steps.length - 1];

  // If it's my turn to draw
  if (isMyTurn && stepType === 'draw') {
    const promptToDraw =
      currentStepIndex === 0 ? initialPhrase : (previousStep?.description ?? initialPhrase);

    return (
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-2xl mb-3 text-xs text-slate-400 font-semibold px-1">
          <span>
            STEP {currentStepIndex + 1} OF {totalSteps}
          </span>
          <span className="text-amber-400 font-bold">YOUR TURN TO SKETCH!</span>
        </div>
        <TelephoneCanvas
          promptText={promptToDraw}
          timeRemaining={timeRemaining}
          onSubmit={onSubmitDrawing}
        />
      </div>
    );
  }

  // If it's my turn to describe
  if (isMyTurn && stepType === 'describe') {
    const drawingToDescribe = previousStep?.drawingData ?? '';

    return (
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-2xl mb-3 text-xs text-slate-400 font-semibold px-1">
          <span>
            STEP {currentStepIndex + 1} OF {totalSteps}
          </span>
          <span className="text-amber-400 font-bold">YOUR TURN TO DESCRIBE!</span>
        </div>
        <TelephoneDescribe
          previousDrawingData={drawingToDescribe}
          timeRemaining={timeRemaining}
          onSubmit={onSubmitDescription}
        />
      </div>
    );
  }

  // Spectator Waiting Screen (Keeping chain steps secret!)
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] w-full max-w-xl mx-auto p-8 bg-[#0c1322]/95 border border-amber-900/30 rounded-2xl shadow-2xl text-center space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
          Step {currentStepIndex + 1} of {totalSteps}
        </Badge>
        <Badge variant="outline" className="border-slate-700 text-slate-300">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {timeRemaining}s remaining
        </Badge>
      </div>

      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-amber-950/40 border-2 border-amber-500/50 flex items-center justify-center text-5xl shadow-lg animate-pulse">
          {activePlayer?.avatar ?? '🎨'}
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-slate-900 border border-amber-500 text-amber-400 shadow">
          {stepType === 'draw' ? <PenTool className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-amber-300">
          {activePlayer?.displayName ?? 'Someone'} is{' '}
          {stepType === 'draw' ? 'sketching' : 'guessing'}...
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          {stepType === 'draw'
            ? 'Creating their masterpiece in absolute secrecy.'
            : 'Staring intently at the drawing trying to make sense of it.'}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 py-2 px-4 rounded-full border border-slate-800">
        <EyeOff className="w-3.5 h-3.5 text-amber-400/80" />
        <span>Strict secrecy in effect — waiting for reveal phase</span>
      </div>

      {/* Roster Progress Mini-indicators */}
      <div className="w-full pt-4 border-t border-slate-800 flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                isDone
                  ? 'w-8 bg-amber-500'
                  : isCurrent
                    ? 'w-12 bg-amber-400 animate-pulse'
                    : 'w-4 bg-slate-800'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
