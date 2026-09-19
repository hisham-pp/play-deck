import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const GRAVITY_GOLF_ID = 'gravity-golf';

export interface GravityGolfStats {
  holesCompleted: number;
  totalStars: number;
  bestStrokes: Record<number, number>;
  bestStars: Record<number, number>;
  roundsCompleted: number;
  holeInOnes: number;
  lastPlayedAt: string;
}

const DEFAULT_STATS: GravityGolfStats = {
  holesCompleted: 0,
  totalStars: 0,
  bestStrokes: {},
  bestStars: {},
  roundsCompleted: 0,
  holeInOnes: 0,
  lastPlayedAt: '',
};

export class GravityGolfStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(GRAVITY_GOLF_ID);

  async getStats(): Promise<GravityGolfStats> {
    const stats = await StorageService.get<GravityGolfStats>(this.storageKey);
    return stats ?? { ...DEFAULT_STATS };
  }

  async recordHoleCompletion(
    holeNumber: number,
    strokes: number,
    stars: number,
  ): Promise<GravityGolfStats> {
    const current = await this.getStats();

    const previousBestStrokes = current.bestStrokes[holeNumber];
    const previousBestStars = current.bestStars[holeNumber] ?? 0;

    const newBestStrokes =
      previousBestStrokes !== undefined ? Math.min(previousBestStrokes, strokes) : strokes;

    const newBestStars = Math.max(previousBestStars, stars);

    const updatedBestStrokes = { ...current.bestStrokes, [holeNumber]: newBestStrokes };
    const updatedBestStars = { ...current.bestStars, [holeNumber]: newBestStars };

    // Recalculate total stars
    const totalStars = Object.values(updatedBestStars).reduce((sum, s) => sum + s, 0);

    const isHoleInOne = strokes === 1;

    const updated: GravityGolfStats = {
      ...current,
      holesCompleted: Object.keys(updatedBestStrokes).length,
      totalStars,
      bestStrokes: updatedBestStrokes,
      bestStars: updatedBestStars,
      holeInOnes: current.holeInOnes + (isHoleInOne ? 1 : 0),
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }
}

export const gravityGolfStatsRepository = new GravityGolfStatsRepository();
