import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

import type { SaboteurCareerStats } from '../types/secret-saboteur.types';

export const SECRET_SABOTEUR_ID = 'secret-saboteur';

export const DEFAULT_SABOTEUR_STATS: SaboteurCareerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  workerWins: 0,
  saboteurWins: 0,
  saboteursExposed: 0,
  reactorCompletions: 0,
  inspectionsConducted: 0,
  lastPlayedAt: '',
};

export class SaboteurStatsRepository {
  private readonly storageKey = STORAGE_KEYS.gameStats(SECRET_SABOTEUR_ID);

  async getStats(): Promise<SaboteurCareerStats> {
    const stats = await StorageService.get<SaboteurCareerStats>(this.storageKey);
    return stats ?? { ...DEFAULT_SABOTEUR_STATS };
  }

  async recordMatchCompletion({
    won,
    wasWorker,
    wasSaboteur,
    saboteurExposed,
    reactorCompleted,
    inspectionsConducted,
  }: {
    won: boolean;
    wasWorker: boolean;
    wasSaboteur: boolean;
    saboteurExposed: boolean;
    reactorCompleted: boolean;
    inspectionsConducted: number;
  }): Promise<SaboteurCareerStats> {
    const current = await this.getStats();

    const updated: SaboteurCareerStats = {
      ...current,
      matchesPlayed: current.matchesPlayed + 1,
      matchesWon: current.matchesWon + (won ? 1 : 0),
      workerWins: current.workerWins + (wasWorker && won ? 1 : 0),
      saboteurWins: current.saboteurWins + (wasSaboteur && won ? 1 : 0),
      saboteursExposed: current.saboteursExposed + (saboteurExposed ? 1 : 0),
      reactorCompletions: current.reactorCompletions + (reactorCompleted ? 1 : 0),
      inspectionsConducted: current.inspectionsConducted + inspectionsConducted,
      lastPlayedAt: new Date().toISOString(),
    };

    await StorageService.set(this.storageKey, updated);
    return updated;
  }

  async resetStats(): Promise<void> {
    await StorageService.remove(this.storageKey);
  }
}

export const saboteurStatsRepository = new SaboteurStatsRepository();
