'use client';

import { BookOpen, Copy, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@playdeck/ui';

import { compileFullStoryText } from '../engine/story-engine';
import type { OneWordStoryState } from '../types/one-word-story.types';

export interface StoryReadbackStageProps {
  gameState: OneWordStoryState;
  isSpeaking: boolean;
  onReadAloud: () => void;
  onProceedToVoting: () => void;
}

export const StoryReadbackStage: React.FC<StoryReadbackStageProps> = ({
  gameState,
  isSpeaking,
  onReadAloud,
  onProceedToVoting,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const fullText = compileFullStoryText(gameState.selectedPrompt, gameState.words);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      void navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0f172a]/95 backdrop-blur border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-500" />
            The Story is Complete!
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            &ldquo;{gameState.selectedPrompt.title}&rdquo; — {gameState.words.length} words crafted
            collaboratively.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReadAloud}
            className={`border-amber-500/40 text-xs flex items-center gap-1.5 ${
              isSpeaking ? 'bg-amber-950 text-amber-300 animate-pulse' : 'text-slate-300'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-slate-700 text-xs flex items-center gap-1.5 text-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Story'}
          </Button>
        </div>
      </div>

      {/* Dramatic Parchment Scroll View */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#fdf6e2] text-[#2b2416] shadow-inner border-4 border-[#e6d5b8] max-h-[380px] overflow-y-auto font-serif text-lg sm:text-2xl leading-relaxed">
        <p className="whitespace-pre-wrap">{fullText}</p>
      </div>

      {/* Footer / Transition to Voting */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <span className="text-xs text-slate-400">
          Listen to or read the full tale, then proceed to vote for best moments!
        </span>

        <Button
          size="lg"
          onClick={onProceedToVoting}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <ThumbsUp className="w-5 h-5" />
          Vote for Awards
        </Button>
      </div>
    </div>
  );
};
