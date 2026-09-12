export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface FriendProfile {
  id: string;
  displayName: string;
  avatar: string;
  email?: string;
  isOnline?: boolean;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  friend?: FriendProfile;
}

export type GameInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface GameInvite {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  gameId: string;
  roomCode: string;
  status: GameInviteStatus;
  createdAt: string;
}
