'use client';

import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Game2048 } from '@/features/games/2048';
import { BallBounceGame } from '@/features/games/ball-bounce';
import { ChessGame } from '@/features/games/chess';
import { ConnectFourGame } from '@/features/games/connect-four';
import { FlappyArcadeGame } from '@/features/games/flappy-arcade';
import { LudoGame } from '@/features/games/ludo';
import { MinesweeperGame } from '@/features/games/minesweeper';
import { MiniGolfGame } from '@/features/games/mini-golf';
import { PenFightGame } from '@/features/games/pen-fight';
import { PongGame } from '@/features/games/pong';
import { PushYourLuckGame } from '@/features/games/push-your-luck';
import { RunicMemoryGame } from '@/features/games/runic-memory';
import { SnakeGame } from '@/features/games/snake';
import { SnakeLadderGame } from '@/features/games/snake-and-ladder';
import { SudokuGame } from '@/features/games/sudoku';
import { SummitRushGame } from '@/features/games/summit-rush';
import { TetrisGame } from '@/features/games/tetris';
import { TicTacToeGame } from '@/features/games/tic-tac-toe';
import { WordChainGame } from '@/features/games/word-chain';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { GameStatusBadge, GameCategoryBadge, GameFeatureBadge } from './GameBadge';
import { GameStage } from './GameStage';

/**
 * Every shipped game renders its own component. The catalog is a lookup rather
 * than a chain of branches so adding a game is one line, not one more `if`.
 */
const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  '2048': Game2048,
  'ball-bounce': BallBounceGame,
  chess: ChessGame,
  'connect-four': ConnectFourGame,
  'flappy-arcade': FlappyArcadeGame,
  ludo: LudoGame,
  minesweeper: MinesweeperGame,
  'mini-golf': MiniGolfGame,
  'pen-fight': PenFightGame,
  pong: PongGame,
  'push-your-luck': PushYourLuckGame,
  'runic-memory': RunicMemoryGame,
  snake: SnakeGame,
  'snake-and-ladder': SnakeLadderGame,
  sudoku: SudokuGame,
  'summit-rush': SummitRushGame,
  tetris: TetrisGame,
  'tic-tac-toe': TicTacToeGame,
  'word-chain': WordChainGame,
};

export function GameAreaShell({ game }: { game: GameDefinition }) {
  const { player } = usePlayerStore();
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'over'>('idle');
  const [mockScore, setMockScore] = useState(0);

  const GameComponent = GAME_COMPONENTS[game.id];
  if (GameComponent) {
    return <GameComponent />;
  }

  const handleStart = () => {
    if (!player) return;
    const session = startSession(game, player);
    addRecentSession(session);
    setStatus('running');
    setMockScore(0);
  };

  const handleScore = (delta: number) => {
    setMockScore((s) => Math.max(0, s + delta));
  };

  const handleEnd = (won: boolean) => {
    if (!player) return;
    const result = endSession(won ? player.id : undefined, !won);
    if (result && currentSession) {
      addRecentSession(currentSession);
    }
    setStatus('over');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <GameStatusBadge status={game.status} label={game.badge} />
          <GameCategoryBadge category={game.category} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-deck-950 dark:text-white font-display">
          {game.name}
        </h1>
        <p className="text-sm text-deck-600 dark:text-deck-400 max-w-md">{game.description}</p>
      </div>

      <div className="relative rounded-xl border border-surface-border bg-surface-raised overflow-hidden shadow-arcade">
        <div className="h-10 px-4 border-b border-surface-border bg-surface-overlay flex items-center justify-between text-xs text-deck-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-deck-800 dark:text-deck-200">V1 Shell Session</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {game.players.min === game.players.max
                  ? `${game.players.min} Player`
                  : `${game.players.min} - ${game.players.max} Players`}
              </span>
            </div>
            {status === 'running' && (
              <span className="font-mono text-amber-500 font-bold">SCORE: {mockScore}</span>
            )}
          </div>
        </div>

        <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-surface-base/50 arcade-texture">
          <GameStage
            game={game}
            status={status}
            currentSession={currentSession}
            onStart={handleStart}
            onScoreChange={handleScore}
            onEnd={handleEnd}
          />
        </div>

        <div className="p-4 border-t border-surface-border bg-surface-overlay/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-deck-500">
            <span>
              Players: {game.players.min} - {game.players.max}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GameFeatureBadge feature="multiplayer" label="Coming Soon" size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
