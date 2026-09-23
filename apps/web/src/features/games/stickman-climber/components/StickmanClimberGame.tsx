'use client';

import { ArrowLeft, Swords, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

const levelStats = [
  { level: 1, label: 'Rookie climb', xp: 100, reward: 'Wooden Sword' },
  { level: 2, label: 'Rising foes', xp: 250, reward: 'Iron Blade' },
  { level: 3, label: 'Guarded ascent', xp: 450, reward: 'Shield Charm' },
  { level: 4, label: 'Elite ascent', xp: 700, reward: 'Spear' },
  { level: 5, label: 'Tower gauntlet', xp: 1050, reward: 'Rare relic' },
];

export function StickmanClimberGame() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(32);
  const [level, setLevel] = useState(1);
  const [weapon, setWeapon] = useState('Wooden Sword');
  const [paused, setPaused] = useState(false);

  const currentLevel = useMemo(
    () => levelStats.find((item) => item.level === selectedLevel) ?? levelStats[0],
    [selectedLevel],
  );

  const levelProgress = Math.min(100, (xp % 100) + 15);

  const handleAttack = () => {
    setXp((value) => value + 14);
    setCoins((value) => value + 1);
  };

  const handleLevelUp = () => {
    setLevel((value) => value + 1);
    setSelectedLevel((value) => Math.min(5, value + 1));
    setHealth(100);
    setWeapon((current) => {
      if (current === 'Wooden Sword') return 'Iron Blade';
      if (current === 'Iron Blade') return 'Katana';
      return current;
    });
  };

  const handleRestart = () => {
    setHealth(100);
    setXp(0);
    setCoins(32);
    setLevel(1);
    setSelectedLevel(1);
    setWeapon('Wooden Sword');
    setPaused(false);
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
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
          <Swords className="h-3.5 w-3.5" />
          <span>Vertical Climber</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-deck-500">
                Level {level}
              </div>
              <div className="text-lg font-black text-white">{currentLevel.label}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaused((value) => !value)}
                className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-amber-500"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleRestart}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#111827]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_40%),linear-gradient(180deg,_rgba(17,24,39,0.4),_rgba(2,6,23,0.95))]" />
            <div className="relative h-[420px] w-full p-4">
              <div className="absolute left-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>{health}% HP</span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{coins} Coins</span>
              </div>

              <div className="absolute inset-x-4 top-20 rounded-xl border border-amber-500/50 bg-slate-900/80 p-3 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-deck-400">
                  <span>XP</span>
                  <span>
                    {xp} / {currentLevel.xp}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/50 bg-[#0f172a]/70 shadow-[0_0_40px_rgba(245,158,11,0.22)]" />

              <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-30 w-20">
                  <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-slate-200 bg-slate-900" />
                  <div className="absolute left-1/2 top-7 h-10 w-1 -translate-x-1/2 bg-slate-200" />
                  <div className="absolute left-[20%] top-11 h-8 w-1 rotate-45 bg-slate-200" />
                  <div className="absolute right-[20%] top-11 h-8 w-1 -rotate-45 bg-slate-200" />
                  <div className="absolute left-[38%] top-16 h-10 w-1 rotate-[26deg] bg-slate-200" />
                  <div className="absolute right-[38%] top-16 h-10 w-1 -rotate-[26deg] bg-slate-200" />
                </div>
              </div>

              <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl border border-surface-border bg-slate-950/70 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-deck-400">Weapon</div>
                <div className="text-sm font-bold text-white">{weapon}</div>
              </div>

              <div className="absolute bottom-5 right-5 flex gap-2">
                <button
                  onClick={handleAttack}
                  className="rounded-xl border border-surface-border bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-amber-500 hover:text-amber-300"
                >
                  Attack
                </button>
                <button
                  onClick={handleLevelUp}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
                >
                  Level Up
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-arcade">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-deck-500">Route</div>
            <div className="space-y-2">
              {levelStats.map((item) => (
                <button
                  key={item.level}
                  onClick={() => setSelectedLevel(item.level)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                    item.level === selectedLevel
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-surface-border bg-surface-base/80 text-deck-300 hover:border-surface-border/80'
                  }`}
                >
                  <span className="font-bold">Level {item.level}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-deck-500">
                    {item.reward}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-deck-500">Status</div>
            <ul className="space-y-2 text-sm text-deck-300">
              <li>Enemies: {selectedLevel * 2 + 1}</li>
              <li>Objective: Climb to the next arena</li>
              <li>Reward: +{currentLevel.xp} XP</li>
              <li>Threat: {selectedLevel >= 4 ? 'Elite' : 'Standard'}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-deck-500">Combat</div>
            <ul className="space-y-2 text-sm text-deck-300">
              <li>• Basic slash</li>
              <li>• Heavy strike</li>
              <li>• Jump attack</li>
              <li>• Dodge roll</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
