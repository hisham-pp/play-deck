'use client';

import { ArrowLeft, Coins, Droplets, Gauge, Lock, Play, Settings2, Zap } from 'lucide-react';
import React, { type ReactNode } from 'react';
import type { SummitProgress, UpgradeId } from '../engine/summit-types';
import { MAX_UPGRADE_LEVEL, UPGRADES, upgradeCost } from '../engine/upgrades';
import { OverlayShell, PRIMARY_BTN, SECONDARY_BTN } from './SummitOverlays';

const ICONS: Record<UpgradeId, ReactNode> = {
  engine: <Zap className="h-5 w-5" />,
  suspension: <Settings2 className="h-5 w-5" />,
  tires: <Gauge className="h-5 w-5" />,
  fuel: <Droplets className="h-5 w-5" />,
};

interface SummitUpgradesProps {
  progress: SummitProgress;
  onBuy: (id: UpgradeId) => void;
  onBack: () => void;
  onPlay: (() => void) | null;
  backLabel: string;
}

function LevelPips({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Level ${level} of ${MAX_UPGRADE_LEVEL}`}>
      {Array.from({ length: MAX_UPGRADE_LEVEL }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < level ? 'bg-amber-400' : 'bg-white/10'}`}
        />
      ))}
    </div>
  );
}

export function SummitUpgrades({
  progress,
  onBuy,
  onBack,
  onPlay,
  backLabel,
}: SummitUpgradesProps) {
  return (
    <OverlayShell>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black text-white">Garage</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 font-mono text-sm font-black text-amber-300 ring-1 ring-amber-500/30">
          <Coins className="h-4 w-4" /> {progress.coins.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Coins from every run carry over. Each level is a permanent boost.
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {UPGRADES.map((info) => {
          const level = progress.upgrades[info.id];
          const cost = upgradeCost(info, level);
          const maxed = cost === null;
          const affordable = !maxed && progress.coins >= cost;
          return (
            <li key={info.id} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500/15 text-teal-300">
                  {ICONS[info.id]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-white">{info.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Lv {level}/{MAX_UPGRADE_LEVEL}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{info.tagline}</p>
                </div>
              </div>
              <div className="mt-2">
                <LevelPips level={level} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] leading-snug text-slate-300">
                  <span className="text-slate-400">Now:</span> {info.describe(level)}
                  {!maxed && (
                    <>
                      <br />
                      <span className="text-emerald-300">Next: {info.describe(level + 1)}</span>
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => onBuy(info.id)}
                  disabled={!affordable}
                  aria-label={
                    maxed
                      ? `${info.name} maxed`
                      : `Buy ${info.name} level ${level + 1} for ${cost} coins`
                  }
                  className={`${PRIMARY_BTN} !shrink-0 !px-3 !py-2 !text-xs`}
                >
                  {maxed ? (
                    'MAX'
                  ) : (
                    <>
                      {!affordable && <Lock className="h-3 w-3" />}
                      <Coins className="h-3.5 w-3.5" /> {cost}
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={SECONDARY_BTN} onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </button>
        {onPlay && (
          <button type="button" className={PRIMARY_BTN} onClick={onPlay}>
            <Play className="h-4 w-4" /> Drive
          </button>
        )}
      </div>
    </OverlayShell>
  );
}
