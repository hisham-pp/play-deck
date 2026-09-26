'use client';

import {
  Axe,
  Crosshair,
  Flame,
  Hammer,
  Shield,
  Sparkles,
  Sword,
  Swords,
  Target,
  Zap,
} from 'lucide-react';
import React from 'react';
import { type PlayerInventory, RARITY_CONFIG, getWeapon } from '../engine/equipment';

interface WeaponLoadoutBarProps {
  inventory: PlayerInventory;
  onEquipWeapon: (weaponId: string) => void;
  disabled?: boolean;
}

function getWeaponIcon(iconName: string) {
  switch (iconName) {
    case 'Zap':
      return Zap;
    case 'Swords':
      return Swords;
    case 'Axe':
      return Axe;
    case 'Crosshair':
      return Crosshair;
    case 'Target':
      return Target;
    case 'Hammer':
      return Hammer;
    case 'Shield':
      return Shield;
    case 'Sparkles':
      return Sparkles;
    case 'Sword':
    default:
      return Sword;
  }
}

export function WeaponLoadoutBar({
  inventory,
  onEquipWeapon,
  disabled = false,
}: WeaponLoadoutBarProps) {
  const activeWeapon = getWeapon(inventory.equippedWeaponId);
  const ActiveIcon = getWeaponIcon(activeWeapon.icon);
  const activeRarity = RARITY_CONFIG[activeWeapon.rarity];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-surface-border bg-surface-base/90 p-3 shadow-arcade">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500 font-mono flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-amber-500" />
          <span>Equipped Armament & Loadout</span>
        </div>
        <div className="text-[10px] font-mono text-deck-400">
          Quick-Swap ({inventory.storedWeapons.length}/5)
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        {/* Active Weapon Card */}
        <div
          className={`relative overflow-hidden rounded-xl border p-3 transition-all ${activeRarity.border} ${activeRarity.bg}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg border bg-slate-900/80 ${activeRarity.border} ${activeRarity.color}`}
              >
                <ActiveIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white tracking-wide">
                    {activeWeapon.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${activeRarity.badge}`}
                  >
                    {activeRarity.label}
                  </span>
                </div>
                <p className="text-[11px] text-deck-300 italic line-clamp-1 mt-0.5">
                  &ldquo;{activeWeapon.flavorText}&rdquo;
                </p>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-deck-500 font-mono">
                  Damage
                </div>
                <div className="font-mono text-sm font-black text-rose-400">
                  {activeWeapon.damage}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-deck-500 font-mono">
                  Speed
                </div>
                <div className="font-mono text-sm font-black text-sky-400">
                  {activeWeapon.attackSpeed}x
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-deck-500 font-mono">
                  Range
                </div>
                <div className="font-mono text-sm font-black text-emerald-400">
                  {activeWeapon.range}
                </div>
              </div>
            </div>
          </div>

          {/* Special Ability Pill */}
          <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{activeWeapon.specialAbility.name}:</span>
              <span className="text-deck-300 font-normal">
                {activeWeapon.specialAbility.description}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Swap Backpack Slots */}
        <div className="flex items-center gap-1.5 sm:flex-col sm:justify-center">
          <div className="text-[9px] uppercase tracking-wider text-deck-500 font-mono hidden sm:block">
            Swap
          </div>
          <div className="flex items-center gap-1.5">
            {inventory.storedWeapons.map((weaponId, idx) => {
              const weapon = getWeapon(weaponId);
              const isEquipped = weapon.id === activeWeapon.id;
              const Icon = getWeaponIcon(weapon.icon);
              const rarity = RARITY_CONFIG[weapon.rarity];

              return (
                <button
                  key={`${weaponId}-${idx}`}
                  type="button"
                  title={`${weapon.name} (${rarity.label}) - Click to Equip`}
                  disabled={disabled || isEquipped}
                  onClick={() => onEquipWeapon(weapon.id)}
                  className={`group relative p-2 rounded-xl border transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : `border-surface-border bg-surface-raised/80 hover:border-amber-500/50 hover:bg-surface-raised ${rarity.color}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 border border-surface-border text-[8px] font-mono font-bold text-deck-300">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
