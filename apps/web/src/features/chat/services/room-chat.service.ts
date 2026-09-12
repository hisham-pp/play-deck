import type { ChatMessage } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CHAT_EVENT, ROOM_MESSAGES_TABLE } from '../chat.constants';

export class RoomChatService {
  static createMessage(
    roomCode: string,
    sender: { id: string; name: string; avatar: string },
    text: string,
  ): ChatMessage {
    return {
      id: generateId('msg'),
      roomCode: roomCode.trim(),
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };
  }

  static async broadcastMessage(
    message: ChatMessage,
    gameNamespace: string = 'tictactoe',
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from(ROOM_MESSAGES_TABLE).insert({
        id: message.id,
        room_code: message.roomCode,
        sender_id: message.senderId,
        sender_name: message.senderName,
        sender_avatar: message.senderAvatar,
        message: message.message,
        created_at: message.createdAt,
      });

      const channel = supabase.channel(`game:${gameNamespace}:${message.roomCode}`);
      channel.send({
        type: 'broadcast',
        event: CHAT_EVENT,
        payload: message,
      });
    } catch {
      // Graceful fallback for offline / mock
    }
  }

  static async fetchMessages(roomCode: string): Promise<ChatMessage[]> {
    const cleanCode = roomCode.trim();
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from(ROOM_MESSAGES_TABLE)
        .select('*')
        .eq('room_code', cleanCode)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        roomCode: d.room_code,
        senderId: d.sender_id,
        senderName: d.sender_name,
        senderAvatar: d.sender_avatar,
        message: d.message,
        createdAt: d.created_at,
      }));
    } catch {
      return [];
    }
  }
}
