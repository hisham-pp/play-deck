'use client';

import { Play, Pause, LogOut, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { usePreferencesStore } from '@/stores/preferences.store';
import type { LudoGameState } from '../types/ludo.types';

interface LudoControlsProps {
  state: LudoGameState;
  onPause: () => void;
  onResume: () => void;
  onLeave: () => void;
}

export function LudoControls({ state, onPause, onResume, onLeave }: LudoControlsProps) {
  const isPaused = state.status === 'paused';
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
      <div className="flex items-center gap-2">
        {isPaused ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onResume}
            className="border-emerald-500/40 text-emerald-400"
          >
            <Play className="w-4 h-4 mr-1.5" /> Resume
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onPause} className="border-slate-700">
            <Pause className="w-4 h-4 mr-1.5" /> Pause
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => void toggleSound()}
          className="border-slate-700 text-slate-400 hover:text-white"
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          aria-label={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onLeave}
        className="text-slate-400 hover:text-slate-200"
      >
        <LogOut className="w-4 h-4 mr-1.5" /> Exit Game
      </Button>
    </div>
  );
}
