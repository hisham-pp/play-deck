'use client';

import React from 'react';
import type { TinyTankArenaState, WeaponType } from '../types/tiny-tank.types';

interface TinyTankHudProps {
  arenaState: TinyTankArenaState;
  localPlayerId: string;
  onSwitchWeapon: (weapon: WeaponType) => void;
}

const WEAPON_LABELS: Record<WeaponType, { name: string; icon: string; color: string }> = {
  cannon: { name: 'Cannon', icon: '💣', color: 'text-amber-400' },
  bouncing: { name: 'Bouncing', icon: '💥', color: 'text-sky-400' },
  homing: { name: 'Homing', icon: '🚀', color: 'text-pink-400' },
  mine: { name: 'Mine', icon: '⚡', color: 'text-red-400' },
  laser: { name: 'Laser', icon: '✨', color: 'text-emerald-400' },
  rubber: { name: 'Rubber', icon: '🟣', color: 'text-purple-400' },
};

const STAT_LABEL_CLASS = 'text-[10px] uppercase font-bold tracking-widest text-slate-400';
const STAT_CONTAINER_CLASS = 'flex flex-col items-center';

function StatItem({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className={STAT_CONTAINER_CLASS}>
      <span className={STAT_LABEL_CLASS}>{label}</span>
      <span className={`font-mono text-xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

function WeaponButton({
  wep,
  idx,
  p1,
  onSwitchWeapon,
}: {
  wep: WeaponType;
  idx: number;
  p1: NonNullable<TinyTankArenaState['players'][number]>;
  onSwitchWeapon: (weapon: WeaponType) => void;
}) {
  const info = WEAPON_LABELS[wep];
  const count = wep === 'cannon' ? '∞' : p1.weaponAmmo[wep] || 0;
  const isAvailable = wep === 'cannon' || (p1.weaponAmmo[wep] || 0) > 0;
  const isActive = p1.activeWeapon === wep;

  const activeClass = isActive
    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
    : isAvailable
      ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
      : 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-40 cursor-not-allowed';

  return (
    <button
      key={wep}
      type="button"
      onClick={() => onSwitchWeapon(wep)}
      disabled={!isAvailable}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 border ${activeClass}`}
    >
      <span className="text-slate-500 font-mono text-[10px]">{idx + 1}:</span>
      <span>{info.icon}</span>
      <span>{info.name}</span>
      <span className="font-mono text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded text-slate-300">
        {count}
      </span>
    </button>
  );
}

export function TinyTankHud({ arenaState, localPlayerId, onSwitchWeapon }: TinyTankHudProps) {
  const p1 = arenaState.players.find((p) => p.id === localPlayerId);
  const p1Stats = arenaState.stats[localPlayerId];
  const aliveCount = arenaState.players.filter((p) => p.isAlive).length;

  const minutes = Math.floor(arenaState.timeRemaining / 60);
  const seconds = Math.floor(arenaState.timeRemaining % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="w-full max-w-[960px] mx-auto mb-3 flex flex-col gap-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-lg text-slate-100">
      <div className="flex items-center justify-between gap-4">
        {/* Local Player Health & Shield */}
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">
                HP: {p1 ? Math.max(0, Math.round(p1.health)) : 0}/{p1?.maxHealth || 100}
              </span>
              {p1 && p1.shield > 0 && (
                <span className="text-sky-400">SHIELD: {Math.round(p1.shield)}</span>
              )}
            </div>
            {/* Health Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/80 relative">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-green-400 transition-all duration-150"
                style={{
                  width: `${p1 ? Math.max(0, (p1.health / p1.maxHealth) * 100) : 0}%`,
                }}
              />
              {p1 && p1.shield > 0 && (
                <div
                  className="absolute top-0 left-0 h-full bg-sky-400/60 transition-all duration-150"
                  style={{ width: `${(p1.shield / p1.maxShield) * 100}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Center Match Stats & Timer */}
        <div className="flex items-center gap-6">
          <StatItem label="TIME" value={formattedTime} colorClass="font-black text-amber-400" />
          <StatItem
            label="TANKS ALIVE"
            value={`${aliveCount}/${arenaState.players.length}`}
            colorClass="text-sky-300"
          />
          <StatItem label="KILLS" value={p1Stats?.kills ?? 0} colorClass="text-red-400" />
          <StatItem label="SCORE" value={p1Stats?.score ?? 0} colorClass="text-amber-300" />
        </div>

        {/* Ammo & Active Weapon Status */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className={STAT_LABEL_CLASS}>STANDARD AMMO</span>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-4 rounded-sm border ${
                    p1 && i < Math.floor(p1.ammo)
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weapon Inventory Bar */}
      {p1 && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
          {(Object.keys(WEAPON_LABELS) as WeaponType[]).map((wep, idx) => (
            <WeaponButton key={wep} wep={wep} idx={idx} p1={p1} onSwitchWeapon={onSwitchWeapon} />
          ))}
        </div>
      )}
    </div>
  );
}
