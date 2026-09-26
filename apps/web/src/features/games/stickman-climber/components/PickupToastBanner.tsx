'use client';

import { Check, CheckCircle2, Sparkles, X } from 'lucide-react';
import React from 'react';
import { RARITY_CONFIG, type Weapon, compareWeapons, getWeapon } from '../engine/equipment';

interface PickupToastBannerProps {
  notification: string | null;
  newWeaponCandidate: Weapon | null;
  currentEquippedId: string;
  onEquipCandidate: (weaponId: string) => void;
  onDismiss: () => void;
}

export function PickupToastBanner({
  notification,
  newWeaponCandidate,
  currentEquippedId,
  onEquipCandidate,
  onDismiss,
}: PickupToastBannerProps) {
  if (!notification && !newWeaponCandidate) return null;

  const currentWeapon = getWeapon(currentEquippedId);
  const comparison = newWeaponCandidate ? compareWeapons(currentWeapon, newWeaponCandidate) : null;
  const candidateRarity = newWeaponCandidate ? RARITY_CONFIG[newWeaponCandidate.rarity] : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="relative rounded-2xl border border-amber-500/50 bg-slate-950/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md">
        <button
          onClick={onDismiss}
          className="absolute right-2.5 top-2.5 rounded-lg p-1 text-deck-500 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If it's a new weapon comparison card */}
        {newWeaponCandidate && candidateRarity && comparison ? (
          <div className="space-y-3 pr-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                Armament Discovered!
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">{newWeaponCandidate.name}</h4>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold border ${candidateRarity.badge}`}
                  >
                    {candidateRarity.label}
                  </span>
                </div>
                <p className="text-xs text-deck-400 italic mt-0.5">
                  &ldquo;{newWeaponCandidate.flavorText}&rdquo;
                </p>
              </div>
            </div>

            {/* Stat comparison pill */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-surface-border bg-surface-base/80 p-2 text-center text-xs font-mono">
              <div>
                <div className="text-[9px] uppercase text-deck-500">Damage</div>
                <div className="font-bold text-white flex items-center justify-center gap-1">
                  <span>{newWeaponCandidate.damage}</span>
                  <span
                    className={`text-[10px] ${
                      comparison.damageDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    (
                    {comparison.damageDiff >= 0
                      ? `+${comparison.damageDiff}`
                      : comparison.damageDiff}
                    )
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase text-deck-500">Speed</div>
                <div className="font-bold text-white flex items-center justify-center gap-1">
                  <span>{newWeaponCandidate.attackSpeed}x</span>
                  <span
                    className={`text-[10px] ${
                      comparison.speedDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({comparison.speedDiff >= 0 ? `+${comparison.speedDiff}` : comparison.speedDiff}
                    )
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase text-deck-500">Range</div>
                <div className="font-bold text-white flex items-center justify-center gap-1">
                  <span>{newWeaponCandidate.range}</span>
                  <span
                    className={`text-[10px] ${
                      comparison.rangeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({comparison.rangeDiff >= 0 ? `+${comparison.rangeDiff}` : comparison.rangeDiff}
                    )
                  </span>
                </div>
              </div>
            </div>

            {/* Special ability note */}
            <div className="rounded-lg bg-surface-overlay/80 px-2.5 py-1.5 text-[11px] text-amber-200 border border-amber-500/20">
              <span className="font-bold text-amber-400">
                {newWeaponCandidate.specialAbility.name}:
              </span>{' '}
              {newWeaponCandidate.specialAbility.description}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onEquipCandidate(newWeaponCandidate.id);
                  onDismiss();
                }}
                className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Equip Immediately</span>
              </button>

              <button
                type="button"
                onClick={onDismiss}
                className="rounded-xl border border-surface-border bg-surface-raised px-3.5 py-2 text-xs font-bold text-deck-300 hover:text-white hover:border-surface-border/80 transition-all cursor-pointer"
              >
                Keep Stored
              </button>
            </div>
          </div>
        ) : (
          /* General Item Pickup Notification */
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-deck-500">
                Item Acquired
              </div>
              <div className="text-xs font-bold text-white">{notification}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
