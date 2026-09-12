'use client';

import { useEffect, useMemo } from 'react';
import { useFriendsStore } from '@/stores/friends.store';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

export function useTicTacToeSocial() {
  const { player } = usePlayerStore();
  const { opponent, sendFriendNotice, onFriendNotice } = useMultiplayerStore();
  const { friends, outgoingRequests, sendRequest, loadFriendsData } = useFriendsStore();

  useEffect(() => {
    const unsub = onFriendNotice((_data) => {
      if (player) loadFriendsData(player.id);
    });
    return () => unsub();
  }, [player, onFriendNotice, loadFriendsData]);

  const friendStatus = useMemo((): 'none' | 'pending' | 'friends' => {
    if (!opponent?.playerId) return 'none';
    if (friends.some((f) => f.id === opponent.playerId)) return 'friends';
    if (outgoingRequests.some((r) => r.friendId === opponent.playerId)) return 'pending';
    return 'none';
  }, [opponent, friends, outgoingRequests]);

  const handleAddFriend = async (opponentId: string) => {
    if (!player || player.isGuest) return;
    const res = await sendRequest(player.id, opponentId);
    if (res.success) {
      sendFriendNotice(player.id, player.displayName);
    }
  };

  return {
    opponentId: opponent?.playerId,
    friendStatus,
    handleAddFriend,
  };
}
