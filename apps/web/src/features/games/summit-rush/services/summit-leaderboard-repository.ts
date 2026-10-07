import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePlayerStore } from '@/stores/player.store';

export const SUMMIT_LEADERBOARD_KEY = 'summit-rush-leaderboard';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  distance: number;
  mapId: string;
  vehicleId: string;
  date: string;
}

export interface ISummitLeaderboardRepository {
  getEntries(mapId?: string): Promise<LeaderboardEntry[]>;
  addEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): Promise<void>;
}

export class HybridSummitLeaderboardRepository implements ISummitLeaderboardRepository {
  private readonly storageKey = STORAGE_KEYS.gameSave('summit-rush', 'leaderboard');

  async getEntries(mapId?: string): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('summit_rush_leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(100);
          
        if (mapId) query = query.eq('map_id', mapId);
        
        const { data, error } = await query;
        if (!error && data) {
          return data.map(d => ({
            id: d.id,
            playerName: d.player_name,
            score: d.score,
            distance: d.distance,
            mapId: d.map_id,
            vehicleId: d.vehicle_id,
            date: d.created_at,
          }));
        }
      } catch (e) {
        console.error('Failed to get leaderboard from Supabase', e);
      }
    }
  
    const entries = await StorageService.get<LeaderboardEntry[]>(this.storageKey);
    const all = Array.isArray(entries) ? entries : [];
    const filtered = mapId ? all.filter((e) => e.mapId === mapId) : all;
    return filtered.sort((a, b) => b.score - a.score);
  }

  async addEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): Promise<void> {
    const supabase = getSupabaseClient();
    const player = usePlayerStore.getState().player;
    
    if (supabase && player && !player.isGuest) {
      try {
        await supabase
          .from('summit_rush_leaderboard')
          .insert({
            user_id: player.id,
            player_name: player.displayName || entry.playerName,
            score: entry.score,
            distance: entry.distance,
            map_id: entry.mapId,
            vehicle_id: entry.vehicleId,
          });
      } catch (e) {
        console.error('Failed to add leaderboard entry to Supabase', e);
      }
    }
  
    const entries = await StorageService.get<LeaderboardEntry[]>(this.storageKey);
    const all = Array.isArray(entries) ? entries : [];
    
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    all.push(newEntry);
    
    // Sort and keep top 100 to prevent local storage bloat
    const sorted = all.sort((a, b) => b.score - a.score).slice(0, 100);
    
    await StorageService.set(this.storageKey, sorted);
  }
}

export const summitLeaderboardRepository = new HybridSummitLeaderboardRepository();
