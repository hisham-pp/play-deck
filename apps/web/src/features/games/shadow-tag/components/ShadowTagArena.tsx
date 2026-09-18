'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { arenaName } from '../engine/arena-layout';
import type { ShadowTagControls } from '../hooks/use-shadow-tag-input';
import type { ShadowTagHud } from '../types/shadow-tag.types';
import { ShadowTagAnnouncer } from './ShadowTagAnnouncer';
import { ShadowTagCanvas } from './ShadowTagCanvas';
import { ShadowTagHudBar } from './ShadowTagHud';
import { ShadowTagScoreboard } from './ShadowTagScoreboard';
import { ShadowTagTouchControls } from './ShadowTagTouchControls';

interface ShadowTagArenaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hud: ShadowTagHud;
  controls: ShadowTagControls;
  arenaId: string;
  localPlayerId: string | null;
  highContrast: boolean;
  onToggleContrast: () => void;
  onLeave: () => void;
}

const KEY_HINTS: { key: string; action: string }[] = [
  { key: 'WASD / Arrows', action: 'Move' },
  { key: 'Shift', action: 'Sneak — slower, but leaves no dust' },
  { key: 'E / Space', action: 'Cover the nearest lamp' },
  { key: 'Q', action: 'Reverse the nearest lamp' },
];

export function ShadowTagArena({
  canvasRef,
  hud,
  controls,
  arenaId,
  localPlayerId,
  highContrast,
  onToggleContrast,
  onLeave,
}: ShadowTagArenaProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <ShadowTagHudBar
          hud={hud}
          highContrast={highContrast}
          onToggleContrast={onToggleContrast}
        />
        <ShadowTagCanvas canvasRef={canvasRef} hud={hud} arenaName={arenaName(arenaId)} />
        <ShadowTagTouchControls controls={controls} />
        <div className="hidden rounded-b-xl border border-t-0 border-surface-border bg-surface-overlay px-4 py-3 md:block">
          <dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-400">
            {KEY_HINTS.map((hint) => (
              <div key={hint.key} className="flex items-center gap-2">
                <dt className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                  {hint.key}
                </dt>
                <dd>{hint.action}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-3 lg:w-72 lg:shrink-0">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
          Standings
        </h2>
        <ShadowTagScoreboard
          standings={hud.standings}
          itId={hud.itId}
          localPlayerId={localPlayerId}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="justify-start text-slate-400"
        >
          <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Leave arena
        </Button>
      </aside>

      <ShadowTagAnnouncer message={hud.announcement} />
    </div>
  );
}
