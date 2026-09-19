'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { mapName } from '../engine/map-layout';
import type { GiantControls } from '../hooks/use-giant-input';
import type { GiantHud } from '../types/giant.types';
import { GiantAnnouncer } from './GiantAnnouncer';
import { GiantCanvas } from './GiantCanvas';
import { GiantHudBar } from './GiantHud';
import { GiantScoreboard } from './GiantScoreboard';
import { GiantTouchControls } from './GiantTouchControls';

interface GiantChamberProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hud: GiantHud;
  controls: GiantControls;
  mapId: string;
  localPlayerId: string | null;
  highContrast: boolean;
  onToggleContrast: () => void;
  onLeave: () => void;
}

const KEY_HINTS: { key: string; action: string }[] = [
  { key: 'WASD / Arrows', action: 'Move — walking is already a sound' },
  { key: 'Shift', action: 'Run — fast, and far too loud' },
  { key: 'C / Ctrl', action: 'Tiptoe — almost silent, almost still' },
  { key: 'E / Space', action: 'Take what is in reach' },
];

export function GiantChamber({
  canvasRef,
  hud,
  controls,
  mapId,
  localPlayerId,
  highContrast,
  onToggleContrast,
  onLeave,
}: GiantChamberProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <GiantHudBar hud={hud} highContrast={highContrast} onToggleContrast={onToggleContrast} />
        <GiantCanvas canvasRef={canvasRef} hud={hud} mapName={mapName(mapId)} />
        <GiantTouchControls controls={controls} />
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
          The crew
        </h2>
        <GiantScoreboard standings={hud.standings} localPlayerId={localPlayerId} showNoise />
        <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-[11px] leading-relaxed text-slate-400">
          Everyone loses together. The meter is shared, so the loudest person in the room decides
          how long the rest of you get.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="justify-start text-slate-400"
        >
          <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Leave the chamber
        </Button>
      </aside>

      <GiantAnnouncer message={hud.announcement} />
    </div>
  );
}
