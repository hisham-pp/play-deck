'use client';

import { Coins, Flag, Home, Loader2, Play, Sparkles, Trophy, Wrench } from 'lucide-react';
import React, { type ReactNode } from 'react';
import type { CrashReason, RunResult, SummitProgress } from '../engine/summit-types';
import type { RaceOutcome } from '../multiplayer/race-protocol';
import { OverlayShell, PRIMARY_BTN, SECONDARY_BTN } from './SummitOverlays';

const REASON_TEXT: Record<CrashReason, string> = {
  head: 'Helmet hit the dirt!',
  flipped: 'Flipped and stuck!',
  fuel: 'Out of fuel!',
  gap: 'Dropped into a ravine!',
};

const REASON_TIP: Record<CrashReason, string> = {
  head: 'Tip: ease off the gas in the air — brake tilts the nose down.',
  flipped: 'Tip: on steep climbs, feather the gas to keep the front wheels down.',
  fuel: 'Tip: fuel cans are marked on the HUD — a bigger tank buys breathing room.',
  gap: 'Tip: watch for the yellow warning signs and hit ravine ramps at full speed.',
};

export interface RaceSummary {
  rivalName: string;
  /** Rival's final result, or their live distance while still driving. */
  rivalDistance: number;
  rivalScore: number;
  rivalDone: boolean;
  outcome: RaceOutcome | null;
  isHost: boolean;
  isReady: boolean;
  onRematch: () => void;
  onReady: () => void;
}

interface SummitGameOverProps {
  result: RunResult;
  progress: SummitProgress;
  race: RaceSummary | null;
  onPlayAgain: () => void;
  onUpgrades: () => void;
  onMenu: () => void;
}

function Row({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5">
      <span className="flex items-center gap-1.5 text-xs text-slate-300">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-bold text-white">{value}</span>
    </div>
  );
}

const OUTCOME_TEXT: Record<RaceOutcome, { title: string; color: string }> = {
  win: { title: 'You win the race!', color: 'text-emerald-300' },
  lose: { title: 'Rival takes it!', color: 'text-rose-300' },
  draw: { title: "It's a dead heat!", color: 'text-amber-300' },
};

function RacePanel({ race, result }: { race: RaceSummary; result: RunResult }) {
  const outcome = race.outcome ? OUTCOME_TEXT[race.outcome] : null;
  return (
    <div className="mt-3 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/5 p-3">
      <p
        className={`text-center font-display text-lg font-black ${outcome?.color ?? 'text-slate-200'}`}
      >
        {outcome ? outcome.title : `${race.rivalName} is still driving…`}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[10px] font-bold uppercase text-teal-300">You</p>
          <p className="font-mono text-lg font-black text-white">{result.distance} m</p>
          <p className="font-mono text-[11px] text-slate-400">
            {result.score.toLocaleString()} pts
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="truncate text-[10px] font-bold uppercase text-fuchsia-300">
            {race.rivalName}
          </p>
          <p className="flex items-center justify-center gap-1 font-mono text-lg font-black text-white">
            {!race.rivalDone && <Loader2 className="h-3.5 w-3.5 animate-spin text-fuchsia-300" />}
            {race.rivalDistance} m
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            {race.rivalDone ? `${race.rivalScore.toLocaleString()} pts` : 'spectating…'}
          </p>
        </div>
      </div>
    </div>
  );
}

function RaceActions({ race }: { race: RaceSummary }) {
  if (race.isHost) {
    return (
      <button
        type="button"
        className={PRIMARY_BTN}
        onClick={race.onRematch}
        disabled={!race.rivalDone}
      >
        <Flag className="h-4 w-4" /> {race.rivalDone ? 'Rematch' : 'Waiting for rival…'}
      </button>
    );
  }
  return (
    <button type="button" className={PRIMARY_BTN} onClick={race.onReady} disabled={race.isReady}>
      <Flag className="h-4 w-4" />{' '}
      {race.isReady ? 'Ready — host starts the rematch' : 'Ready for rematch'}
    </button>
  );
}

export function SummitGameOver({
  result,
  progress,
  race,
  onPlayAgain,
  onUpgrades,
  onMenu,
}: SummitGameOverProps) {
  const toBest = progress.bestDistance - result.distance;
  return (
    <OverlayShell>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-300">
          {REASON_TEXT[result.reason]}
        </p>
        {result.isNewBest ? (
          <p className="mt-1 flex items-center justify-center gap-2 font-display text-2xl font-black text-amber-300">
            <Sparkles className="h-5 w-5" /> New best distance!
          </p>
        ) : (
          <p className="mt-1 font-display text-2xl font-black text-white">{result.distance} m</p>
        )}
        {!result.isNewBest && toBest > 0 && (
          <p className="text-xs text-slate-400">
            Only {toBest} m short of your best — one more go?
          </p>
        )}
      </div>

      {race && <RacePanel race={race} result={result} />}

      <div className="mt-3 flex flex-col gap-1.5">
        <Row label="Distance" value={`${result.distance} m`} />
        <Row
          label="Coins earned"
          value={`+${result.coins}`}
          icon={<Coins className="h-3.5 w-3.5 text-amber-300" />}
        />
        <Row label="Score" value={result.score.toLocaleString()} />
        <Row
          label="Best distance"
          value={`${progress.bestDistance} m`}
          icon={<Trophy className="h-3.5 w-3.5 text-amber-300" />}
        />
        {(result.flips > 0 || result.longestJump > 0) && (
          <Row
            label="Stunts"
            value={`${result.flips} flips · ${Math.round(result.longestJump)} m jump`}
          />
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">{REASON_TIP[result.reason]}</p>

      <div className="mt-4 flex flex-col gap-2">
        {race ? (
          <RaceActions race={race} />
        ) : (
          <button type="button" className={PRIMARY_BTN} onClick={onPlayAgain} autoFocus>
            <Play className="h-4 w-4" /> Play again
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={SECONDARY_BTN} onClick={onUpgrades}>
            <Wrench className="h-4 w-4" /> Upgrade
          </button>
          <button type="button" className={SECONDARY_BTN} onClick={onMenu}>
            <Home className="h-4 w-4" /> Menu
          </button>
        </div>
      </div>
    </OverlayShell>
  );
}
