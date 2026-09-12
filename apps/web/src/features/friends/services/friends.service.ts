import type { FriendProfile, Friendship } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  FRIENDSHIPS_TABLE,
  STATUS_ACCEPTED,
  STATUS_PENDING,
  USERS_TABLE,
} from '../friends.constants';
import { FriendsRequestsService } from './friends-requests.service';

export class FriendsService {
  static async searchUsersByEmail(query: string, currentUserId: string): Promise<FriendProfile[]> {
    const clean = query.trim().toLowerCase();
    if (!clean || clean.length < 3) return [];

    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .select('id, email, display_name, avatar')
        .ilike('email', `%${clean}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (error || !data) return [];

      return data.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name || 'Player',
        avatar: u.avatar || '🕹️',
      }));
    } catch {
      return [];
    }
  }

  static async sendFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (userId === friendId) return { success: false, error: 'Cannot add yourself as a friend' };
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { data: existing } = await supabase
        .from(FRIENDSHIPS_TABLE)
        .select('id, status, user_id')
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`,
        )
        .maybeSingle();

      if (existing) {
        if (existing.status === STATUS_ACCEPTED) {
          return { success: false, error: 'Already friends' };
        }
        if (existing.status === STATUS_PENDING) {
          return { success: false, error: 'Friend request already pending' };
        }
      }

      const id = generateId('friend');
      const now = new Date().toISOString();
      const { error } = await supabase.from(FRIENDSHIPS_TABLE).insert({
        id,
        user_id: userId,
        friend_id: friendId,
        status: STATUS_PENDING,
        created_at: now,
        updated_at: now,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send request';
      return { success: false, error: msg };
    }
  }

  static async fetchFriends(userId: string): Promise<FriendProfile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from(FRIENDSHIPS_TABLE)
        .select('user_id, friend_id')
        .eq('status', STATUS_ACCEPTED)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error || !data || data.length === 0) return [];

      const friendIds = data.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));
      const { data: userProfiles } = await supabase
        .from(USERS_TABLE)
        .select('id, email, display_name, avatar')
        .in('id', friendIds);

      if (!userProfiles) return [];
      return userProfiles.map((p) => ({
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        avatar: p.avatar,
        isOnline: true,
      }));
    } catch {
      return [];
    }
  }

  static async fetchPendingRequests(userId: string): Promise<{
    incoming: Friendship[];
    outgoing: Friendship[];
  }> {
    return FriendsRequestsService.fetchPendingRequests(userId);
  }

  static async respondToFriendRequest(
    friendshipId: string,
    action: 'accepted' | 'declined',
  ): Promise<boolean> {
    return FriendsRequestsService.respondToFriendRequest(friendshipId, action);
  }

  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from(FRIENDSHIPS_TABLE)
        .delete()
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`,
        );
      return !error;
    } catch {
      return false;
    }
  }
}
