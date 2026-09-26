'use client';

import { LogOut, Pause, Play, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { usePreferencesStore } from '@/stores/preferences.store';
import { STATUS_PAUSED, STATUS_PLAYING } from '../engine/snake-ladder-constants';
import type { SnakeLadderGameState } from '../types/snake-and-ladder.types';

const VARIANT_OUTLINE = 'outline';
const ICON_CLASS = 'mr-1.5 h-4 w-4';

interface SnakeLadderControlsProps {
  state: SnakeLadderGameState;
  /** Online seats share one engine, so pausing is offline-only. */
  canPause: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onLeave: () => void;
}

export function SnakeLadderControls({
  state,
  canPause,
  onPause,
  onResume,
  onRestart,
  onLeave,
}: SnakeLadderControlsProps) {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canPause && state.status === STATUS_PLAYING && (
        <Button variant={VARIANT_OUTLINE} size="sm" onClick={onPause}>
          <Pause className={ICON_CLASS} /> Pause
        </Button>
      )}
      {canPause && state.status === STATUS_PAUSED && (
        <Button variant={VARIANT_OUTLINE} size="sm" onClick={onResume}>
          <Play className={ICON_CLASS} /> Resume
        </Button>
      )}
      <Button
        variant={VARIANT_OUTLINE}
        size="sm"
        onClick={() => void toggleSound()}
        title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        aria-label={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4 text-amber-400" />
        ) : (
          <VolumeX className="h-4 w-4 text-slate-500" />
        )}
      </Button>
      <Button variant={VARIANT_OUTLINE} size="sm" onClick={onRestart}>
        <RefreshCw className={ICON_CLASS} /> Restart
      </Button>
      <Button variant={VARIANT_OUTLINE} size="sm" onClick={onLeave}>
        <LogOut className={ICON_CLASS} /> Leave
      </Button>
    </div>
  );
}
