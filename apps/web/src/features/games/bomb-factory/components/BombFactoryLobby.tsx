'use client';

import { Headset, Smartphone } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CHANNEL_BLURBS, CHANNEL_ROLES, CHANNELS } from '../engine/bomb-factory-constants';
import { bombFactoryStatsRepository } from '../services/bomb-factory-stats-repository';
import type { BombFactoryStats } from '../types/bomb-factory.types';

interface BombFactoryLobbyProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
}

export function BombFactoryLobby({ onSelectLocal, onSelectOnline }: BombFactoryLobbyProps) {
  const [stats, setStats] = useState<BombFactoryStats | null>(null);

  useEffect(() => {
    void bombFactoryStatsRepository.getStats().then(setStats);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
          Cooperative · 2-6 · voice required
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-deck-950 dark:text-white">
          Bomb Factory
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-deck-400">
          A machine blueprint, cut four ways and handed out. One of you knows the order, one knows
          the bays, one knows the dials, one knows what will kill you. Build it before the clock
          runs out — and the only way through is talking.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSelectOnline}
          className="group flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-surface-raised p-5 text-left transition-colors hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <Headset className="h-6 w-6 text-amber-400" aria-hidden="true" />
          <span className="font-display text-base font-bold text-deck-950 dark:text-white">
            Open a factory room
          </span>
          <span className="text-xs leading-relaxed text-deck-400">
            Two to six players on their own devices, each holding a different sheet, talking over
            PlayDeck voice chat. This is the real game.
          </span>
        </button>

        <button
          type="button"
          onClick={onSelectLocal}
          className="group flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised p-5 text-left transition-colors hover:border-surface-border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <Smartphone className="h-6 w-6 text-deck-300" aria-hidden="true" />
          <span className="font-display text-base font-bold text-deck-950 dark:text-white">
            Local drill
          </span>
          <span className="text-xs leading-relaxed text-deck-400">
            One device passed around the table. Sheets stay covered until whoever holds it reveals
            them — also the quickest way to learn the calls on your own.
          </span>
        </button>
      </div>

      <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-deck-900 dark:text-white">
          Who knows what
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <li
              key={channel}
              className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-2"
            >
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                {CHANNEL_ROLES[channel]}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-deck-400">
                {CHANNEL_BLURBS[channel]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {stats && stats.shiftsPlayed > 0 && (
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Shifts', value: `${stats.shiftsCompleted}/${stats.shiftsPlayed}` },
            { label: 'Machines', value: String(stats.machinesCleared) },
            { label: 'Best score', value: String(stats.bestScore) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-surface-border bg-surface-raised p-3"
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deck-500">
                {stat.label}
              </dt>
              <dd className="mt-1 font-mono text-base font-black text-deck-900 dark:text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
