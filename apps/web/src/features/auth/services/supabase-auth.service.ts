import type { Player } from '@playdeck/game-types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEFAULT_AVATAR, DEFAULT_PLAYER_NAME } from '../auth.constants';
import { PlayerTableService } from './player-table.service';

export interface AuthResult {
  success: boolean;
  player?: Player;
  error?: string;
  requiresVerification?: boolean;
}

export class SupabaseAuthService {
  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  static async savePlayerToTable(player: Player): Promise<boolean> {
    return PlayerTableService.savePlayerToTable(player);
  }

  static async fetchPlayerFromTable(id: string): Promise<Player | null> {
    return PlayerTableService.fetchPlayerFromTable(id);
  }

  static async signUp(email: string, pass: string, displayName?: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = displayName?.trim() || cleanEmail.split('@')[0] || DEFAULT_PLAYER_NAME;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { display_name: cleanName } },
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Failed to create user' };

      const player: Player = {
        id: data.user.id,
        displayName: cleanName,
        avatar: DEFAULT_AVATAR,
        email: data.user.email || cleanEmail,
        isGuest: false,
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      await this.savePlayerToTable(player);
      return { success: true, player, requiresVerification: !data.session };
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'User not found' };

      let player = await this.fetchPlayerFromTable(data.user.id);
      if (!player) {
        const metadataName = data.user.user_metadata?.display_name;
        player = {
          id: data.user.id,
          displayName: metadataName || data.user.email?.split('@')[0] || DEFAULT_PLAYER_NAME,
          avatar: DEFAULT_AVATAR,
          email: data.user.email,
          isGuest: false,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        await this.savePlayerToTable(player);
      }

      return { success: true, player };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      return { success: false, error: message };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      return { success: false, error: message };
    }
  }

  static async getCurrentPlayer(): Promise<Player | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;
      if (!sessionUser) return null;

      const playerFromTable = await this.fetchPlayerFromTable(sessionUser.id);
      if (playerFromTable) return playerFromTable;

      return {
        id: sessionUser.id,
        displayName:
          sessionUser.user_metadata?.display_name ||
          sessionUser.email?.split('@')[0] ||
          DEFAULT_PLAYER_NAME,
        avatar: DEFAULT_AVATAR,
        email: sessionUser.email,
        isGuest: false,
        createdAt: sessionUser.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}
