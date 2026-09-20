'use client';

import React, { useState } from 'react';

import type { SpyNetworkState } from '../types/spy-network.types';

interface Props {
  gameState: SpyNetworkState;
  localPlayerId: string;
  isHost: boolean;
  onSubmitQA: (question: string, answer: string) => void;
  onStartVoting: () => void;
}

export function SpyNetworkQAPanel({
  gameState,
  localPlayerId,
  isHost,
  onSubmitQA,
  onStartVoting,
}: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const isQuestioner = gameState.currentQuestionerId === localPlayerId;
  const isRespondent = gameState.currentRespondentId === localPlayerId;

  const questioner = gameState.players.find((p) => p.id === gameState.currentQuestionerId);
  const respondent = gameState.players.find((p) => p.id === gameState.currentRespondentId);

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    onSubmitQA(question, answer);
    setQuestion('');
    setAnswer('');
  };

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-deck-400 mb-3">
          Phase:{' '}
          {gameState.phase === 'discussion' ? 'Discussion' : `Q&A — Round ${gameState.roundNumber}`}
        </p>

        {gameState.phase === 'qa' && (
          <div className="space-y-3">
            <p className="text-sm text-deck-300">
              <span className="font-bold text-white">{questioner?.displayName}</span>
              {' → '}
              <span className="font-bold text-amber-400">{respondent?.displayName}</span>
            </p>

            {(isQuestioner || isHost) && (
              <input
                className="w-full rounded-lg bg-surface-base border border-surface-border text-sm text-deck-200 p-2"
                placeholder="Ask a question about the location…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={120}
              />
            )}

            {(isRespondent || isHost) && (
              <input
                className="w-full rounded-lg bg-surface-base border border-surface-border text-sm text-deck-200 p-2"
                placeholder="Answer the question…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={120}
              />
            )}

            {(isQuestioner || isRespondent || isHost) && (
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || !answer.trim()}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-surface-base font-bold text-sm transition-colors"
              >
                Submit Q&A
              </button>
            )}
          </div>
        )}

        {gameState.phase === 'discussion' && isHost && (
          <button
            onClick={onStartVoting}
            className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors"
          >
            Start Voting →
          </button>
        )}
      </div>

      {gameState.qaLog.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-base p-4 space-y-2 max-h-52 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-deck-400">Q&A Log</p>
          {[...gameState.qaLog].reverse().map((entry) => (
            <div key={entry.id} className="text-sm border-b border-surface-border pb-2">
              <p className="text-amber-400 font-semibold">
                {entry.questionerName} → {entry.respondentName}
              </p>
              <p className="text-deck-300">
                <span className="font-bold">Q:</span> {entry.question}
              </p>
              <p className="text-deck-200">
                <span className="font-bold">A:</span> {entry.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
