'use client';

import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { GameTemplateHeader } from './GameTemplateHeader';
import { GameTemplateTabs, GameRuleItem, GameControlItem } from './GameTemplateTabs';

export interface GameTemplateProps {
  game: GameDefinition;
  children?: React.ReactNode;
  rules?: GameRuleItem[];
  controls?: GameControlItem[];
  onPlay?: () => void;
  backHref?: string;
  showTabs?: boolean;
}

export function GameTemplate({
  game,
  children,
  rules,
  controls,
  onPlay,
  backHref,
  showTabs = true,
}: GameTemplateProps) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      {/* 1. Standardized Game Header with Badges & Thumbnail */}
      <GameTemplateHeader game={game} onPlay={onPlay} backHref={backHref} />

      {/* 2. Primary Game Stage Area */}
      {children && (
        <section className="relative rounded-2xl border border-surface-border bg-surface-raised overflow-hidden shadow-sm">
          <div className="min-h-[380px] flex flex-col items-center justify-center p-4 md:p-8 bg-surface-base/40 arcade-texture">
            {children}
          </div>
        </section>
      )}

      {/* 3. Comprehensive Tabs: Rules, Controls & Specs */}
      {showTabs && <GameTemplateTabs game={game} rules={rules} controls={controls} />}
    </div>
  );
}
