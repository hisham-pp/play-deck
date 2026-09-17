'use client';

import { Coins, Fuel, Maximize2, Minimize2, Pause, Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import type { HudSnapshot } from '../hooks/use-summit-loop';

export interface RivalHud {
  name: string;
  distance: number;
  finished: boolean;
}

interface SummitHudProps {
  hud: HudSnapshot;
  bestDistance: number;
  rival: RivalHud | null;
  hint: string | null;
  canPause: boolean;
  soundEnabled: boolean;
  isFullscreen: boolean;
  onPause: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

const CHIP = 'rounded-xl bg-slate-950/60 px-2.5 py-1.5 backdrop-blur-sm ring-1 ring-white/10';
const ICON_BTN =
  'pointer-events-auto grid h-9 w-9 place-items-center rounded-xl bg-slate-950/60 text-slate-100 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-slate-900/80 active:scale-95';

function fuelColor(ratio: number): string {
  if (ratio > 0.5) return 'from-emerald-400 to-lime-300';
  if (ratio > 0.25) return 'from-amber-400 to-yellow-300';
  return 'from-red-500 to-orange-400';
}

function FuelGauge({ hud }: { hud: HudSnapshot }) {
  const ratio = Math.max(0, Math.min(1, hud.fuel / hud.fuelCapacity));
  const low = ratio <= 0.25;
  return (
    <div className={`${CHIP} flex min-w-0 flex-col items-center gap-1`}>
      <div className="flex w-full items-center gap-2">
        <Fuel
          className={`h-4 w-4 shrink-0 ${low ? 'animate-pulse text-red-400' : 'text-emerald-300'}`}
        />
        <div
          className="relative h-3 w-28 overflow-hidden rounded-full bg-slate-800 sm:w-52"
          role="meter"
          aria-label="Fuel"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${fuelColor(ratio)} transition-[width] duration-150 ${low ? 'animate-pulse' : ''}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        {hud.fuel <= 0
          ? 'Out of fuel — coasting!'
          : hud.nextFuel !== null
            ? `Next fuel ${Math.round(hud.nextFuel)} m`
            : 'Fuel'}
      </span>
    </div>
  );
}

function RivalChip({ rival, distance }: { rival: RivalHud; distance: number }) {
  const gap = rival.distance - distance;
  const leading = gap < 0;
  return (
    <div className={`${CHIP} flex items-center gap-2 text-xs font-bold`}>
      <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
      <span className="max-w-24 truncate text-fuchsia-200">{rival.name}</span>
      <span className="font-mono text-white">{rival.distance} m</span>
      <span className={`font-mono ${leading ? 'text-emerald-300' : 'text-red-300'}`}>
        {leading ? `+${-gap}` : `−${gap}`}
      </span>
      {rival.finished && <span className="text-[10px] uppercase text-slate-400">done</span>}
    </div>
  );
}

export function SummitHud(props: SummitHudProps) {
  const { hud, bestDistance, rival, hint, canPause, soundEnabled, isFullscreen } = props;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-2 sm:p-3">
      <div className="flex items-start justify-between gap-2">
        <div className={`${CHIP} flex flex-col leading-tight`}>
          <span className="font-mono text-xl font-black text-white sm:text-2xl">
            {hud.distance} m
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Best {Math.max(bestDistance, hud.distance)} m
          </span>
          <span className="font-mono text-[11px] text-slate-300">{hud.speedKmh} km/h</span>
        </div>

        <FuelGauge hud={hud} />

        <div className="flex flex-col items-end gap-1.5">
          <div className={`${CHIP} flex items-center gap-3`}>
            <span className="flex items-center gap-1 font-mono text-sm font-bold text-amber-300">
              <Coins className="h-4 w-4" />
              {hud.coins}
            </span>
            <span className="hidden font-mono text-sm font-bold text-white sm:inline">
              {hud.score.toLocaleString()} pts
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              className={ICON_BTN}
              onClick={props.onToggleSound}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className={ICON_BTN}
              onClick={props.onToggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            {canPause && (
              <button type="button" className={ICON_BTN} onClick={props.onPause} aria-label="Pause">
                <Pause className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="font-mono text-xs font-bold text-white/90 sm:hidden">
          {hud.score.toLocaleString()} pts
        </span>
        {rival && <RivalChip rival={rival} distance={hud.distance} />}
        {hint && (
          <span className="animate-pulse rounded-full bg-amber-400/90 px-3 py-1 text-center text-[11px] font-bold text-slate-900 shadow">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
