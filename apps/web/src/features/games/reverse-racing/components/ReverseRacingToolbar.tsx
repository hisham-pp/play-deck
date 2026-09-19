'use client';

import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Contrast,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import { Badge, Button } from '@playdeck/ui';
import { OBSTACLE_CONFIG } from '../engine/obstacle-system';
import type { ObstacleType, SaboteurState } from '../types/reverse-racing.types';

interface ReverseRacingToolbarProps {
  saboteur: SaboteurState;
  onSelectObstacle: (type: ObstacleType) => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onJump: () => void;
  onBrake: (dt: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  highContrast: boolean;
  onToggleContrast: () => void;
  reducedMotion: boolean;
  onToggleMotion: () => void;
  onRestart: () => void;
}

const OBSTACLE_ORDER: { type: ObstacleType; key: string }[] = [
  { type: 'roadblock', key: '1' },
  { type: 'oil-slick', key: '2' },
  { type: 'speed-bump', key: '3' },
  { type: 'moving-wall', key: '4' },
  { type: 'fake-road', key: '5' },
  { type: 'boost-pad', key: '6' },
];

export function ReverseRacingToolbar({
  saboteur,
  onSelectObstacle,
  onSteerLeft,
  onSteerRight,
  onJump,
  onBrake,
  soundEnabled,
  onToggleSound,
  highContrast,
  onToggleContrast,
  reducedMotion,
  onToggleMotion,
  onRestart,
}: ReverseRacingToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Saboteur Obstacle Selector Bar */}
      <div className="rounded-xl border border-deck-border bg-deck-900/90 p-3 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-deck-400">
            Deploy Sabotage Hazard (1–6 or Click)
          </div>
          <div className="text-xs font-semibold text-amber-400">
            Available Energy: {Math.floor(saboteur.energy)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {OBSTACLE_ORDER.map(({ type, key }) => {
            const config = OBSTACLE_CONFIG[type];
            const isSelected = saboteur.selectedObstacle === type;
            const canAfford = saboteur.energy >= config.cost;

            return (
              <button
                key={type}
                onClick={() => onSelectObstacle(type)}
                className={`group relative flex flex-col items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                    : canAfford
                      ? 'border-deck-border/60 bg-deck-800 hover:border-deck-border hover:bg-deck-750'
                      : 'cursor-not-allowed border-deck-border/30 bg-deck-900/50 opacity-50'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-deck-400">[{key}]</span>
                  <Badge variant={canAfford ? 'default' : 'outline'} size="sm">
                    {config.cost}⚡
                  </Badge>
                </div>

                <div className="my-1.5 text-2xl">{config.icon}</div>

                <div className="w-full text-center">
                  <div className="truncate text-xs font-bold text-deck-100">{config.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Driver Touchpad & Accessibility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-deck-border bg-deck-900/90 p-3">
        {/* On-Screen Driver Controls for touch/mouse */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSteerLeft}
            aria-label="Steer Left"
            className="flex items-center gap-1 font-bold"
          >
            <ArrowBigLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Left (A)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onJump}
            aria-label="Jump Vehicle"
            className="flex items-center gap-1 border-sky-500/40 bg-sky-500/10 font-bold text-sky-400 hover:bg-sky-500/20"
          >
            <ArrowBigUp className="h-4 w-4" />
            <span className="hidden sm:inline">Jump (Space)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onSteerRight}
            aria-label="Steer Right"
            className="flex items-center gap-1 font-bold"
          >
            <span className="hidden sm:inline">Right (D)</span>
            <ArrowBigRight className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onBrake(0.1)}
            aria-label="Brake"
            className="flex items-center gap-1 text-xs"
          >
            <ArrowBigDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Brake (S)</span>
          </Button>
        </div>

        {/* Global Settings & Toggles */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-deck-400" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleContrast}
            aria-label="Toggle high contrast"
            title="High Contrast"
            className={highContrast ? 'text-amber-400' : ''}
          >
            <Contrast className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleMotion}
            aria-label="Toggle reduced motion"
            title="Reduced Motion"
            className={reducedMotion ? 'text-amber-400' : ''}
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onRestart}
            aria-label="Restart race"
            title="Restart Race"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
