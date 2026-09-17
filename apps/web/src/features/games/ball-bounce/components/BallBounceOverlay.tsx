'use client';

import { Keyboard, Hand, Play, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui';
import { POWER_UP_STYLE } from '../render/ball-bounce-palette';
import type { BallBounceHud, BallBounceStats, PowerUpKind } from '../types/ball-bounce.types';

interface BallBounceOverlayProps {
  hud: BallBounceHud;
  stats: BallBounceStats | null;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const PANEL =
  'w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b1120]/95 p-6 sm:p-7 text-center shadow-2xl';
const KEY = 'text-white';
const POWER_UP_ORDER: PowerUpKind[] = ['wide', 'multi', 'slow', 'life'];

function Scrim({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-[#05070d]/70 backdrop-blur-[2px] bb-fade">
      {children}
    </div>
  );
}

function StartPanel({ hud, onStart }: { hud: BallBounceHud; onStart: () => void }) {
  return (
    <div data-ui-control className={PANEL}>
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.06)]" />
      <h1 className="text-3xl font-black font-display tracking-tight text-white">Ball Bounce</h1>
      <p className="mt-1.5 text-sm text-deck-400">Keep the ball alive. Break every block.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 text-left">
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
          <Keyboard className="w-4 h-4 text-amber-400 mb-1.5" />
          <p className="text-[11px] leading-snug text-deck-300">
            <b className={KEY}>← →</b> or <b className={KEY}>A D</b> to move.{' '}
            <b className={KEY}>P</b> to pause.
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
          <Hand className="w-4 h-4 text-amber-400 mb-1.5" />
          <p className="text-[11px] leading-snug text-deck-300">
            <b className={KEY}>Drag anywhere</b> or move the mouse to steer.
          </p>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {POWER_UP_ORDER.map((kind) => (
          <li key={kind} className="flex items-center gap-1.5 text-[11px] text-deck-400">
            <span
              className="inline-flex items-center justify-center h-4 min-w-7 px-1.5 rounded-full text-[10px] font-black text-slate-950"
              style={{ backgroundColor: POWER_UP_STYLE[kind].color }}
            >
              {POWER_UP_STYLE[kind].glyph}
            </span>
            {POWER_UP_STYLE[kind].label}
          </li>
        ))}
      </ul>

      <Button onClick={onStart} size="lg" className="mt-6 w-full gap-2" autoFocus>
        <Play className="w-4 h-4 fill-current" />
        Play
      </Button>
      {hud.highScore > 0 && (
        <p className="mt-3 text-xs text-deck-500">
          Best{' '}
          <span className="font-bold text-amber-400 tabular-nums">
            {hud.highScore.toLocaleString()}
          </span>
        </p>
      )}
    </div>
  );
}

function GameOverPanel({
  hud,
  stats,
  onRestart,
}: {
  hud: BallBounceHud;
  stats: BallBounceStats | null;
  onRestart: () => void;
}) {
  const rows: Array<[string, string | number]> = [
    ['Level reached', hud.level],
    ['Blocks broken', hud.blocksBroken],
    ['Best combo', hud.bestCombo],
    ['Games played', stats?.gamesPlayed ?? '–'],
  ];
  return (
    <div data-ui-control className={PANEL}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400">Game over</p>
      <p className="mt-2 text-5xl font-black font-display tabular-nums text-white">
        {hud.score.toLocaleString()}
      </p>
      {hud.isNewHighScore ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
          <Trophy className="w-3.5 h-3.5" /> New high score
        </p>
      ) : (
        <p className="mt-2 text-xs text-deck-400">
          High score{' '}
          <span className="font-bold text-amber-400 tabular-nums">
            {hud.highScore.toLocaleString()}
          </span>
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-deck-500">{label}</dt>
            <dd className="text-lg font-black font-display tabular-nums text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <Button onClick={onRestart} size="lg" className="mt-6 w-full gap-2" autoFocus>
        <RotateCcw className="w-4 h-4" />
        Play again
      </Button>
      <Link href="/games" className="mt-3 inline-block text-xs text-deck-500 hover:text-white">
        Back to games
      </Link>
    </div>
  );
}

export function BallBounceOverlay({
  hud,
  stats,
  onStart,
  onResume,
  onRestart,
}: BallBounceOverlayProps) {
  switch (hud.status) {
    case 'idle':
      return (
        <Scrim>
          <StartPanel hud={hud} onStart={onStart} />
        </Scrim>
      );
    case 'countdown':
      return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-deck-400">
            Level {hud.level}
          </span>
          <span
            key={hud.countdown}
            className="mt-1 text-8xl font-black font-display text-white bb-pop"
          >
            {hud.countdown}
          </span>
        </div>
      );
    case 'paused':
      return (
        <Scrim>
          <div data-ui-control className={PANEL}>
            <p className="text-2xl font-black font-display text-white">Paused</p>
            <p className="mt-1 text-xs text-deck-400">Press P or Space to resume</p>
            <Button onClick={onResume} size="lg" className="mt-5 w-full gap-2" autoFocus>
              <Play className="w-4 h-4 fill-current" />
              Resume
            </Button>
            <Button onClick={onRestart} variant="outline" size="md" className="mt-2 w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
            <Link
              href="/games"
              className="mt-3 inline-block text-xs text-deck-500 hover:text-white"
            >
              Quit to games
            </Link>
          </div>
        </Scrim>
      );
    case 'level-clear':
      return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
            Cleared
          </span>
          <span className="mt-1 text-5xl font-black font-display text-white bb-pop">
            Level {hud.level}
          </span>
          <span className="mt-2 text-xs text-deck-400">
            Next level: faster ball, tougher blocks
          </span>
        </div>
      );
    case 'over':
      return (
        <Scrim>
          <GameOverPanel hud={hud} stats={stats} onRestart={onRestart} />
        </Scrim>
      );
    default:
      return null;
  }
}
