'use client';

import { Button } from '@playdeck/ui';
import { Play, Pause, LogOut } from 'lucide-react';
import type { LudoGameState } from '../types/ludo.types';

interface LudoControlsProps {
  state: LudoGameState;
  onPause: () => void;
  onResume: () => void;
  onLeave: () => void;
}

export function LudoControls({ state, onPause, onResume, onLeave }: LudoControlsProps) {
  const isPaused = state.status === 'paused';

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
