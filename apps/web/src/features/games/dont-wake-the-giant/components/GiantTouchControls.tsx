'use client';

import { Footprints, Hand, Rabbit, Wind } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { GiantControls } from '../hooks/use-giant-input';
import type { Gait } from '../types/giant.types';

const PAD_RADIUS = 56;
const KNOB_RADIUS = 24;

const GAITS: { value: Gait; label: string; icon: typeof Wind }[] = [
  { value: 'tiptoe', label: 'Tiptoe', icon: Wind },
  { value: 'walk', label: 'Walk', icon: Footprints },
  { value: 'run', label: 'Run', icon: Rabbit },
];

/**
 * Thumb controls for touch. The pad drives the same analogue stick the keyboard
 * feeds, and the gait is a three-way toggle rather than a held key — there is
 * no comfortable way to hold a modifier on a phone.
 */
export function GiantTouchControls({ controls }: { controls: GiantControls }) {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(dist, PAD_RADIUS);

      const nx = (dx / dist) * clamped;
      const ny = (dy / dist) * clamped;
      setKnob({ x: nx, y: ny });
      controls.setStick(nx / PAD_RADIUS, ny / PAD_RADIUS);
    },
    [controls],
  );

  const release = useCallback(() => {
    setKnob({ x: 0, y: 0 });
    controls.setStick(0, 0);
  }, [controls]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-b-xl border border-t-0 border-surface-border bg-surface-overlay px-4 py-4 md:hidden">
      <div
        ref={padRef}
        role="application"
        aria-label="Movement pad"
        className="relative h-32 w-32 shrink-0 touch-none rounded-full border border-slate-700 bg-slate-950/70"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0 && event.pointerType === 'mouse') return;
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span
          className="absolute left-1/2 top-1/2 rounded-full border border-amber-500/60 bg-amber-500/20"
          style={{
            transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
            width: KNOB_RADIUS * 2,
            height: KNOB_RADIUS * 2,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5" role="group" aria-label="Gait">
          {GAITS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={controls.gait === value}
              onClick={() => controls.setTouchGait(value)}
              className={`flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-semibold uppercase ${
                controls.gait === value
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={controls.pressInteract}
          className="flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 text-[11px] font-semibold uppercase text-slate-200 active:bg-slate-800"
        >
          <Hand className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Take
        </button>
      </div>
    </div>
  );
}
