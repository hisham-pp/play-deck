import { Bot, Cpu, User } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { MODE_LOCAL_2P, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type {
  AIDifficulty,
  GameMode,
  MatchScores,
  PlayerMark,
  TicTacToeGameStatus,
} from '../types/tic-tac-toe.types';

interface TicTacToeScoreboardProps {
  scores: MatchScores;
  round: number;
  turn: PlayerMark;
  status: TicTacToeGameStatus;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayerMark: PlayerMark;
  isAiThinking: boolean;
}

export function TicTacToeScoreboard({
  scores,
  round,
  turn,
  status,
  mode,
  aiDifficulty,
  humanPlayerMark,
  isAiThinking,
}: TicTacToeScoreboardProps) {
  const isLocal2p = mode === MODE_LOCAL_2P;
  const isSingle = mode === MODE_SINGLE;

  const isXHuman = isLocal2p || humanPlayerMark === 'X';
  const isOHuman = isLocal2p || humanPlayerMark === 'O';

  const isXActive = status === 'playing' && turn === 'X';
  const isOActive = status === 'playing' && turn === 'O';

  const playerXLabel = isLocal2p ? 'Player X' : isXHuman ? 'You (X)' : 'AI (X)';
  const playerOLabel = isLocal2p ? 'Player O' : isOHuman ? 'You (O)' : 'AI (O)';

  return (
    <div className="w-full max-w-[min(100%,_420px)] mx-auto flex flex-col gap-2.5">
      {/* Top Header: Round badge + AI indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            size="sm"
            className="font-mono text-xs border-surface-border text-deck-400"
          >
            ROUND {round}
          </Badge>
          {isSingle && (
            <Badge variant="arcade" size="sm" className="capitalize text-[11px]">
              AI: {aiDifficulty}
            </Badge>
          )}
        </div>

        {isAiThinking && (
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 animate-pulse font-mono">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>AI Thinking...</span>
          </div>
        )}
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Player X Card */}
        <div
          className={cn(
            'p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200',
            'bg-surface-raised/90 border-surface-border',
            isXActive &&
              'border-amber-500/60 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          )}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {isXHuman ? (
              <User className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-xs font-bold text-deck-200">{playerXLabel}</span>
          </div>

          <span className="text-2xl sm:text-3xl font-black font-display text-amber-400">
            {scores.X}
          </span>

          {isXActive && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 mt-0.5">
              Turn
            </span>
          )}
        </div>

        {/* Ties Card */}
        <div className="p-3 rounded-xl border border-surface-border bg-surface-raised/70 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-deck-500 mb-0.5 uppercase tracking-wider">
            Ties
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-deck-400">
            {scores.ties}
          </span>
          <span className="text-[10px] text-deck-600 mt-0.5 font-mono">DRAWS</span>
        </div>

        {/* Player O Card */}
        <div
          className={cn(
            'p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200',
            'bg-surface-raised/90 border-surface-border',
            isOActive && 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
          )}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {isOHuman ? (
              <User className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-xs font-bold text-deck-200">{playerOLabel}</span>
          </div>

          <span className="text-2xl sm:text-3xl font-black font-display text-cyan-400">
            {scores.O}
          </span>

          {isOActive && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-500 mt-0.5">
              Turn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
