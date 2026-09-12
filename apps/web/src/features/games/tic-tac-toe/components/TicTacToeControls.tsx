import { Globe, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MODE_LOCAL_2P, MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';
import { MultiplayerStatusBadge } from './MultiplayerStatusBadge';
import { SinglePlayerOptions } from './SinglePlayerOptions';

interface TicTacToeControlsProps {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayerMark: PlayerMark;
  roomCode?: string | null;
  myMark?: 'X' | 'O' | null;
  opponentName?: string | null;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onHumanMarkChange: (mark: PlayerMark) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onOpenMultiplayerLobby?: () => void;
  onLeaveRoom?: () => void;
}

const BTN_TYPE = 'button';
const ICON_CLASS = 'w-3.5 h-3.5';

export function TicTacToeControls({
  mode,
  aiDifficulty,
  humanPlayerMark,
  roomCode,
  myMark,
  opponentName,
  onModeChange,
  onDifficultyChange,
  onHumanMarkChange,
  onResetRound,
  onResetMatch,
  onOpenMultiplayerLobby,
  onLeaveRoom,
}: TicTacToeControlsProps) {
  return (
    <div className="w-full max-w-[min(100%,_420px)] mx-auto flex flex-col gap-3">
      {/* 1. Game Mode Selector */}
      <div className="p-1 rounded-xl bg-surface-raised border border-surface-border flex items-center gap-1">
        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_SINGLE)}
          className={cn(
            'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all',
            mode === MODE_SINGLE
              ? 'bg-amber-500 text-deck-950 shadow-sm font-bold'
              : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
          )}
        >
          <Sparkles className={ICON_CLASS} />
          <span>Vs AI</span>
        </button>

        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_LOCAL_2P)}
          className={cn(
            'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all',
            mode === MODE_LOCAL_2P
              ? 'bg-amber-500 text-deck-950 shadow-sm font-bold'
              : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
          )}
        >
          <Users className={ICON_CLASS} />
          <span>Local 2P</span>
        </button>

        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_MULTIPLAYER)}
          className={cn(
            'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all',
            mode === MODE_MULTIPLAYER
              ? 'bg-amber-500 text-deck-950 shadow-sm font-bold'
              : 'text-deck-400 hover:text-white hover:bg-surface-overlay',
          )}
        >
          <Globe className={ICON_CLASS} />
          <span>Online 2P</span>
        </button>
      </div>

      {/* 2. Options / Status based on mode */}
      {mode === MODE_SINGLE && (
        <SinglePlayerOptions
          aiDifficulty={aiDifficulty}
          humanPlayerMark={humanPlayerMark}
          onDifficultyChange={onDifficultyChange}
          onHumanMarkChange={onHumanMarkChange}
        />
      )}

      {mode === MODE_MULTIPLAYER && onOpenMultiplayerLobby && onLeaveRoom && (
        <MultiplayerStatusBadge
          roomCode={roomCode || null}
          myMark={myMark || null}
          opponentName={opponentName}
          onOpenLobby={onOpenMultiplayerLobby}
          onLeaveRoom={onLeaveRoom}
        />
      )}

      {/* 3. Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onResetRound}
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs text-deck-300 hover:text-white"
        >
          <RotateCcw className={ICON_CLASS} />
          <span>Restart Round (R)</span>
        </Button>

        <Button
          onClick={onResetMatch}
          variant="ghost"
          size="sm"
          className="text-xs text-deck-500 hover:text-deck-300"
        >
          <Trophy className={`${ICON_CLASS} mr-1`} />
          <span>Reset Match</span>
        </Button>
      </div>
    </div>
  );
}
