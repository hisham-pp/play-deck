'use client';

import { ArrowRight, ChevronRight, MessageSquare, Sparkles, Trophy } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { TelephoneState } from '../types/telephone-drawing.types';

export interface TelephoneRevealStageProps {
  gameState: TelephoneState;
  isHost: boolean;
  onAdvanceReveal: () => void;
}

export const TelephoneRevealStage: React.FC<TelephoneRevealStageProps> = ({
  gameState,
  isHost,
  onAdvanceReveal,
}) => {
  const { initialPhrase, steps, revealIndex } = gameState;

  // Shown steps so far based on revealIndex
  // revealIndex = 0: only initial phrase is shown
  // revealIndex = 1..N: initial phrase + steps up to revealIndex - 1
  const revealedSteps = steps.slice(0, revealIndex);
  const isFinalComparisonReady = revealIndex >= steps.length;
  const lastStep = steps[steps.length - 1];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-center">
      {/* Stage Header */}
      <div className="w-full bg-[#0c1322]/95 border border-amber-500/40 rounded-2xl p-4 sm:p-6 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <Badge
            variant="arcade"
            className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs"
          >
            THE GRAND REVEAL
          </Badge>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
          How Did The Message Mutate?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Turn your microphones on! Watch the hilarious chain of misunderstandings unfold.
        </p>

        {/* Host Reveal Controller */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {isHost ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onAdvanceReveal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 shadow-lg shadow-amber-500/20"
            >
              {isFinalComparisonReady ? (
                <>
                  <Trophy className="w-4 h-4 mr-1.5" />
                  Proceed to Mutation Voting
                </>
              ) : (
                <>
                  Reveal Next Step ({revealIndex} / {steps.length})
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <div className="text-xs text-amber-400/80 animate-pulse font-medium">
              Host is steering the slideshow...
            </div>
          )}
        </div>
      </div>

      {/* Step 0: The Original Secret Phrase */}
      <div className="w-full bg-[#0c1322] border-2 border-amber-500/60 rounded-2xl p-5 sm:p-6 text-center shadow-xl animate-fadeIn">
        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
          ✦ ORIGINAL SECRET PHRASE ✦
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-200">"{initialPhrase}"</div>
      </div>

      {/* Chain Stream of Revealed Steps */}
      <div className="flex flex-col gap-6 w-full">
        {revealedSteps.map((step, idx) => {
          const isSvg = Boolean(step.drawingData?.trim().startsWith('<svg'));

          return (
            <div
              key={step.stepIndex}
              className="flex flex-col items-center gap-3 w-full animate-fadeIn"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500/70">
                <ArrowRight className="w-4 h-4 rotate-90" />
                <span>STEP {idx + 1}</span>
              </div>

              <div className="w-full bg-[#0c1322]/95 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
                {/* Author Info */}
                <div className="flex md:flex-col items-center gap-3 md:w-40 flex-shrink-0 text-center">
                  <span className="text-4xl">{step.authorAvatar}</span>
                  <div>
                    <div className="font-bold text-sm text-slate-200">{step.authorName}</div>
                    <Badge variant="outline" className="text-[10px] text-slate-400 mt-1">
                      {step.type === 'draw' ? 'Sketcher' : 'Guesser'}
                    </Badge>
                  </div>
                </div>

                {/* Content: Drawing or Description */}
                <div className="flex-1 w-full">
                  {step.type === 'draw' && step.drawingData ? (
                    <div className="w-full max-w-[440px] aspect-[14/9.5] mx-auto rounded-xl overflow-hidden border-2 border-amber-950/60 bg-[#fdfbf7] p-2 flex items-center justify-center shadow-inner">
                      {isSvg ? (
                        <div
                          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
                          dangerouslySetInnerHTML={{ __html: step.drawingData }}
                        />
                      ) : (
                        <img
                          src={step.drawingData}
                          alt={`Drawing by ${step.authorName}`}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full bg-slate-900/90 border border-amber-900/30 rounded-xl p-5 text-center sm:text-left">
                      <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Guessed Description:
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-slate-100 italic">
                        "{step.description}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Final Comparison (When all steps revealed) */}
      {isFinalComparisonReady && lastStep && (
        <div className="w-full bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl mt-4 text-center space-y-4 animate-bounce-short">
          <Badge variant="arcade" className="bg-amber-500 text-slate-950 font-black">
            ✦ BEFORE & AFTER VERDICT ✦
          </Badge>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40">
              <div className="text-xs uppercase font-bold text-slate-400 mb-1">Started As:</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-300">
                "{initialPhrase}"
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40">
              <div className="text-xs uppercase font-bold text-slate-400 mb-1">Ended As:</div>
              <div className="text-lg sm:text-xl font-extrabold text-rose-300">
                "{lastStep.description ?? 'A crazy mystery sketch'}"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
