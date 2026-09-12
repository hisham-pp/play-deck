import type {
  BoardCell,
  PlayerMark,
  TicTacToeState,
  WinningLine,
} from '../types/tic-tac-toe.types';
import { MARK_O, MARK_X, WINNING_COMBINATIONS } from './tic-tac-toe-constants';

export interface WinResult {
  winner: PlayerMark;
  line: WinningLine;
}

export function checkWin(board: BoardCell[]): WinResult | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return {
        winner: mark,
        line: combo,
      };
    }
  }
  return null;
}

export function isBoardFull(board: BoardCell[]): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: BoardCell[]): number[] {
  const available: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      available.push(i);
    }
  }
  return available;
}

export function getOpponentMark(mark: PlayerMark): PlayerMark {
  return mark === MARK_X ? MARK_O : MARK_X;
}

export function indexToGridPos(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 3) + 1,
    col: (index % 3) + 1,
  };
}

export function formatStatusAnnouncement(state: TicTacToeState): string {
  if (state.status === 'won') return `Game Over. Player ${state.winner} won round ${state.round}.`;
  if (state.status === 'draw') return `Game Over. Round ${state.round} ended in a draw.`;
  if (state.isAiThinking) return 'AI is thinking...';
  return `Player ${state.turn}'s turn.`;
}
