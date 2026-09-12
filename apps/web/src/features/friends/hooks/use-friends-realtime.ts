'use client';

import { useEffect } from 'react';
import type { GameInvite } from '@playdeck/game-types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';
import { NOTIFICATION_EVENT } from '../friends.constants';

export function useFriendsRealtime() {
  const { player } = usePlayerStore();
  const { loadFriendsData, receiveInvite } = useFriendsStore();

  useEffect(() => {
    if (!player || player.isGuest) return;
    loadFriendsData(player.id);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channelName = `user:notifications:${player.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: NOTIFICATION_EVENT }, ({ payload }) => {
        if (!payload) return;
        if (payload.type === 'game_invite') {
          receiveInvite(payload.invite as GameInvite);
        } else if (payload.type === 'friend_update') {
          loadFriendsData(player.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [player, loadFriendsData, receiveInvite]);
}
