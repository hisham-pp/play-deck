import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import type { ChessResult, ChessStats, PieceColor } from '../types/chess.types';

export interface RecordChessGameParams {
  /** The winning colour, or null when the game was drawn. */
  winner: PieceColor | null;
  reason: ChessResult['reason'];
  plies: number;
}

export interface IChessStatsRepository {
  getStats(): Promise<ChessStats>;
  recordGameResult(params: RecordChessGameParams): Promise<ChessStats>;
}

const DEFAULT_STATS: ChessStats = {
  gamesPlayed: 0,
  whiteWins: 0,
  blackWins: 0,
  draws: 0,
  checkmates: 0,
  resignations: 0,
  longestGamePlies: 0,
  lastPlayedAt: '',
};

/**
 * Chess statistics on the device. Everything goes through StorageService, so
 * moving these to a server later is a change of repository and nothing else.
 */
export class LocalChessStatsRepository implements IChessStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats('chess');

  async getStats(): Promise<ChessStats> {
    const stats = await StorageService.get<ChessStats>(this.storageKey);
    return stats ? { ...DEFAULT_STATS, ...stats } : { ...DEFAULT_STATS };
  }

  async recordGameResult({ winner, reason, plies }: RecordChessGameParams): Promise<ChessStats> {
    const current = await this.getStats();

    const updated: ChessStats = {
      gamesPlayed: current.gamesPlayed + 1,
      whiteWins: current.whiteWins + (winner === 'w' ? 1 : 0),
      blackWins: current.blackWins + (winner === 'b' ? 1 : 0),
      draws: current.draws + (winner === null ? 1 : 0),
      checkmates: current.checkmates + (reason === 'checkmate' ? 1 : 0),
      resignations: current.resignations + (reason === 'resignation' ? 1 : 0),
      longestGamePlies: Math.max(current.longestGamePlies, plies),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const chessStatsRepository = new LocalChessStatsRepository();
