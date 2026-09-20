'use client';

import { Clock, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@playdeck/ui';

import { validateWord } from '../engine/story-engine';
import type { StoryPlayer } from '../types/one-word-story.types';

export interface StoryWordInputProps {
  isMyTurn: boolean;
  activePlayer?: StoryPlayer;
  timeLeft: number;
  totalTime: number;
  onSubmitWord: (word: string) => void;
}

export const StoryWordInput: React.FC<StoryWordInputProps> = ({
  isMyTurn,
  activePlayer,
  timeLeft,
  totalTime,
  onSubmitWord,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when it becomes my turn
  useEffect(() => {
    if (isMyTurn) {
      setInputVal('');
      setErrorMsg(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMyTurn]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If space pressed, try to submit if valid
    if (val.endsWith(' ') && val.trim().length > 0) {
      const validation = validateWord(val.trim());
      if (validation.isValid && validation.cleanedWord) {
        onSubmitWord(validation.cleanedWord);
        setInputVal('');
        setErrorMsg(null);
        return;
      }
    }
    setInputVal(val);
    if (val.trim()) {
      const validation = validateWord(val);
      setErrorMsg(validation.isValid ? null : (validation.error ?? null));
    } else {
      setErrorMsg(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const validation = validateWord(inputVal);
    if (validation.isValid && validation.cleanedWord) {
      onSubmitWord(validation.cleanedWord);
      setInputVal('');
      setErrorMsg(null);
    } else {
      setErrorMsg(validation.error ?? 'Please enter a valid word');
    }
  };

  const handlePunctuationClick = (punct: string) => {
    if (!inputVal.trim()) return;
    const clean = inputVal.replace(/[.,!?;:—]+$/, '');
    setInputVal(`${clean}${punct}`);
    inputRef.current?.focus();
  };

  const timeFraction = Math.max(0, Math.min(1, timeLeft / totalTime));
  const isUrgent = timeLeft <= 4;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {isMyTurn ? (
        <div className="bg-[#1e293b] border-2 border-amber-500/60 p-4 rounded-2xl shadow-xl flex flex-col gap-3">
          {/* Status line with timer */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              IT&apos;S YOUR TURN! Add exactly one word:
            </div>

            <div
              className={`flex items-center gap-1.5 font-mono font-bold px-2.5 py-1 rounded-lg ${
                isUrgent
                  ? 'bg-red-950/80 text-red-400 border border-red-600'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-spin' : ''}`} />
              {timeLeft}s
            </div>
          </div>

          {/* Time progress bar */}
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isUrgent ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${timeFraction * 100}%` }}
            />
          </div>

          {/* Input & Action */}
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your word here..."
              maxLength={25}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-serif text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!inputVal.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit
            </Button>
          </div>

          {/* Quick Punctuation Chips & Error */}
          <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Add punctuation:</span>
              {['.', ',', '!', '?', '...'].map((punct) => (
                <button
                  key={punct}
                  type="button"
                  onClick={() => handlePunctuationClick(punct)}
                  className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
                >
                  {punct}
                </button>
              ))}
            </div>

            {errorMsg ? (
              <span className="text-xs text-red-400 font-semibold">{errorMsg}</span>
            ) : (
              <span className="text-xs text-slate-500">Press Space or Enter to submit</span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#1e293b]/70 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activePlayer?.avatar ?? '✍️'}</span>
            <div>
              <div className="text-xs text-slate-400">Current Author:</div>
              <div className="text-sm font-bold text-slate-100">
                {activePlayer?.displayName ?? 'Thinking...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>{timeLeft}s remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};
