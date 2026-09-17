import type { Room } from '@playdeck/game-types';
import { GameInvitesService } from '@/features/friends/services/game-invites.service';
import { getSupabaseClient } from '@/lib/supabase/client';

const ROOMS_TABLE = 'rooms';

export function generateSixDigitCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

export class RoomService {
  static async createRoom(gameId: string, hostId: string): Promise<Room> {
    const code = generateSixDigitCode();
    const roomId = `room_${code}`;
    const now = new Date().toISOString();

    const room: Room = {
      id: roomId,
      code,
      gameId,
      hostId,
      maxPlayers: 2,
      status: 'open',
      isPrivate: false,
      createdAt: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from(ROOMS_TABLE).insert({
          id: roomId,
          code,
          game_id: gameId,
          host_id: hostId,
          status: 'waiting',
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn('Could not persist room to database:', err);
      }
    }

    return room;
  }

  /** `offlineGameId` names the game of the stand-in room returned when Supabase is not configured. */
  static async fetchRoomByCode(code: string, offlineGameId = 'tic-tac-toe'): Promise<Room | null> {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) return null;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        id: `room_${cleanCode}`,
        code: cleanCode,
        gameId: offlineGameId,
        hostId: 'host',
        maxPlayers: 2,
        status: 'open',
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from(ROOMS_TABLE)
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        code: data.code,
        gameId: data.game_id,
        hostId: data.host_id,
        maxPlayers: 2,
        status: data.status === 'waiting' ? 'open' : 'in-progress',
        isPrivate: false,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  }

  static async joinRoom(code: string, guestId: string): Promise<boolean> {
    const cleanCode = code.trim();
    const supabase = getSupabaseClient();
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from(ROOMS_TABLE)
        .update({
          guest_id: guestId,
          status: 'in-progress',
          updated_at: new Date().toISOString(),
        })
        .eq('code', cleanCode);

      return !error;
    } catch {
      return false;
    }
  }

  static async closeRoom(code: string): Promise<void> {
    const cleanCode = code.trim();
    await GameInvitesService.closeInvitesForRoom(cleanCode);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase
        .from(ROOMS_TABLE)
        .update({
          status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('code', cleanCode);
    } catch (err) {
      console.warn('Could not close room in database:', err);
    }
  }
}
