import { Trophy, X } from 'lucide-react';
import React from 'react';
import type { MiniGolfState } from '../engine/mini-golf-types';

interface MiniGolfScorecardModalProps {
  state: MiniGolfState;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const MiniGolfScorecardModal: React.FC<MiniGolfScorecardModalProps> = ({
  state,
  isOpen,
  onClose,
  onRestart,
}) => {
  if (!isOpen) return null;

  const totalCoursePar = state.holes.reduce((sum, h) => sum + h.par, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c1322] border border-[#232f45] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2438]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Mini Golf Scorecard</h2>
              <p className="text-xs text-slate-400">9-Hole Championship Course</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2336] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scorecard Table */}
        <div className="overflow-x-auto my-4 flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1c2438] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Hole</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold text-center">Par</th>
                {state.players.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 font-semibold text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161f33]">
              {state.holes.map((hole, idx) => {
                const isCurrent = idx === state.currentHoleIndex;
                return (
                  <tr
                    key={hole.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-amber-500/5 font-semibold' : 'hover:bg-[#11192b]'
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-300 font-mono">{hole.id}</td>
                    <td className="py-2 px-3 text-slate-200">
                      {hole.name}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          (Current)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{hole.par}</td>
                    {state.players.map((p) => {
                      const card = state.scorecards[p.id];
                      const score = card?.holeScores.find((s) => s.holeNumber === hole.id);

                      let colorClass = 'text-slate-500';
                      if (score) {
                        if (score.classification === 'ace') colorClass = 'text-amber-400 font-bold';
                        else if (score.strokes < score.par)
                          colorClass = 'text-emerald-400 font-bold';
                        else if (score.strokes === score.par) colorClass = 'text-slate-200';
                        else colorClass = 'text-rose-400';
                      }

                      return (
                        <td
                          key={p.id}
                          className={`py-2 px-3 text-center font-mono text-sm ${colorClass}`}
                        >
                          {score ? score.strokes : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Totals Summary Row */}
              <tr className="border-t-2 border-[#232f45] bg-[#111a2d] font-bold">
                <td className="py-3 px-3 uppercase tracking-wider text-slate-300" colSpan={2}>
                  Total
                </td>
                <td className="py-3 px-3 text-center text-slate-300 font-mono">{totalCoursePar}</td>
                {state.players.map((p) => {
                  const card = state.scorecards[p.id];
                  const diff = card ? card.totalParDiff : 0;
                  const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                  const diffClass =
                    diff < 0 ? 'text-emerald-400' : diff === 0 ? 'text-slate-200' : 'text-rose-400';

                  return (
                    <td key={p.id} className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-mono text-base">
                          {card?.totalStrokes ?? 0}
                        </span>
                        <span className={`text-[11px] font-mono ${diffClass}`}>({diffStr})</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1c2438]">
          <button
            type="button"
            onClick={onRestart}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a2336] hover:bg-[#223048] transition-colors"
          >
            Restart Course
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            Back to Match
          </button>
        </div>
      </div>
    </div>
  );
};
