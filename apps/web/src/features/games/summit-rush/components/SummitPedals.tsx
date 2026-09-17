'use client';

import React, { useCallback, useState, type PointerEvent } from 'react';
import type { Pedal } from '../hooks/use-summit-input';

interface SummitPedalsProps {
  onPedal: (pedal: Pedal, pressed: boolean) => void;
}

const LABEL: Record<Pedal, string> = { gas: 'GAS', brake: 'BRAKE' };

function PedalButton({ pedal, onPedal }: { pedal: Pedal; onPedal: SummitPedalsProps['onPedal'] }) {
  const [pressed, setPressed] = useState(false);

  const press = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setPressed(true);
      onPedal(pedal, true);
    },
    [onPedal, pedal],
  );

  const release = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setPressed(false);
      onPedal(pedal, false);
    },
    [onPedal, pedal],
  );

  const isGas = pedal === 'gas';
  return (
    <button
      type="button"
      aria-label={isGas ? 'Accelerate' : 'Brake / reverse'}
      aria-pressed={pressed}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        'pointer-events-auto relative flex h-24 w-20 select-none flex-col items-center justify-end rounded-2xl pb-3',
        'touch-none font-black tracking-wider shadow-lg ring-2 transition-transform duration-75 sm:h-20 sm:w-16',
        isGas
          ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950 ring-emerald-200/60'
          : 'bg-gradient-to-b from-rose-400 to-rose-600 text-rose-950 ring-rose-200/60',
        pressed ? 'translate-y-1 scale-95 brightness-110' : '',
      ].join(' ')}
    >
      {/* Tread lines give the pedal its look. */}
      <span className="absolute inset-x-3 top-3 flex flex-col gap-1.5 opacity-40">
        <span className="h-1 rounded bg-black/60" />
        <span className="h-1 rounded bg-black/60" />
        <span className="h-1 rounded bg-black/60" />
      </span>
      <span className="text-xs sm:text-[10px]">{LABEL[pedal]}</span>
    </button>
  );
}

/** Large on-screen pedals — work with touch and mouse alike. */
export function SummitPedals({ onPedal }: SummitPedalsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-3 sm:p-4">
      <PedalButton pedal="brake" onPedal={onPedal} />
      <PedalButton pedal="gas" onPedal={onPedal} />
    </div>
  );
}
