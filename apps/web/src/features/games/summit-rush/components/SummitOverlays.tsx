'use client';

import { Coins, Globe, Mountain, Play, RotateCcw, Trophy, User, Wrench } from 'lucide-react';
import React, { type ReactNode } from 'react';
import type { SummitProgress } from '../engine/summit-types';

export type PlayMode = 'solo' | 'online';

export const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const SECONDARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

export function OverlayShell({ children, dim = true }: { children: ReactNode; dim?: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 ${dim ? 'bg-slate-950/55 backdrop-blur-[2px]' : ''}`}
    >
      <div className="my-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120]/90 p-4 text-slate-100 shadow-2xl sm:p-6">
        {children}
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/5 px-2 py-2 ring-1 ring-white/10">
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </span>
      <span className="font-mono text-base font-black text-white">{value}</span>
    </div>
  );
}

interface StartScreenProps {
  progress: SummitProgress;
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  onStart: () => void;
  onUpgrades: () => void;
  onlinePanel: ReactNode;
}

export function StartScreen({
  progress,
  mode,
  onModeChange,
  onStart,
  onUpgrades,
  onlinePanel,
}: StartScreenProps) {
  const tab = (value: PlayMode, label: string, icon: ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => onModeChange(value)}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition ${
        mode === value ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <OverlayShell>
      <div className="flex flex-col items-center gap-1 text-center">
        <Mountain className="h-8 w-8 text-amber-400" />
        <h2 className="font-display text-3xl font-black tracking-tight text-white">Summit Rush</h2>
        <p className="text-xs text-slate-300">
          Drive as far as you can. Grab fuel, stack coins, land your flips.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile
          label="Best"
          value={`${progress.bestDistance} m`}
          icon={<Trophy className="h-3 w-3" />}
        />
        <StatTile
          label="Coins"
          value={progress.coins.toLocaleString()}
          icon={<Coins className="h-3 w-3" />}
        />
        <StatTile
          label="Runs"
          value={String(progress.totalRuns)}
          icon={<RotateCcw className="h-3 w-3" />}
        />
      </div>

      <div
        role="tablist"
        className="mt-4 flex gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10"
      >
        {tab('solo', 'Solo run', <User className="h-3.5 w-3.5" />)}
        {tab('online', 'Online race', <Globe className="h-3.5 w-3.5" />)}
      </div>

      {mode === 'solo' ? (
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={onStart} autoFocus>
            <Play className="h-4 w-4" /> Start driving
          </button>
          <button type="button" className={SECONDARY_BTN} onClick={onUpgrades}>
            <Wrench className="h-4 w-4" /> Garage &amp; upgrades
          </button>
        </div>
      ) : (
        <div className="mt-4">{onlinePanel}</div>
      )}

      <ControlsLegend />
    </OverlayShell>
  );
}

export function ControlsLegend() {
  const key =
    'rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white ring-1 ring-white/15';
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
      <span>
        <kbd className={key}>D</kbd> / <kbd className={key}>→</kbd> Gas
      </span>
      <span>
        <kbd className={key}>A</kbd> / <kbd className={key}>←</kbd> Brake · reverse
      </span>
      <span>
        <kbd className={key}>P</kbd> / <kbd className={key}>Esc</kbd> Pause
      </span>
      <span>
        <kbd className={key}>R</kbd> Restart run
      </span>
      <span className="col-span-2 text-slate-400">
        In the air: gas tilts back, brake tilts forward. Touch: use the pedals.
      </span>
    </div>
  );
}

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseScreen({ onResume, onRestart, onQuit }: PauseScreenProps) {
  return (
    <OverlayShell>
      <h2 className="text-center font-display text-2xl font-black text-white">Paused</h2>
      <div className="mt-4 flex flex-col gap-2">
        <button type="button" className={PRIMARY_BTN} onClick={onResume} autoFocus>
          <Play className="h-4 w-4" /> Resume
        </button>
        <button type="button" className={SECONDARY_BTN} onClick={onRestart}>
          <RotateCcw className="h-4 w-4" /> Restart run
        </button>
        <button type="button" className={SECONDARY_BTN} onClick={onQuit}>
          End run
        </button>
      </div>
      <ControlsLegend />
    </OverlayShell>
  );
}

export function CountdownOverlay({
  value,
  rivalName,
}: {
  value: number;
  rivalName: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2">
      {rivalName && (
        <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-fuchsia-200">
          vs {rivalName}
        </span>
      )}
      <span
        key={value}
        className="summit-count-pop font-display text-7xl font-black text-white drop-shadow-[0_4px_0_rgba(15,23,42,0.8)] sm:text-8xl"
      >
        {value > 0 ? value : 'GO!'}
      </span>
    </div>
  );
}
