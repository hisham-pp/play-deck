'use client';

import { AlertTriangle, Crown, Shield, ShieldAlert } from 'lucide-react';
import React from 'react';
import { type ActiveEnemyState, type BossPhase, getBossPhase } from '../engine/enemies';

interface EnemyCombatStageProps {
  enemyState: ActiveEnemyState;
}

export function EnemyCombatStage({ enemyState }: EnemyCombatStageProps) {
  const { definition, currentHp, currentShieldHp, aiState, isTelegraphing } = enemyState;
  const isBoss = definition.archetype === 'boss';
  const bossPhase: BossPhase | null = isBoss ? getBossPhase(definition, currentHp) : null;

  const hpPercent = Math.max(0, Math.round((currentHp / definition.maxHp) * 100));
  const maxShield = definition.shieldHp ?? 1;
  const shieldPercent = Math.max(0, Math.round((currentShieldHp / maxShield) * 100));

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
      {/* Boss Phase / Name Banner */}
      <div className="flex flex-col items-center">
        {isBoss && bossPhase && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono font-bold text-rose-300 uppercase tracking-widest mb-1 shadow-sm">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{bossPhase.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white tracking-wide">{definition.name}</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface-overlay border border-surface-border text-deck-400 font-semibold">
            {definition.archetype}
          </span>
        </div>
      </div>

      {/* HP & Shield Bars */}
      <div className="w-36 space-y-1 rounded-xl bg-slate-950/80 border border-surface-border p-2 shadow-md">
        {/* HP Bar */}
        <div className="flex justify-between text-[9px] font-mono text-deck-400 uppercase">
          <span>HP</span>
          <span className="text-rose-400 font-bold">
            {currentHp} / {definition.maxHp}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isBoss ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-rose-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Shield Bar (if enemy has shield) */}
        {definition.shieldHp && definition.shieldHp > 0 && (
          <>
            <div className="flex justify-between text-[9px] font-mono text-deck-400 uppercase pt-0.5">
              <span className="flex items-center gap-1 text-sky-400">
                <Shield className="w-2.5 h-2.5" />
                <span>Guard</span>
              </span>
              <span className="text-sky-400 font-bold">
                {currentShieldHp} / {definition.shieldHp}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-300"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* AI State Warning Badge */}
      {isTelegraphing && definition.specialAttack && (
        <div className="animate-pulse rounded-lg border border-rose-500/60 bg-rose-500/20 px-2.5 py-1 text-center text-[10px] font-mono font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{definition.specialAttack.name}! (Flank to dodge)</span>
        </div>
      )}

      {aiState === 'staggered' && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 text-center text-[10px] font-mono font-bold text-amber-300">
          STAGGERED — Guard Down!
        </div>
      )}

      {aiState === 'blocking' && (
        <div className="rounded-lg border border-sky-500/50 bg-sky-500/20 px-2.5 py-0.5 text-center text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-sky-400" />
          <span>Shield Raised</span>
        </div>
      )}

      {/* Enemy Stickman Figure Graphic */}
      <div
        className={`relative transition-transform duration-150 ${
          enemyState.knockbackOffset > 0 ? 'translate-x-3' : 'translate-x-0'
        } ${isBoss ? 'scale-125' : 'scale-100'}`}
      >
        <div className="relative h-28 w-20">
          {/* Head */}
          <div
            className={`absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border-4 shadow-sm ${
              isBoss
                ? 'border-rose-500 bg-rose-950/80'
                : definition.archetype === 'ninja'
                  ? 'border-purple-500 bg-purple-950/80'
                  : 'border-slate-300 bg-slate-900'
            }`}
          >
            {isBoss && (
              <Crown className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400" />
            )}
          </div>

          {/* Torso */}
          <div
            className={`absolute left-1/2 top-7 h-10 w-1 -translate-x-1/2 ${
              isBoss ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          />

          {/* Left Arm (Holding Weapon or Shield) */}
          <div
            className={`absolute left-[20%] top-11 h-8 w-1 rotate-45 ${
              isBoss ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          />

          {/* Shield graphic if shield archetype */}
          {currentShieldHp > 0 && (
            <div className="absolute left-[5%] top-10 flex h-8 w-4 items-center justify-center rounded-sm bg-sky-600/80 border border-sky-300 shadow-md">
              <Shield className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Right Arm */}
          <div
            className={`absolute right-[20%] top-11 h-8 w-1 -rotate-45 ${
              isBoss ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          />

          {/* Legs */}
          <div
            className={`absolute left-[38%] top-16 h-10 w-1 rotate-[26deg] ${
              isBoss ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          />
          <div
            className={`absolute right-[38%] top-16 h-10 w-1 -rotate-[26deg] ${
              isBoss ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
