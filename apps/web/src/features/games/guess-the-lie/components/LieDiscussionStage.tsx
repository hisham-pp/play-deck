'use client';

import { ArrowRight, Clock, MessageSquare, Mic, Volume2, VolumeX } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { LiePrompt, SubmittedAnswer } from '../types/guess-the-lie.types';

export interface LieDiscussionStageProps {
  prompt: LiePrompt;
  answers: SubmittedAnswer[];
  timeLeft: number;
  isHost: boolean;
  isSpeaking: boolean;
  onReadAloud: () => void;
  onProceedToVoting: () => void;
}

export const LieDiscussionStage: React.FC<LieDiscussionStageProps> = ({
  prompt,
  answers,
  timeLeft,
  isHost,
  isSpeaking,
  onReadAloud,
  onProceedToVoting,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-indigo-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-300">
              Open Debate & Interrogation
            </h2>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300">
              Voice Discussion
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Answers are anonymous! Debate over mic: which answer sounds suspicious?
          </p>
        </div>

        {/* Controls & Timer */}
        <div className="flex items-center gap-2">
          {/* Read aloud TTS button */}
          <Button
            size="sm"
            variant="outline"
            onClick={onReadAloud}
            className={`border-indigo-500/40 text-xs flex items-center gap-1.5 py-1.5 px-3 h-auto ${
              isSpeaking
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400 animate-pulse'
                : 'text-slate-300 hover:bg-indigo-950'
            }`}
            title="Read answers aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop TTS' : 'Read Aloud'}</span>
          </Button>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              timeLeft <= 10
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-[#141e33] border-indigo-500/40 text-indigo-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>

          {/* Host advance button */}
          {isHost && (
            <Button
              size="sm"
              onClick={onProceedToVoting}
              className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs shadow-md"
            >
              <span>Vote Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Pinned Question Banner */}
      <div className="p-4 rounded-xl bg-[#11192d] border border-indigo-800/40 text-center">
        <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
          The Question
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white">"{prompt.question}"</h3>
      </div>

      {/* Voice Prompt Tip */}
      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/30 flex items-center gap-3 text-xs text-indigo-300">
        <Mic className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
        <span>
          <strong>Pro Tip:</strong> Question each other about details! The Liar has to improvise
          explanations on the spot.
        </span>
      </div>

      {/* Shuffled Anonymous Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer, index) => (
          <div
            key={answer.id}
            className="p-5 rounded-2xl bg-[#121a2d] border border-slate-800 shadow-lg flex flex-col justify-between gap-3 hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Answer #{index + 1}
              </span>
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              "{answer.text}"
            </p>

            <div className="text-[11px] font-mono text-slate-500 text-right">
              Anonymous Submission
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
