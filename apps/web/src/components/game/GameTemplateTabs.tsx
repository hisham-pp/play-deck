'use client';

import { BookOpen, Gamepad2, Tag } from 'lucide-react';
import React, { useState } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { cn } from '@/lib/utils';
import { GameControlsTab, GameControlItem } from './GameControlsTab';

export type { GameControlItem };

export interface GameRuleItem {
  title: string;
  description: string;
}

interface GameTemplateTabsProps {
  game: GameDefinition;
  rules?: GameRuleItem[];
  controls?: GameControlItem[];
}

const TAB_RULES = 'rules';
const TAB_CONTROLS = 'controls';

type TabType = typeof TAB_RULES | typeof TAB_CONTROLS;

import { DEFAULT_CONTROLS, DEFAULT_RULES } from './game-template-defaults';

export function GameTemplateTabs({ game, rules, controls }: GameTemplateTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>(TAB_RULES);

  const activeControls = controls ||
    DEFAULT_CONTROLS[game.id] || [
      { key: 'Mouse / Touch', action: 'Interact / Select' },
      { key: 'Esc', action: 'Back / Pause' },
    ];

  const activeRules = rules || DEFAULT_RULES[game.id];

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised overflow-hidden">
      <div className="flex items-center border-b border-surface-border bg-surface-overlay/50 px-4">
        <button
          onClick={() => setActiveTab(TAB_RULES)}
          className={cn(
            'flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors',
            activeTab === TAB_RULES
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-deck-500 hover:text-deck-900 dark:hover:text-white',
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Rules & Objectives</span>
        </button>

        <button
          onClick={() => setActiveTab(TAB_CONTROLS)}
          className={cn(
            'flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors',
            activeTab === TAB_CONTROLS
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-deck-500 hover:text-deck-900 dark:hover:text-white',
          )}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Controls & Keybindings</span>
        </button>
      </div>

      <div className="p-6">
        {activeTab === TAB_RULES && (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-deck-600 dark:text-deck-300">
            <p className="text-sm font-medium text-deck-900 dark:text-white">{game.description}</p>
            {activeRules && activeRules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {activeRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-overlay border border-surface-border"
                  >
                    <h5 className="font-bold text-deck-900 dark:text-white mb-1">{rule.title}</h5>
                    <p className="text-deck-500">{rule.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
                <h5 className="font-semibold text-deck-900 dark:text-white mb-1">
                  Standard Play Rules
                </h5>
                <p className="text-deck-500">
                  Follow classic objectives. Match progression, turns, and high scores are tracked
                  directly in your browser.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-overlay text-deck-500 border border-surface-border text-[11px]"
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === TAB_CONTROLS && <GameControlsTab controls={activeControls} />}
      </div>
    </div>
  );
}
