import type { Player } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEFAULT_AVATAR, DEFAULT_PLAYER_NAME, PLAYERS_TABLE } from '../auth.constants';

export interface AuthResult {
  success: boolean;
  player?: Player;
  error?: string;
}

export class SupabaseAuthService {
  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

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

  static async signUp(email: string, pass: string, displayName?: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = displayName?.trim() || cleanEmail.split('@')[0] || DEFAULT_PLAYER_NAME;

      // Check if user already exists in the table
      const { data: existing } = await supabase
        .from(PLAYERS_TABLE)
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const playerId = generateId('player');
      const now = new Date().toISOString();

      const { error } = await supabase.from(PLAYERS_TABLE).insert({
        id: playerId,
        email: cleanEmail,
        password: pass,
        display_name: cleanName,
        avatar: DEFAULT_AVATAR,
        is_guest: false,
        last_sign_in_at: now,
        created_at: now,
        updated_at: now,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const player: Player = {
        id: playerId,
        displayName: cleanName,
        avatar: DEFAULT_AVATAR,
        email: cleanEmail,
        isGuest: false,
        createdAt: now,
      };

      return { success: true, player };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      return { success: false, error: message };
    }
  }

  static async signIn(email: string, pass: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from(PLAYERS_TABLE)
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error || !data) {
        return { success: false, error: 'No account found with this email' };
      }

      if (data.password !== pass) {
        return { success: false, error: 'Incorrect password' };
      }

      // Update last sign in timestamp
      await supabase
        .from(PLAYERS_TABLE)
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq('id', data.id);

      const player: Player = {
        id: data.id,
        displayName: data.display_name || DEFAULT_PLAYER_NAME,
        avatar: data.avatar || DEFAULT_AVATAR,
        email: data.email,
        isGuest: false,
        createdAt: data.created_at || new Date().toISOString(),
      };

      return { success: true, player };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      return { success: false, error: message };
    }
  }

  static async signOut(): Promise<{ success: boolean }> {
    return { success: true };
  }
}
