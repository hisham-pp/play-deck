'use client';

import { Check, History, X } from 'lucide-react';
import React from 'react';

import type { QALogEntry } from '../types/who-am-i.types';

export interface WhoAmIQALogProps {
  qaLog: QALogEntry[];
}

export const WhoAmIQALog: React.FC<WhoAmIQALogProps> = ({ qaLog }) => {
  if (qaLog.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0c1322]/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
        <History className="w-4 h-4 text-amber-400" />
        <span>Investigation Notebook & Q&A Clues</span>
      </div>

      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {qaLog.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="text-slate-400 font-medium">
                <strong className="text-amber-300">{log.questionerName}</strong> asked:
              </div>
              <div className="text-sm font-bold text-slate-100">"{log.questionText}"</div>

              {log.finalGuess && (
                <div className="text-[11px] font-semibold mt-1 flex items-center gap-1.5">
                  <span className="text-slate-400">Guessed "{log.finalGuess}":</span>
                  {log.wasCorrect ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Correct!
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <X className="w-3 h-3" /> Incorrect
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                Yes: {log.yesVotes.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                No: {log.noVotes.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                Maybe: {log.maybeVotes.length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
