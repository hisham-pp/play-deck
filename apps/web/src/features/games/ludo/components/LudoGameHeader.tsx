'use client';

import type { LudoColor, LudoGameState, LudoPlayer } from '../types/ludo.types';

interface LudoGameHeaderProps {
  state: LudoGameState;
  configuredPlayers?: LudoPlayer[];
  localSeatIndex?: number;
}

const COLOR_SYMBOLS: Record<LudoColor, { symbol: string; icon: string; name: string }> = {
  red: { symbol: '▲', icon: '🔴', name: 'Red' },
  green: { symbol: '◆', icon: '🟢', name: 'Green' },
  yellow: { symbol: '★', icon: '🟡', name: 'Yellow' },
  blue: { symbol: '■', icon: '🔵', name: 'Blue' },
  cyan: { symbol: '✦', icon: '🩵', name: 'Cyan' },
  purple: { symbol: '♠', icon: '🟣', name: 'Purple' },
};

export function LudoGameHeader({ state, configuredPlayers, localSeatIndex }: LudoGameHeaderProps) {
  const currentSeat = state.players[state.currentTurnSeatIndex];
  const colorInfo = currentSeat ? COLOR_SYMBOLS[currentSeat.color] : null;
  const pConfig = configuredPlayers?.find((p) => p.seatIndex === state.currentTurnSeatIndex);
  const displayName = pConfig?.displayName ?? (currentSeat ? `Seat ${currentSeat.seatIndex + 1}` : '');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
          🎲 Ludo
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
          {state.players.length} Players ({state.layout})
        </span>
      </div>

      <div className="flex items-center gap-3">
        {currentSeat && colorInfo && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-sm">{colorInfo.icon}</span>
            <span className="text-sm font-bold text-slate-200">
              {displayName} ({colorInfo.symbol})
            </span>
            {localSeatIndex === currentSeat.seatIndex && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                Your Turn
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
