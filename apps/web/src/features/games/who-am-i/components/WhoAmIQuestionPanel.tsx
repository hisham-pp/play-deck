'use client';

import {
  ArrowRight,
  Check,
  HelpCircle,
  MessageSquare,
  Send,
  SkipForward,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { VoteAnswer, WhoAmIState } from '../types/who-am-i.types';

export interface WhoAmIQuestionPanelProps {
  gameState: WhoAmIState;
  localPlayerId: string;
  isHost: boolean;
  onAsk: (questionText: string) => void;
  onAnswer: (vote: VoteAnswer) => void;
  onGuess: (guessText: string) => void;
  onPass: () => void;
  onProceedToGuessing: () => void;
}

const QUICK_QUESTIONS = [
  'Am I a human being?',
  'Am I still alive today?',
  'Am I a fictional character?',
  'Am I an animal?',
  'Can I fly?',
  'Am I an object or food?',
];

export const WhoAmIQuestionPanel: React.FC<WhoAmIQuestionPanelProps> = ({
  gameState,
  localPlayerId,
  isHost: _isHost,
  onAsk,
  onAnswer,
  onGuess,
  onPass,
  onProceedToGuessing,
}) => {
  const { phase, currentTurnPlayerId, players, currentQuestion, qaLog } = gameState;
  const activePlayer = players.find((p) => p.id === currentTurnPlayerId);
  const isMyTurn = currentTurnPlayerId === localPlayerId;
  const [questionInput, setQuestionInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const currentLog = qaLog[0];

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    onAsk(questionInput.trim());
    setQuestionInput('');
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    onGuess(guessInput.trim());
    setGuessInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
            Round {gameState.roundNumber} of {gameState.maxRounds}
          </Badge>
          <span className="text-xs text-slate-400">
            Turn: <strong className="text-slate-200">{activePlayer?.displayName}</strong>
          </span>
        </div>
        {isMyTurn && (
          <Badge variant="warning" className="animate-pulse">
            ★ YOUR TURN ★
          </Badge>
        )}
      </div>

      {phase === 'questioning' && (
        <div className="space-y-3">
          {isMyTurn ? (
            <form onSubmit={handleAskSubmit} className="space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>Ask the group a Yes/No question:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. Am I a living person?"
                  maxLength={100}
                  autoFocus
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!questionInput.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Ask
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onAsk(q)}
                    className="text-xs py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <div className="py-6 text-center text-slate-400 space-y-1">
              <div className="text-2xl mb-1">{activePlayer?.avatar}</div>
              <div className="text-sm font-semibold text-slate-200">
                Waiting for {activePlayer?.displayName} to ask a question...
              </div>
              <div className="text-xs text-slate-400">(Or talk directly over live voice chat!)</div>
            </div>
          )}
        </div>
      )}

      {phase === 'answering' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 text-center">
            <div className="text-xs uppercase font-bold text-amber-400 mb-1">
              {activePlayer?.displayName} asks:
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-200">"{currentQuestion}"</div>
          </div>
          {!isMyTurn ? (
            <div className="space-y-2">
              <div className="text-xs text-center text-slate-400 font-semibold">
                Answer based on {activePlayer?.displayName}'s headband (
                {activePlayer?.identity.name}):
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onAnswer('yes')}
                  className={`border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/40 ${currentLog?.yesVotes.includes(localPlayerId) ? 'bg-emerald-900/40 ring-2 ring-emerald-400' : ''}`}
                >
                  <Check className="w-5 h-5 mr-1" /> YES
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onAnswer('no')}
                  className={`border-rose-500/50 text-rose-300 hover:bg-rose-950/40 ${currentLog?.noVotes.includes(localPlayerId) ? 'bg-rose-900/40 ring-2 ring-rose-400' : ''}`}
                >
                  <X className="w-5 h-5 mr-1" /> NO
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onAnswer('maybe')}
                  className={`border-amber-500/50 text-amber-300 hover:bg-amber-950/40 ${currentLog?.maybeVotes.includes(localPlayerId) ? 'bg-amber-900/40 ring-2 ring-amber-400' : ''}`}
                >
                  <HelpCircle className="w-5 h-5 mr-1" /> MAYBE
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="text-xs text-slate-400">
                Waiting for the group to answer... (Yes: {currentLog?.yesVotes.length ?? 0}, No:{' '}
                {currentLog?.noVotes.length ?? 0}, Maybe: {currentLog?.maybeVotes.length ?? 0})
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onProceedToGuessing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6"
              >
                Proceed to Guessing <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === 'guessing' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 truncate">"{currentQuestion}"</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-emerald-400 font-bold">
                Yes: {currentLog?.yesVotes.length ?? 0}
              </span>
              <span className="text-rose-400 font-bold">No: {currentLog?.noVotes.length ?? 0}</span>
              <span className="text-amber-400 font-bold">
                Maybe: {currentLog?.maybeVotes.length ?? 0}
              </span>
            </div>
          </div>
          {isMyTurn ? (
            <form onSubmit={handleGuessSubmit} className="space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />{' '}
                <span>Do you know who you are? Take a guess or pass:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="e.g. Sherlock Holmes..."
                  maxLength={50}
                  autoFocus
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!guessInput.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4"
                >
                  Guess!
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPass}
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  <SkipForward className="w-4 h-4 mr-1" /> Pass
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-4 text-center text-slate-400">
              {activePlayer?.displayName} is deciding whether to make a final guess or pass...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
