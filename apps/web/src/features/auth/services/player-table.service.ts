import type { Player } from '@playdeck/game-types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { DEFAULT_AVATAR, DEFAULT_PLAYER_NAME, PLAYERS_TABLE } from '../auth.constants';

export class PlayerTableService {
  static async savePlayerToTable(player: Player): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from(PLAYERS_TABLE).upsert(
        {
          id: player.id,
          email: player.email || null,
          display_name: player.displayName,
          avatar: player.avatar || DEFAULT_AVATAR,
          is_guest: player.isGuest,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      return !error;
    } catch {
      return false;
    }
  }

  static async fetchPlayerFromTable(id: string): Promise<Player | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from(PLAYERS_TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        displayName: data.display_name || DEFAULT_PLAYER_NAME,
        avatar: data.avatar || DEFAULT_AVATAR,
        isGuest: Boolean(data.is_guest),
        email: data.email || undefined,
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}
