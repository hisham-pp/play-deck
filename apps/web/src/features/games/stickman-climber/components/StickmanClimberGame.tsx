'use client';

import {
  ArrowLeft,
  Crown,
  Map,
  Mountain,
  RotateCcw,
  Shield,
  Star,
  Swords,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FIRST_FIVE_LEVELS,
  INITIAL_CLIMBER_PROGRESS,
  type LevelCompleteResult,
  type PlayerClimberProgress,
  completeLevel,
  createEnemyWave,
  getLevelConfig,
  isLevelUnlocked,
  resolveCombat,
} from '../engine/stickman-climber-logic';
import { LevelCompleteModal } from './LevelCompleteModal';
import { LevelMapScreen } from './LevelMapScreen';

const STARTING_WEAPON = 'Wooden Sword' as const;
type Weapon =
  'Wooden Sword' | 'Iron Blade' | 'Katana' | 'Shadow Dagger' | 'Titan Slayer Greatsword';

export function StickmanClimberGame() {
  const [viewMode, setViewMode] = useState<'stage' | 'map'>('stage');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [progress, setProgress] = useState<PlayerClimberProgress>(INITIAL_CLIMBER_PROGRESS);
  const [health, setHealth] = useState(100);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(32);
  const [weapon, setWeapon] = useState<Weapon>(STARTING_WEAPON);
  const [enemyHp, setEnemyHp] = useState<number>(() => createEnemyWave(1).enemy.hp);
  const [paused, setPaused] = useState(false);
  const [activeVictory, setActiveVictory] = useState<LevelCompleteResult | null>(null);

  const levelConfig = useMemo(() => getLevelConfig(selectedLevel), [selectedLevel]);
  const wave = useMemo(() => createEnemyWave(selectedLevel), [selectedLevel]);
  const levelProgress = Math.min(100, Math.round((xp % 100) + 15));

  useEffect(() => {
    setEnemyHp(wave.enemy.hp);
  }, [wave]);

  const handleStartLevelFromMap = (levelId: number) => {
    setSelectedLevel(levelId);
    setEnemyHp(createEnemyWave(levelId).enemy.hp);
    setViewMode('stage');
    setActiveVictory(null);
  };

  const handleAttack = () => {
    if (paused) return;

    const result = resolveCombat({
      weapon,
      level: selectedLevel,
      health,
      xp,
      coins,
      enemyHp,
    });

    setHealth(result.health);
    setXp(result.xp);
    setCoins(result.coins);
    setEnemyHp(result.enemyHp);

    if (result.defeated) {
      // Complete level and evaluate rewards
      const score = Math.max(100, result.health * 10 + result.xp);
      const victory = completeLevel(selectedLevel, result.health, score, progress);
      setProgress(victory.progress);
      setActiveVictory(victory);

      // Auto-equip unlocked weapon if better
      if (victory.unlockedWeapon) {
        setWeapon(victory.unlockedWeapon as Weapon);
      }
    }
  };

  const handleNextLevelFromModal = () => {
    if (selectedLevel < 5) {
      const next = selectedLevel + 1;
      setSelectedLevel(next);
      setHealth(100);
      setEnemyHp(createEnemyWave(next).enemy.hp);
      setActiveVictory(null);
      setViewMode('stage');
    } else {
      setActiveVictory(null);
      setViewMode('map');
    }
  };

  const handleReplay = () => {
    setHealth(100);
    setEnemyHp(createEnemyWave(selectedLevel).enemy.hp);
    setActiveVictory(null);
    setPaused(false);
    setViewMode('stage');
  };

  const handleRestart = () => {
    setHealth(100);
    setEnemyHp(createEnemyWave(selectedLevel).enemy.hp);
    setActiveVictory(null);
    setPaused(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Map view toggle button */}
          <button
            onClick={() => setViewMode((m) => (m === 'stage' ? 'map' : 'stage'))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-surface-raised border-surface-border text-deck-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{viewMode === 'map' ? 'Return to Climb' : 'Ascent Map'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            <Swords className="h-3.5 w-3.5" />
            <span>Vertical Climber</span>
          </div>
        </div>
      </div>

      {/* Screen Mode: Ascent Map View */}
      {viewMode === 'map' ? (
        <LevelMapScreen
          progress={progress}
          selectedLevelId={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onStartLevel={handleStartLevelFromMap}
          onClose={() => setViewMode('stage')}
        />
      ) : (
        /* Screen Mode: Active Climbing Stage */
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
            {/* Level header bar */}
            <div className="mb-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-deck-500 flex items-center gap-1.5">
                  <span>Level {selectedLevel} of 5</span>
                  <span>•</span>
                  <span className="font-mono text-amber-400">{levelConfig.heightMeters}m</span>
                </div>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>{levelConfig.name}</span>
                  {levelConfig.isBossLevel && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono uppercase font-bold">
                      Boss Arena
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaused((value) => !value)}
                  className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-amber-500 cursor-pointer"
                >
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={handleRestart}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Climbing Arena Stage */}
            <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#111827]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_40%),linear-gradient(180deg,_rgba(17,24,39,0.4),_rgba(2,6,23,0.95))]" />
              <div className="relative h-[420px] w-full p-4">
                {/* Stats Bar */}
                <div className="absolute left-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>{health}% HP</span>
                </div>
                <div className="absolute right-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>{coins} Coins</span>
                </div>

                {/* Altitude / Height indicator */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  <span>Altitude: {levelConfig.heightMeters}m</span>
                </div>

                {/* XP Meter */}
                <div className="absolute inset-x-4 top-16 rounded-xl border border-amber-500/50 bg-slate-900/80 p-3 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
                  <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-deck-400 font-mono">
                    <span>Ascent Progress</span>
                    <span>
                      {xp} / {levelConfig.rewardXp} XP
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>

                {/* Enemy Status Badge */}
                <div className="absolute left-4 top-[124px] rounded-lg border border-amber-500/40 bg-slate-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200 font-mono">
                  {wave.enemy.name}: {enemyHp} HP
                </div>

                {/* Center Stickman Fighter Avatar */}
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/50 bg-[#0f172a]/70 shadow-[0_0_40px_rgba(245,158,11,0.22)]" />

                <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative h-30 w-20">
                    <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-slate-200 bg-slate-900 shadow-sm" />
                    <div className="absolute left-1/2 top-7 h-10 w-1 -translate-x-1/2 bg-slate-200" />
                    <div className="absolute left-[20%] top-11 h-8 w-1 rotate-45 bg-slate-200" />
                    <div className="absolute right-[20%] top-11 h-8 w-1 -rotate-45 bg-slate-200" />
                    <div className="absolute left-[38%] top-16 h-10 w-1 rotate-[26deg] bg-slate-200" />
                    <div className="absolute right-[38%] top-16 h-10 w-1 -rotate-[26deg] bg-slate-200" />
                  </div>
                </div>

                {/* Current Equipped Weapon */}
                <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl border border-surface-border bg-slate-950/70 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-deck-400">
                    Weapon
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{weapon}</div>
                </div>

                {/* Opponent Pill */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-amber-500/30 bg-slate-950/70 px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-200 font-mono">
                  {wave.enemy.name}
                </div>

                {/* Action Controls */}
                <div className="absolute bottom-5 right-5 flex gap-2">
                  <button
                    onClick={handleAttack}
                    disabled={health <= 0}
                    className="rounded-xl border border-surface-border bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    Strike
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Level Route & Status */}
          <aside className="space-y-4 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-arcade">
            <div>
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono">
                <span>Ascent Progression</span>
                <button
                  onClick={() => setViewMode('map')}
                  className="text-amber-500 hover:underline cursor-pointer"
                >
                  Full Map →
                </button>
              </div>
              <div className="space-y-2">
                {FIRST_FIVE_LEVELS.map((item) => {
                  const unlocked = isLevelUnlocked(item.id, progress.unlockedLevels);
                  const completion = progress.completedLevels[item.id];
                  const isCurrent = item.id === selectedLevel;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (unlocked) {
                          setSelectedLevel(item.id);
                          setEnemyHp(createEnemyWave(item.id).enemy.hp);
                          setHealth(100);
                        }
                      }}
                      disabled={!unlocked}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                          : unlocked
                            ? 'border-surface-border bg-surface-base/80 text-deck-300 hover:border-amber-500/40 cursor-pointer'
                            : 'border-surface-border/40 bg-surface-base/30 text-deck-600 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.isBossLevel ? (
                          <Crown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <span className="font-mono text-xs font-bold">{item.id}.</span>
                        )}
                        <span className="font-bold text-xs">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {unlocked ? (
                          completion ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    starIdx <= completion.stars
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-deck-600'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                              Open
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-deck-600 uppercase">
                            Locked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Dossier Details */}
            <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3 text-xs space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono">
                Level {selectedLevel} Briefing
              </div>
              <ul className="space-y-1.5 text-deck-300 text-xs">
                <li className="flex justify-between">
                  <span className="text-deck-500">Altitude:</span>
                  <span className="font-mono text-white">{levelConfig.heightMeters}m</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Hostiles:</span>
                  <span className="font-mono text-white">{levelConfig.enemyCount} Hostiles</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Environment:</span>
                  <span className="font-mono text-white capitalize">{levelConfig.theme}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-deck-500">Clear Reward:</span>
                  <span className="font-mono text-amber-400">+{levelConfig.rewardXp} XP</span>
                </li>
              </ul>
            </div>

            {/* Combat Actions */}
            <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono">
                Tactical Moves
              </div>
              <ul className="space-y-1 text-xs text-deck-400 font-mono">
                <li>• Basic slash: Fast strike</li>
                <li>• Heavy cleave: High damage</li>
                <li>• Ledge leap: Evade hazard</li>
                <li>• Wall vault: Height surge</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Victory / Level Complete Modal */}
      {activeVictory && (
        <LevelCompleteModal
          result={activeVictory}
          onNextLevel={handleNextLevelFromModal}
          onReplay={handleReplay}
          onOpenMap={() => {
            setActiveVictory(null);
            setViewMode('map');
          }}
        />
      )}
    </div>
  );
}
