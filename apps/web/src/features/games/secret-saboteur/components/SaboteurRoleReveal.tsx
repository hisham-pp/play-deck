'use client';

import React from 'react';

import type { SaboteurPlayer } from '../types/secret-saboteur.types';

export interface SaboteurRoleRevealProps {
  localPlayer: SaboteurPlayer | null;
  timeRemaining: number;
}

const ROLE_CONFIG: Record<
  SaboteurPlayer['role'],
  {
    label: string;
    icon: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  worker: {
    label: 'WORKER',
    icon: '⚙️',
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-950/30',
    borderColor: 'border-sky-500/40',
    description:
      'Build the Reactor Core to 100% before the Saboteur triggers 3 critical meltdowns. Contribute high-power cards and identify the infiltrator.',
  },
  saboteur: {
    label: 'SABOTEUR',
    icon: '☢️',
    textColor: 'text-red-400',
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-500/40',
    description:
      'You are the hidden infiltrator. Play sabotage cards covertly to trigger 3 meltdowns. Blend in — if the crew detains you, the Workers win.',
  },
  inspector: {
    label: 'INSPECTOR',
    icon: '🔍',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-500/40',
    description:
      'You are the silent investigator. Contribute positively like a Worker, but you have heightened suspicion intelligence. Guide the crew to truth.',
  },
};

export function SaboteurRoleReveal({ localPlayer, timeRemaining }: SaboteurRoleRevealProps) {
  const role = localPlayer?.role ?? 'worker';
  const cfg = ROLE_CONFIG[role];

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div
        className={`w-full max-w-sm border ${cfg.borderColor} ${cfg.bgColor} rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl`}
      >
        <div className="text-xs font-mono font-black uppercase text-slate-500 tracking-widest mb-1">
          ☢ CLASSIFIED BRIEFING
        </div>

        <div className="text-6xl leading-none">{cfg.icon}</div>

        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">YOUR ROLE IS</div>
          <div className={`text-3xl font-black tracking-widest ${cfg.textColor}`}>{cfg.label}</div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{cfg.description}</p>

        <div
          className={`text-xs font-mono px-3 py-2 rounded-xl ${role === 'saboteur' ? 'bg-red-950/50 text-red-400' : 'bg-slate-950/60 text-slate-400'}`}
        >
          {role === 'saboteur'
            ? '🔴 For your eyes only. Do not reveal your role.'
            : '🟢 This briefing self-destructs when the mission begins.'}
        </div>

        <div className="text-xs text-slate-500">
          Mission begins in <span className="font-bold text-amber-400">{timeRemaining}s</span>
        </div>
      </div>
    </div>
  );
}
