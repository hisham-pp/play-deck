'use client';

import { ArrowDown, ArrowLeft, ArrowUp, FastForward, RotateCcw, RotateCw } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '@playdeck/ui';

interface HumanConveyorControlsProps {
  onAdjust: (delta: { angleDelta?: number; elevationDelta?: number; speedDelta?: number }) => void;
  disabled?: boolean;
}

export function HumanConveyorControls({ onAdjust, disabled = false }: HumanConveyorControlsProps) {
  // Global keyboard shortcuts
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'q':
        case 'arrowleft':
          onAdjust({ angleDelta: -0.06 });
          break;
        case 'e':
        case 'arrowright':
          onAdjust({ angleDelta: 0.06 });
          break;
        case 'w':
        case 'arrowup':
          onAdjust({ elevationDelta: -10 });
          break;
        case 's':
        case 'arrowdown':
          onAdjust({ elevationDelta: 10 });
          break;
        case 'd':
          onAdjust({ speedDelta: 25 });
          break;
        case 'a':
          onAdjust({ speedDelta: -25 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAdjust, disabled]);

  return (
    <div className="w-full bg-[#0b101d] p-3 rounded-xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
      {/* Tilt controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-deck-400 mr-1 hidden sm:inline">
          Tilt:
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ angleDelta: -0.06 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Tilt Left (Q / ←)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs">Left [Q]</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ angleDelta: 0.06 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Tilt Right (E / →)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="text-xs">Right [E]</span>
        </Button>
      </div>

      {/* Elevation controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-deck-400 mr-1 hidden sm:inline">
          Height:
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ elevationDelta: -10 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Raise Platform (W / ↑)"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span className="text-xs">Raise [W]</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ elevationDelta: 10 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Lower Platform (S / ↓)"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span className="text-xs">Lower [S]</span>
        </Button>
      </div>

      {/* Belt motor speed */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-deck-400 mr-1 hidden sm:inline">
          Belt:
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ speedDelta: -25 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Belt Reverse (A)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-xs">Reverse [A]</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAdjust({ speedDelta: 25 })}
          disabled={disabled}
          className="gap-1 px-2.5"
          title="Belt Forward (D)"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span className="text-xs">Forward [D]</span>
        </Button>
      </div>
    </div>
  );
}
