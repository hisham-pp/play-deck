'use client';

import { Badge } from '@playdeck/ui';
import type { LudoColor, LudoGameState, LudoPlayer } from '../types/ludo.types';

interface LudoPlayerPanelProps {
  state: LudoGameState;
  configuredPlayers: LudoPlayer[];
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

export function LudoPlayerPanel({ state, configuredPlayers, botThinking }: LudoPlayerPanelProps) {
  return (
    <div className="flex w-fit flex-col gap-1.5">
      {state.players.map((p) => {
        const isCurrent = state.currentTurnSeatIndex === p.seatIndex;
        const piecesHome = p.pieces.filter((pc) => pc.location === 'home').length;
        const configuredPlayer = configuredPlayers.find((cp) => cp.seatIndex === p.seatIndex);
        const displayName = configuredPlayer?.displayName || 'Player';

        return (
          <div
            key={p.playerId}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 backdrop-blur-md transition-all ${
              isCurrent
                ? 'bg-slate-900/90 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-slate-900/80 border-slate-700/70'
            }`}
          >
            <span className="text-xs">{COLOR_ICONS[p.color]}</span>
            <span className="max-w-[120px] truncate text-xs font-bold text-slate-200">
              {displayName}
            </span>
            <span className="text-xs font-semibold tabular-nums text-amber-400">
              {piecesHome}/4
            </span>
            {isCurrent && botThinking && (
              <Badge
                variant="outline"
                className="animate-pulse border-amber-500/40 bg-amber-500/20 px-1.5 py-0 text-[10px] font-bold text-amber-300"
              >
                Thinking
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
