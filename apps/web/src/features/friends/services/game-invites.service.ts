import type { GameInvite, GameInviteStatus } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  GAME_INVITES_TABLE,
  NOTIFICATION_EVENT,
  STATUS_ACCEPTED,
  STATUS_DECLINED,
  STATUS_PENDING,
} from '../friends.constants';

export class GameInvitesService {
  static async sendGameInvite(
    sender: { id: string; name: string; avatar: string },
    receiverId: string,
    gameId: string,
    roomCode: string,
  ): Promise<GameInvite | null> {
    const inviteId = generateId('invite');
    const now = new Date().toISOString();

    const invite: GameInvite = {
      id: inviteId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      receiverId,
      gameId,
      roomCode,
      status: STATUS_PENDING as GameInviteStatus,
      createdAt: now,
    };

    const supabase = getSupabaseClient();
    if (!supabase) return invite;

    try {
      await supabase.from(GAME_INVITES_TABLE).insert({
        id: inviteId,
        sender_id: sender.id,
        receiver_id: receiverId,
        game_id: gameId,
        room_code: roomCode,
        status: STATUS_PENDING,
        created_at: now,
        updated_at: now,
      });

      const userChannel = supabase.channel(`user:notifications:${receiverId}`);
      userChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          userChannel.send({
            type: 'broadcast',
            event: NOTIFICATION_EVENT,
            payload: { type: 'game_invite', invite },
          });
        }
      });

      return invite;
    } catch {
      return invite;
    }
  }

  static async fetchIncomingInvites(userId: string): Promise<GameInvite[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from(GAME_INVITES_TABLE)
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', STATUS_PENDING);

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        senderId: d.sender_id,
        senderName: 'Friend',
        senderAvatar: '🕹️',
        receiverId: d.receiver_id,
        gameId: d.game_id,
        roomCode: d.room_code,
        status: d.status as GameInviteStatus,
        createdAt: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  static async respondToInvite(
    inviteId: string,
    action: 'accepted' | 'declined',
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return true;

    try {
      const status = action === 'accepted' ? STATUS_ACCEPTED : STATUS_DECLINED;
      const { error } = await supabase
        .from(GAME_INVITES_TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      return !error;
    } catch {
      return false;
    }
  }
}
