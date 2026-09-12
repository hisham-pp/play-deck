'use client';

import { Badge } from '@playdeck/ui';
import type { LudoColor, LudoGameState } from '../types/ludo.types';
import { ludoColorTheme } from '../utils/ludo-colors';

interface LudoPlayerPanelProps {
  state: LudoGameState;
  botThinking?: boolean;
}

const COLOR_ICONS: Record<LudoColor, string> = {
  red: '🔴',
  green: '🟢',
  yellow: '🟡',
  blue: '🔵',
  cyan: '🩵',
  purple: '🟣',
};

export function LudoPlayerPanel({ state, botThinking }: LudoPlayerPanelProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {state.players.map((p) => {
        const isCurrent = state.currentTurnSeatIndex === p.seatIndex;
        const piecesHome = p.pieces.filter((pc) => pc.location === 'home').length;
        const theme = ludoColorTheme(p.color);

        return (
          <div
            key={p.playerId}
            className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              isCurrent
                ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{COLOR_ICONS[p.color]}</span>
                <span className="text-xs font-black tracking-wide text-slate-200 uppercase truncate">
                  {p.color} ({theme.symbol})
                </span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                S{p.seatIndex + 1}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="font-semibold text-slate-300">
                Home: <span className="text-amber-400 font-bold">{piecesHome}</span>/4
              </span>
              {isCurrent && botThinking && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0.5 px-1.5 animate-pulse bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                >
                  Thinking...
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
