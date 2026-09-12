import { create } from 'zustand';
import type { FriendProfile, Friendship, GameInvite } from '@playdeck/game-types';
import { FriendsService } from '@/features/friends/services/friends.service';
import { GameInvitesService } from '@/features/friends/services/game-invites.service';

export interface FriendsState {
  friends: FriendProfile[];
  incomingRequests: Friendship[];
  outgoingRequests: Friendship[];
  pendingInvites: GameInvite[];
  searchResults: FriendProfile[];
  isModalOpen: boolean;
  isSearching: boolean;
  activeInviteModalRoom: { gameId: string; roomCode: string } | null;

  setModalOpen: (open: boolean) => void;
  setActiveInviteModalRoom: (room: { gameId: string; roomCode: string } | null) => void;
  loadFriendsData: (userId: string) => Promise<void>;
  searchEmail: (query: string, currentUserId: string) => Promise<void>;
  clearSearchResults: () => void;
  sendRequest: (
    currentUserId: string,
    targetId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  acceptRequest: (requestId: string, currentUserId: string) => Promise<void>;
  declineRequest: (requestId: string, currentUserId: string) => Promise<void>;
  removeFriend: (currentUserId: string, friendId: string) => Promise<void>;
  sendGameInvite: (
    sender: { id: string; name: string; avatar: string },
    receiverId: string,
    gameId: string,
    roomCode: string,
  ) => Promise<boolean>;
  dismissInvite: (inviteId: string) => void;
  receiveInvite: (invite: GameInvite) => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  pendingInvites: [],
  searchResults: [],
  isModalOpen: false,
  isSearching: false,
  activeInviteModalRoom: null,

  setModalOpen: (open) => set({ isModalOpen: open }),
  setActiveInviteModalRoom: (room) => set({ activeInviteModalRoom: room }),
  clearSearchResults: () => set({ searchResults: [], isSearching: false }),

  loadFriendsData: async (userId: string) => {
    if (!userId) return;
    try {
      const [friends, reqs, invites] = await Promise.all([
        FriendsService.fetchFriends(userId),
        FriendsService.fetchPendingRequests(userId),
        GameInvitesService.fetchIncomingInvites(userId),
      ]);
      set({
        friends,
        incomingRequests: reqs.incoming,
        outgoingRequests: reqs.outgoing,
        pendingInvites: invites,
      });
    } catch {
      // Graceful fallback
    }
  },

  searchEmail: async (query, currentUserId) => {
    if (!query.trim() || query.trim().length < 3) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    const results = await FriendsService.searchUsersByEmail(query, currentUserId);
    set({ searchResults: results, isSearching: false });
  },

  sendRequest: async (currentUserId, targetId) => {
    const res = await FriendsService.sendFriendRequest(currentUserId, targetId);
    if (res.success) {
      await get().loadFriendsData(currentUserId);
    }
    return res;
  },

  acceptRequest: async (requestId, currentUserId) => {
    await FriendsService.respondToFriendRequest(requestId, 'accepted');
    await get().loadFriendsData(currentUserId);
  },

  declineRequest: async (requestId, currentUserId) => {
    await FriendsService.respondToFriendRequest(requestId, 'declined');
    await get().loadFriendsData(currentUserId);
  },

  removeFriend: async (currentUserId, friendId) => {
    await FriendsService.removeFriend(currentUserId, friendId);
    await get().loadFriendsData(currentUserId);
  },

  sendGameInvite: async (sender, receiverId, gameId, roomCode) => {
    const inv = await GameInvitesService.sendGameInvite(sender, receiverId, gameId, roomCode);
    return Boolean(inv);
  },

  dismissInvite: (inviteId: string) => {
    set((state) => ({
      pendingInvites: state.pendingInvites.filter((i) => i.id !== inviteId),
    }));
  },

  receiveInvite: (invite: GameInvite) => {
    set((state) => ({
      pendingInvites: [invite, ...state.pendingInvites.filter((i) => i.id !== invite.id)],
    }));
  },
}));
