'use client';

import {
  ArrowLeft,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/stores/preferences.store';
import { MAX_LIVES } from '../engine/ball-bounce-constants';
import type { BallBounceHud as HudState } from '../types/ball-bounce.types';

interface BallBounceHudProps {
  hud: HudState;
  onTogglePause: () => void;
  fullscreen: { supported: boolean; isFullscreen: boolean; toggle: () => void };
}

const ICON = 'w-4 h-4';
const ICON_BUTTON =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg text-deck-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

function Stat({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center min-w-0', className)}>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-deck-500">
        {label}
      </span>
      <span className="text-sm sm:text-base font-black font-display tabular-nums text-white leading-tight">
        {children}
      </span>
    </div>
  );
}

function StatsStrip({ hud, className }: { hud: HudState; className?: string }) {
  const comboHot = hud.multiplier > 1;
  return (
    <div className={cn('items-center justify-between gap-4 sm:gap-7', className)}>
      <Stat label="Score" className="min-w-[64px]">
        {hud.score.toLocaleString()}
      </Stat>
      <Stat label="Best">
        <span className={cn(hud.isNewHighScore ? 'text-amber-400' : 'text-deck-300')}>
          {hud.highScore.toLocaleString()}
        </span>
      </Stat>
      <Stat label="Level">{hud.level}</Stat>
      <Stat label="Lives">
        <span className="flex items-center gap-0.5 h-5 sm:h-6" aria-label={`${hud.lives} lives`}>
          {Array.from({ length: Math.max(MAX_LIVES, hud.lives) }, (_, i) => (
            <Heart
              key={i}
              className={cn(
                'w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all',
                i < hud.lives ? 'fill-rose-500 text-rose-500' : 'text-deck-700',
                i >= 3 && i >= hud.lives && 'hidden',
              )}
            />
          ))}
        </span>
      </Stat>
      <Stat label="Combo" className="min-w-[52px]">
        <span className={cn('transition-colors', comboHot ? 'text-amber-400' : 'text-deck-300')}>
          {hud.combo > 0 ? `${hud.combo}` : '–'}
          {comboHot && <span className="ml-1 text-[11px] font-bold">×{hud.multiplier}</span>}
        </span>
      </Stat>
    </div>
  );
}

export function BallBounceHud({ hud, onTogglePause, fullscreen }: BallBounceHudProps) {
  const { soundEnabled, toggleSound } = usePreferencesStore();
  const canPause = ['playing', 'countdown', 'level-clear', 'paused'].includes(hud.status);
  const paused = hud.status === 'paused';

  return (
    <div data-ui-control className="shrink-0 border-b border-white/5 bg-[#070a12]">
      <div className="flex items-center gap-2 px-2 sm:px-4 h-14">
        <Link href="/games" className={ICON_BUTTON} aria-label="Back to games">
          <ArrowLeft className={ICON} />
        </Link>
        <div className="hidden sm:flex flex-col leading-none mr-2">
          <span className="text-sm font-black font-display tracking-tight text-white">
            BALL BOUNCE
          </span>
          <span className="flex gap-1.5 mt-1 h-3">
            {hud.wideActive && <PowerChip color="bg-amber-400">Wide</PowerChip>}
            {hud.slowActive && <PowerChip color="bg-sky-400">Slow</PowerChip>}
          </span>
        </div>

        <StatsStrip hud={hud} className="hidden md:flex mx-auto" />

        <div className="ml-auto md:ml-0 flex items-center gap-1">
          <button
            type="button"
            className={ICON_BUTTON}
            onClick={() => void toggleSound()}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 className={ICON} /> : <VolumeX className={ICON} />}
          </button>
          {fullscreen.supported && (
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={fullscreen.toggle}
              aria-label={fullscreen.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {fullscreen.isFullscreen ? (
                <Minimize2 className={ICON} />
              ) : (
                <Maximize2 className={ICON} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onTogglePause}
            disabled={!canPause}
            aria-label={paused ? 'Resume game' : 'Pause game'}
            className="ml-1 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 active:scale-[0.97] transition disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {paused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">{paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      <StatsStrip hud={hud} className="flex md:hidden px-4 pb-2" />
    </div>
  );
}

function PowerChip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'px-1.5 rounded-sm text-[8px] font-black uppercase tracking-wider text-slate-950 leading-3',
        color,
      )}
    >
      {children}
    </span>
  );
}
