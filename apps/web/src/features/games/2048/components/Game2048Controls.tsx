import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import type { Direction } from '../types/2048.types';

interface Game2048ControlsProps {
  onMove: (direction: Direction) => void;
  disabled?: boolean;
}

const D_PAD_BTN_CLASS = 'w-12 h-10 flex items-center justify-center p-0 rounded-xl';
const D_PAD_ICON_CLASS = 'w-5 h-5 text-deck-200';
const KEY_HINT_CLASS =
  'font-mono bg-deck-900 border border-deck-800 px-1.5 py-0.5 rounded text-deck-300';
const BTN_VARIANT_OUTLINE = 'outline';

export function Game2048Controls({ onMove, disabled = false }: Game2048ControlsProps) {
  return (
    <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col items-center gap-3">
      {/* Directional Pad for Mobile / Mouse Accessibility */}
      <div className="flex flex-col items-center gap-1.5 sm:hidden">
        <Button
          variant={BTN_VARIANT_OUTLINE}
          size="sm"
          disabled={disabled}
          onClick={() => onMove('UP')}
          aria-label="Move Up"
          className={D_PAD_BTN_CLASS}
        >
          <ArrowUp className={D_PAD_ICON_CLASS} />
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant={BTN_VARIANT_OUTLINE}
            size="sm"
            disabled={disabled}
            onClick={() => onMove('LEFT')}
            aria-label="Move Left"
            className={D_PAD_BTN_CLASS}
          >
            <ArrowLeft className={D_PAD_ICON_CLASS} />
          </Button>

          <Button
            variant={BTN_VARIANT_OUTLINE}
            size="sm"
            disabled={disabled}
            onClick={() => onMove('DOWN')}
            aria-label="Move Down"
            className={D_PAD_BTN_CLASS}
          >
            <ArrowDown className={D_PAD_ICON_CLASS} />
          </Button>

          <Button
            variant={BTN_VARIANT_OUTLINE}
            size="sm"
            disabled={disabled}
            onClick={() => onMove('RIGHT')}
            aria-label="Move Right"
            className={D_PAD_BTN_CLASS}
          >
            <ArrowRight className={D_PAD_ICON_CLASS} />
          </Button>
        </div>
      </div>

      {/* Keyboard Controls Guide */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-deck-500 font-medium select-none">
        <div className="flex items-center gap-1.5">
          <span className={KEY_HINT_CLASS}>W A S D</span>
          <span>or</span>
          <span className={KEY_HINT_CLASS}>Arrows</span>
          <span>to move</span>
        </div>

        <span className="text-deck-700">•</span>

        <div className="flex items-center gap-1.5">
          <span className={KEY_HINT_CLASS}>U</span>
          <span>Undo</span>
        </div>

        <span className="text-deck-700">•</span>

        <div className="flex items-center gap-1.5">
          <span className={KEY_HINT_CLASS}>R</span>
          <span>Restart</span>
        </div>
      </div>
    </div>
  );
}
