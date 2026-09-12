import type { Friendship } from '@playdeck/game-types';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  FRIENDSHIPS_TABLE,
  STATUS_ACCEPTED,
  STATUS_DECLINED,
  STATUS_PENDING,
  USERS_TABLE,
} from '../friends.constants';

export class FriendsRequestsService {
  static async fetchPendingRequests(userId: string): Promise<{
    incoming: Friendship[];
    outgoing: Friendship[];
  }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { incoming: [], outgoing: [] };

    try {
      const { data, error } = await supabase
        .from(FRIENDSHIPS_TABLE)
        .select('*')
        .eq('status', STATUS_PENDING)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error || !data) return { incoming: [], outgoing: [] };

      const incoming = data.filter((d) => d.friend_id === userId);
      const outgoing = data.filter((d) => d.user_id === userId);

      const allIds = Array.from(
        new Set(data.map((d) => (d.user_id === userId ? d.friend_id : d.user_id))),
      );
      const { data: profiles } = await supabase
        .from(USERS_TABLE)
        .select('id, email, display_name, avatar')
        .in('id', allIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const mapFriendship = (f: (typeof data)[0]): Friendship => {
        const p = profileMap.get(f.user_id === userId ? f.friend_id : f.user_id);
        return {
          id: f.id,
          userId: f.user_id,
          friendId: f.friend_id,
          status: f.status,
          createdAt: f.created_at,
          updatedAt: f.updated_at,
          friend: p
            ? {
                id: p.id,
                email: p.email,
                displayName: p.display_name,
                avatar: p.avatar,
              }
            : undefined,
        };
      };

      return {
        incoming: incoming.map(mapFriendship),
        outgoing: outgoing.map(mapFriendship),
      };
    } catch {
      return { incoming: [], outgoing: [] };
    }
  }

  static async respondToFriendRequest(
    friendshipId: string,
    action: 'accepted' | 'declined',
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return true;

    try {
      const status = action === 'accepted' ? STATUS_ACCEPTED : STATUS_DECLINED;
      const { error } = await supabase
        .from(FRIENDSHIPS_TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', friendshipId);
      return !error;
    } catch {
      return false;
    }
  }
}
