'use client';

import { ArrowLeft, Gauge, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HUMAN_CONVEYOR_BELT_LAYOUTS, HUMAN_CONVEYOR_BELT_OBJECTS } from '../game-config';
import { createRouteScore, nextPhaseIndex, scoreForDrop } from '../game-logic';

const machineLayouts = HUMAN_CONVEYOR_BELT_LAYOUTS;
const objects = HUMAN_CONVEYOR_BELT_OBJECTS;

export function HumanConveyorBeltGame() {
  const [phase, setPhase] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [paused, setPaused] = useState(false);
  const [delivery, setDelivery] = useState(0);

  const layout = useMemo(() => machineLayouts[phase % machineLayouts.length], [phase]);

  const handleDeliver = () => {
    const nextStreak = streak + 1;
    const deliveredItem = objects[delivery % objects.length];
    const roundScore = createRouteScore({
      target: layout.target,
      streak: nextStreak,
      objectValue: deliveredItem.value,
    });

    setScore((value) => value + roundScore);
    setDelivery((value) => value + 1);
    setStreak(nextStreak);
    setPhase((value) => nextPhaseIndex(value, machineLayouts.length));
  };

  const handleMistake = () => {
    setStreak(0);
    setScore((value) => scoreForDrop(value, 10));
    setPhase((value) => nextPhaseIndex(value, machineLayouts.length));
  };

  const handleRestart = () => {
    setPhase(0);
    setScore(0);
    setStreak(0);
    setPaused(false);
    setDelivery(0);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          <Users className="h-3.5 w-3.5" />
          <span>Human Conveyor Belt</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                Machine config
              </div>
              <div className="text-lg font-black text-white">{layout.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaused((value) => !value)}
                className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-emerald-500"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleRestart}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#101827]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_rgba(17,24,39,0.4),_rgba(2,6,23,0.95))]" />
            <div className="relative h-[420px] w-full p-4">
              <div className="absolute left-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Gauge className="h-4 w-4 text-emerald-400" />
                <span>Speed {layout.speed.toFixed(1)}x</span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{score} pts</span>
              </div>

              <div className="absolute inset-x-4 top-20 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-slate-900/80 p-3 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-deck-400">Risk</div>
                <div className="text-sm font-bold text-white">{layout.risk}</div>
              </div>

              <div className="absolute inset-x-8 bottom-20">
                <div className="flex h-40 items-end justify-between gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`relative h-full w-14 rounded-t-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-400/40 via-emerald-500/10 to-slate-900 ${
                        index % 2 === 0 ? 'translate-y-4' : ''
                      }`}
                    >
                      <div className="absolute inset-x-2 bottom-2 h-8 rounded-xl bg-slate-950/70" />
                      <div className="absolute inset-x-3 top-3 flex h-8 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-500/20 text-[10px] font-bold text-emerald-100">
                        P{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
                {objects.map((item, index) => (
                  <div
                    key={item.type}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] ${
                      index % 2 === 0
                        ? 'border-amber-500/60 bg-amber-500/20 text-amber-200'
                        : 'border-cyan-500/60 bg-cyan-500/20 text-cyan-200'
                    }`}
                  >
                    {item.type.slice(0, 2)}
                  </div>
                ))}
              </div>

              <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl border border-surface-border bg-slate-950/70 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-deck-400">Streak</div>
                <div className="text-sm font-bold text-white">x{streak}</div>
              </div>

              <div className="absolute bottom-5 right-5 flex gap-2">
                <button
                  onClick={handleMistake}
                  className="rounded-xl border border-surface-border bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-red-500 hover:text-red-300"
                >
                  Drop
                </button>
                <button
                  onClick={handleDeliver}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400"
                >
                  Deliver
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-arcade">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              Machine
            </div>
            <div className="space-y-2">
              {machineLayouts.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => setPhase(index)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                    index === phase % machineLayouts.length
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-surface-border bg-surface-base/80 text-deck-300 hover:border-surface-border/80'
                  }`}
                >
                  <span className="font-bold">{item.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-deck-500">
                    {item.risk}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              Status
            </div>
            <ul className="space-y-2 text-sm text-deck-300">
              <li>Deliveries: {delivery}</li>
              <li>Target: {layout.target} pts</li>
              <li>Players: 2–6</li>
              <li>Voice sync: Ready</li>
            </ul>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              Object mix
            </div>
            <ul className="space-y-2 text-sm text-deck-300">
              {objects.map((item) => (
                <li key={item.type} className="flex items-center justify-between">
                  <span>{item.type}</span>
                  <span className="text-deck-500">{item.weight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/5 p-3 text-sm text-emerald-200">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Team strategy</span>
            </div>
            Shift your platforms to match the current route and keep objects moving without dropping
            the payload.
          </div>
        </aside>
      </div>
    </div>
  );
}
