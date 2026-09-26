'use client';

import { Coins, Heart, Key, Shield, Sparkles, Swords, Zap } from 'lucide-react';
import React from 'react';
import { type ItemDrop, RARITY_CONFIG } from '../engine/equipment';

interface LootDropStageProps {
  drops: ItemDrop[];
  onCollectDrop: (drop: ItemDrop) => void;
  onCollectAll: () => void;
}

function getItemIcon(type: ItemDrop['type']) {
  switch (type) {
    case 'coin':
      return Coins;
    case 'health_potion':
      return Heart;
    case 'armor_piece':
      return Shield;
    case 'xp_crystal':
      return Zap;
    case 'dungeon_key':
      return Key;
    case 'chest_reward':
    default:
      return Swords;
  }
}

export function LootDropStage({ drops, onCollectDrop, onCollectAll }: LootDropStageProps) {
  if (drops.length === 0) return null;

  return (
    <div className="absolute inset-x-4 bottom-24 z-20 flex flex-col items-center gap-3">
      {/* Header pill with auto-claim */}
      <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-950/90 px-3.5 py-1 text-xs backdrop-blur-md shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="font-mono uppercase tracking-wider text-[10px] text-amber-300 font-bold">
          Loot Drops Available ({drops.length})
        </span>
        <button
          type="button"
          onClick={onCollectAll}
          className="ml-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
        >
          Claim All
        </button>
      </div>

      {/* Drop Item Cards */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {drops.map((drop) => {
          const Icon = getItemIcon(drop.type);
          const rarity = drop.rarity ? RARITY_CONFIG[drop.rarity] : null;

          return (
            <button
              key={drop.id}
              type="button"
              onClick={() => onCollectDrop(drop)}
              className={`group flex items-center gap-2.5 rounded-xl border p-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md ${
                rarity
                  ? `${rarity.border} ${rarity.bg} hover:ring-2 hover:ring-amber-400/40`
                  : 'border-surface-border bg-slate-900/90 hover:border-amber-500/50'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-slate-950/80 ${
                  rarity ? rarity.border : 'border-amber-500/30 text-amber-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${rarity ? rarity.color : 'text-amber-400'}`} />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {drop.name}
                  </span>
                  {rarity && (
                    <span
                      className={`px-1 py-0.2 rounded text-[8px] font-mono uppercase font-bold border ${rarity.badge}`}
                    >
                      {rarity.label}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-deck-400 line-clamp-1">{drop.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
