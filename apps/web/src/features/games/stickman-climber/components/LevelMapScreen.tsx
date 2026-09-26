'use client';

import {
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Mountain,
  Play,
  RotateCcw,
  Shield,
  Star,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  FIRST_FIVE_LEVELS,
  type LevelConfig,
  type PlayerClimberProgress,
  isLevelUnlocked,
} from '../engine/stickman-climber-logic';

interface LevelMapScreenProps {
  progress: PlayerClimberProgress;
  selectedLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onStartLevel: (levelId: number) => void;
  onClose?: () => void;
}

export function LevelMapScreen({
  progress,
  selectedLevelId,
  onSelectLevel,
  onStartLevel,
}: LevelMapScreenProps) {
  const [activePreviewId, setActivePreviewId] = useState<number>(selectedLevelId);
  const previewConfig =
    FIRST_FIVE_LEVELS.find((l) => l.id === activePreviewId) ?? FIRST_FIVE_LEVELS[0];
  const isUnlocked = isLevelUnlocked(activePreviewId, progress.unlockedLevels);
  const record = progress.completedLevels[activePreviewId];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-arcade">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-deck-950 dark:text-white font-display">
              Ascent Map &amp; Level Selection
            </h2>
            <p className="text-xs text-deck-500">
              Conquer all 5 vertical tiers from the foothills to the Titan summit.
            </p>
          </div>
        </div>

        {/* Total Stars Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-bold text-xs">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{progress.totalStars} / 15 Stars Earned</span>
        </div>
      </div>

      {/* Main Grid: Vertical Trail Nodes on Left, Selected Level Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        {/* Trail Path */}
        <div className="flex flex-col gap-3">
          {FIRST_FIVE_LEVELS.slice()
            .reverse()
            .map((level: LevelConfig) => {
              const unlocked = isLevelUnlocked(level.id, progress.unlockedLevels);
              const completion = progress.completedLevels[level.id];
              const isSelected = level.id === activePreviewId;

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    setActivePreviewId(level.id);
                    onSelectLevel(level.id);
                  }}
                  className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10'
                      : unlocked
                        ? 'border-surface-border bg-surface-base hover:border-amber-500/40 hover:bg-surface-overlay'
                        : 'border-surface-border/50 bg-surface-base/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-mono border ${
                        level.isBossLevel
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : unlocked
                              ? 'bg-surface-overlay border-surface-border text-white'
                              : 'bg-surface-base border-surface-border text-deck-600'
                      }`}
                    >
                      {level.isBossLevel ? (
                        <Crown className="w-5 h-5 text-rose-400" />
                      ) : unlocked ? (
                        level.id
                      ) : (
                        <Lock className="w-4 h-4 text-deck-500" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-deck-950 dark:text-white">
                          Level {level.id}: {level.name}
                        </h4>
                        {level.isBossLevel && (
                          <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Boss
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-deck-500 mt-0.5 font-mono">
                        <span>{level.heightMeters}m</span>
                        <span>•</span>
                        <span className="capitalize">{level.theme}</span>
                        <span>•</span>
                        <span>{level.enemyCount} Enemies</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars / Lock display */}
                  <div className="flex items-center gap-1.5">
                    {unlocked ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-3.5 h-3.5 ${
                              completion && completion.stars >= starNum
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-deck-600'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-deck-500 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Level Details Card & Action */}
        <div className="p-5 rounded-xl border border-surface-border bg-surface-base flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Level {previewConfig.id} Dossier</span>
              </div>
              <h3 className="text-xl font-black text-deck-950 dark:text-white font-display mt-0.5">
                {previewConfig.name}
              </h3>
              <p className="text-xs text-deck-400 mt-0.5">{previewConfig.subtitle}</p>
            </div>
            {previewConfig.isBossLevel && (
              <div className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
                FINAL BOSS
              </div>
            )}
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-raised border border-surface-border">
              <span className="text-deck-500 text-[10px] uppercase font-mono block">
                Ascent Target
              </span>
              <span className="text-white font-bold font-mono">
                {previewConfig.heightMeters} Meters
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-surface-border">
              <span className="text-deck-500 text-[10px] uppercase font-mono block">Enemies</span>
              <span className="text-white font-bold font-mono">
                {previewConfig.enemyCount} Hostiles
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-surface-border">
              <span className="text-deck-500 text-[10px] uppercase font-mono block">Clear XP</span>
              <span className="text-amber-400 font-bold font-mono">
                +{previewConfig.rewardXp} XP
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-surface-border">
              <span className="text-deck-500 text-[10px] uppercase font-mono block">
                Clear Gold
              </span>
              <span className="text-amber-400 font-bold font-mono">
                +{previewConfig.rewardCoins} Coins
              </span>
            </div>
          </div>

          {/* Features Pills */}
          <div>
            <span className="text-[10px] font-mono uppercase text-deck-500 block mb-1.5">
              Terrain Obstacles &amp; Elements
            </span>
            <div className="flex flex-wrap gap-1.5">
              {previewConfig.features.map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-0.5 rounded bg-surface-overlay text-deck-300 border border-surface-border text-[10px] font-mono capitalize"
                >
                  {feat.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Weapon Unlock if any */}
          {previewConfig.rewardWeapon && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold block">
                  Clear Reward Weapon
                </span>
                <span className="text-sm font-bold text-white">{previewConfig.rewardWeapon}</span>
              </div>
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          )}

          {/* Completion Record */}
          {record && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cleared with {record.stars} Stars</span>
              </div>
              <span className="font-mono text-deck-400 text-[11px]">
                Best: {record.bestScore.toLocaleString()}
              </span>
            </div>
          )}

          {/* Action button */}
          <div className="mt-2">
            {isUnlocked ? (
              <button
                onClick={() => onStartLevel(previewConfig.id)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {record ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay Level {previewConfig.id}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Climb Level {previewConfig.id}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl bg-surface-overlay border border-surface-border text-deck-500 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-not-allowed">
                <Lock className="w-4 h-4" />
                <span>Complete Level {previewConfig.id - 1} to Unlock</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
