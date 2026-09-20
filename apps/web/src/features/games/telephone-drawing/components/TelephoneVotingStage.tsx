'use client';

import { Award, Check, ThumbsUp, Trophy } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { TelephoneState } from '../types/telephone-drawing.types';

export interface TelephoneVotingStageProps {
  gameState: TelephoneState;
  localPlayerId: string;
  isHost: boolean;
  onCastVote: (stepIndex: number) => void;
  onFinalizeScores: () => void;
}

export const TelephoneVotingStage: React.FC<TelephoneVotingStageProps> = ({
  gameState,
  localPlayerId,
  isHost,
  onCastVote,
  onFinalizeScores,
}) => {
  const { steps, players } = gameState;
  const localPlayer = players.find((p) => p.id === localPlayerId);
  const myVotedStepIndex = localPlayer?.votedStepIndex ?? null;

  const totalVoted = players.filter((p) => p.votedStepIndex !== null).length;
  const allVoted = totalVoted === players.length && players.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-center">
      {/* Header */}
      <div className="w-full bg-[#0c1322]/95 border border-amber-500/40 rounded-2xl p-5 sm:p-6 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-400" />
          <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
            VOTING PHASE
          </Badge>
          <Award className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-300">
          Vote for the Funniest Mutation!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Which drawing or guess completely steered the chain in the wrong (and most hilarious)
          direction?
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            {totalVoted} of {players.length} players voted
          </Badge>

          {isHost && (
            <Button
              variant="primary"
              size="sm"
              onClick={onFinalizeScores}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4"
            >
              <Trophy className="w-3.5 h-3.5 mr-1" />
              {allVoted ? 'Tally Final Scores' : 'Skip Remaining & Tally'}
            </Button>
          )}
        </div>
      </div>

      {/* Ballot Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {steps.map((step) => {
          const isOwnStep = step.authorId === localPlayerId;
          const isVoted = myVotedStepIndex === step.stepIndex;
          const isSvg = Boolean(step.drawingData?.trim().startsWith('<svg'));

          return (
            <div
              key={step.stepIndex}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                isVoted
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40'
                  : 'bg-[#0c1322]/90 border-slate-800 hover:border-amber-900/50'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{step.authorAvatar}</span>
                  <div>
                    <span className="font-bold text-sm text-slate-200">{step.authorName}</span>
                    <div className="text-[10px] text-slate-400">
                      Step {step.stepIndex + 1} ({step.type === 'draw' ? 'Sketch' : 'Guess'})
                    </div>
                  </div>
                </div>

                {step.votesReceived > 0 && (
                  <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 text-xs">
                    👍 {step.votesReceived} vote{step.votesReceived > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Step Preview Content */}
              <div className="flex-1 flex items-center justify-center min-h-[160px] bg-slate-950/60 rounded-lg p-2 overflow-hidden">
                {step.type === 'draw' && step.drawingData ? (
                  <div className="w-full max-w-[280px] aspect-[14/9.5] rounded bg-[#fdfbf7] p-1 flex items-center justify-center">
                    {isSvg ? (
                      <div
                        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
                        dangerouslySetInnerHTML={{ __html: step.drawingData }}
                      />
                    ) : (
                      <img
                        src={step.drawingData}
                        alt="Drawing preview"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-200 italic text-center p-3">
                    "{step.description}"
                  </p>
                )}
              </div>

              {/* Vote Action */}
              <div className="pt-2">
                {isOwnStep ? (
                  <div className="text-center text-xs text-slate-500 py-1 font-medium">
                    (Your own submission)
                  </div>
                ) : (
                  <Button
                    variant={isVoted ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onCastVote(step.stepIndex)}
                    className={`w-full font-bold ${
                      isVoted
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-300'
                    }`}
                  >
                    {isVoted ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Voted Funniest!
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                        Vote This Mutation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
