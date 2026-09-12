import { ArrowRight, RotateCcw, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import type { GameMode, PlayerMark, TicTacToeGameStatus } from '../types/tic-tac-toe.types';

interface TicTacToeOverlayProps {
  status: TicTacToeGameStatus;
  winner: PlayerMark | null;
  mode: GameMode;
  humanPlayerMark: PlayerMark;
  myMark?: PlayerMark | null;
  playerXName?: string;
  playerOName?: string;
  onNextRound: () => void;
  onResetMatch: () => void;
}

interface OverlayContent {
  title: string;
  subtitle: string;
  badgeColor: string;
}

function getOverlayContent(
  status: TicTacToeGameStatus,
  winner: PlayerMark | null,
  mode: GameMode,
  humanPlayerMark: PlayerMark,
  myMark?: PlayerMark | null,
  playerXName?: string,
  playerOName?: string,
): OverlayContent {
  if (status === 'draw') {
    return {
      title: 'Stalemate Draw',
      subtitle: 'All cells occupied with no decisive 3-in-a-row.',
      badgeColor: 'text-deck-300',
    };
  }

  if (mode === 'single') {
    if (winner === humanPlayerMark) {
      return {
        title: 'Tactical Victory!',
        subtitle: `You completed a 3-in-a-row line as ${winner}.`,
        badgeColor: 'text-amber-400',
      };
    }
    return {
      title: 'AI Outmaneuvered You',
      subtitle: `AI claimed the line as ${winner}. Try again!`,
      badgeColor: 'text-rose-400',
    };
  }

  if (mode === 'multiplayer') {
    const isMe = Boolean(myMark && winner === myMark);
    const victorName = winner === 'X' ? playerXName : playerOName;
    const opponent = winner === 'X' ? playerOName : playerXName;

    if (isMe) {
      return {
        title: 'Victory!',
        subtitle: `You defeated ${opponent || 'your opponent'} with 3-in-a-row!`,
        badgeColor: 'text-emerald-400',
      };
    }
    return {
      title: `${victorName || 'Opponent'} Won!`,
      subtitle: `${victorName || 'Opponent'} completed a 3-in-a-row line.`,
      badgeColor: 'text-cyan-400',
    };
  }

  const victor = winner === 'X' ? playerXName || 'Player X' : playerOName || 'Player O';
  return {
    title: `${victor} Victorious!`,
    subtitle: `${victor} achieved 3-in-a-row.`,
    badgeColor: winner === 'X' ? 'text-amber-400' : 'text-cyan-400',
  };
}

export function TicTacToeOverlay({
  status,
  winner,
  mode,
  humanPlayerMark,
  myMark,
  playerXName,
  playerOName,
  onNextRound,
  onResetMatch,
}: TicTacToeOverlayProps) {
  if (status !== 'won' && status !== 'draw') {
    return null;
  }

  const isDraw = status === 'draw';
  const { title, subtitle, badgeColor } = getOverlayContent(
    status,
    winner,
    mode,
    humanPlayerMark,
    myMark,
    playerXName,
    playerOName,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Round Result"
      className="absolute inset-0 bg-surface-base/85 backdrop-blur-sm rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center mb-3 shadow-lg">
        {isDraw ? (
          <Zap className="w-7 h-7 text-deck-400" />
        ) : (
          <Trophy className={`w-7 h-7 ${badgeColor}`} />
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-deck-400 max-w-xs mb-6 leading-relaxed">{subtitle}</p>

      <div className="flex items-center gap-3 w-full max-w-xs">
        <Button
          onClick={onNextRound}
          variant="primary"
          size="md"
          className="flex-1 gap-1.5 font-bold"
        >
          <span>Next Round</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          onClick={onResetMatch}
          variant="secondary"
          size="md"
          className="gap-1.5 text-deck-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
}
