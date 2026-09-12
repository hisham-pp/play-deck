import type { Player } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEFAULT_AVATAR, DEFAULT_PLAYER_NAME, USERS_TABLE } from '../auth.constants';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { PlayerTableService } from './player-table.service';

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
      const now = new Date().toISOString();
      const hashedPassword = await hashPassword(pass);

      const { data: existing } = await supabase
        .from(USERS_TABLE)
        .select('id, password')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        if (!existing.password) {
          await supabase
            .from(USERS_TABLE)
            .update({
              password: hashedPassword,
              display_name: cleanName,
              last_sign_in_at: now,
              updated_at: now,
            })
            .eq('id', existing.id);

          return {
            success: true,
            player: {
              id: existing.id,
              displayName: cleanName,
              avatar: DEFAULT_AVATAR,
              email: cleanEmail,
              isGuest: false,
              createdAt: now,
            },
          };
        }
        return { success: false, error: 'An account with this email already exists' };
      }

      const playerId = generateId('player');
      const { error } = await supabase.from(USERS_TABLE).insert({
        id: playerId,
        email: cleanEmail,
        password: hashedPassword,
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

      return {
        success: true,
        player: {
          id: playerId,
          displayName: cleanName,
          avatar: DEFAULT_AVATAR,
          email: cleanEmail,
          isGuest: false,
          createdAt: now,
        },
      };
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
        .from(USERS_TABLE)
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error || !data) {
        return { success: false, error: 'No account found with this email' };
      }

      const isValid = await verifyPassword(pass, data.password);
      if (!isValid) {
        return { success: false, error: 'Incorrect password' };
      }

      const now = new Date().toISOString();
      await supabase.from(USERS_TABLE).update({ last_sign_in_at: now }).eq('id', data.id);

      return {
        success: true,
        player: {
          id: data.id,
          displayName: data.display_name || DEFAULT_PLAYER_NAME,
          avatar: data.avatar || DEFAULT_AVATAR,
          email: data.email,
          isGuest: false,
          createdAt: data.created_at || now,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      return { success: false, error: message };
    }
  }

  static async signOut(): Promise<{ success: boolean }> {
    return { success: true };
  }
}
