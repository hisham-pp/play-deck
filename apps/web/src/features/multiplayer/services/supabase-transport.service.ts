import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ChatMessage, VoiceSignal, VoiceSignalChannel } from '@playdeck/game-types';
import { VOICE_SIGNAL_EVENT } from '@/features/voice/voice.constants';
import { getSupabaseClient } from '@/lib/supabase/client';

const BROADCAST_TYPE = 'broadcast';

export interface TransportMessage {
  type: string;
  payload: unknown;
  senderId: string;
  timestamp: number;
}

export interface PlayerPresence {
  playerId: string;
  displayName: string;
  avatar: string;
  role: 'host' | 'guest';
}

export class SupabaseTransportService implements VoiceSignalChannel {
  private channel: RealtimeChannel | null = null;
  private actionListeners: Set<(msg: TransportMessage) => void> = new Set();
  private presenceListeners: Set<(players: PlayerPresence[]) => void> = new Set();
  private statusListeners: Set<(status: string) => void> = new Set();
  private chatListeners: Set<(msg: ChatMessage) => void> = new Set();
  private voiceListeners: Set<(signal: VoiceSignal) => void> = new Set();
  private friendReqListeners: Set<(data: { senderId: string; senderName: string }) => void> =
    new Set();
  /** Latest presence roster, so late subscribers (voice) do not wait for a sync. */
  private lastPresence: PlayerPresence[] = [];

  constructor(private namespace: string = 'tictactoe') {}

  async connect(roomCode: string, player: PlayerPresence): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    this.disconnect();

    const channelName = `game:${this.namespace}:${roomCode}`;
    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: player.playerId },
      },
    });

    this.channel
      .on(BROADCAST_TYPE, { event: 'game-action' }, ({ payload }) => {
        this.actionListeners.forEach((listener) => listener(payload as TransportMessage));
      })
      .on(BROADCAST_TYPE, { event: 'chat-message' }, ({ payload }) => {
        this.chatListeners.forEach((listener) => listener(payload as ChatMessage));
      })
      .on(BROADCAST_TYPE, { event: VOICE_SIGNAL_EVENT }, ({ payload }) => {
        this.voiceListeners.forEach((listener) => listener(payload as VoiceSignal));
      })
      .on(BROADCAST_TYPE, { event: 'friend-request' }, ({ payload }) => {
        this.friendReqListeners.forEach((listener) =>
          listener(payload as { senderId: string; senderName: string }),
        );
      })
      .on('presence', { event: 'sync' }, () => {
        if (!this.channel) return;
        const state = this.channel.presenceState();
        const players: PlayerPresence[] = [];
        Object.values(state).forEach((presences) => {
          presences.forEach((item) => players.push(item as unknown as PlayerPresence));
        });
        this.lastPresence = players;
        this.presenceListeners.forEach((listener) => listener(players));
      })
      .subscribe((status) => {
        this.statusListeners.forEach((listener) => listener(status));
        if (status === 'SUBSCRIBED' && this.channel) {
          this.channel.track(player);
        }
      });

    return true;
  }

  send(type: string, payload: unknown, senderId: string): void {
    if (!this.channel) return;
    const msg: TransportMessage = {
      type,
      payload,
      senderId,
      timestamp: Date.now(),
    };
    this.channel.send({ type: BROADCAST_TYPE, event: 'game-action', payload: msg });
  }

  sendChat(msg: ChatMessage): void {
    if (!this.channel) return;
    this.channel.send({ type: BROADCAST_TYPE, event: 'chat-message', payload: msg });
  }

  /** WebRTC offer/answer/candidate traffic for room voice chat. */
  sendVoiceSignal(signal: VoiceSignal): void {
    if (!this.channel) return;
    this.channel.send({ type: BROADCAST_TYPE, event: VOICE_SIGNAL_EVENT, payload: signal });
  }

  sendFriendRequestNotice(senderId: string, senderName: string): void {
    if (!this.channel) return;
    this.channel.send({
      type: BROADCAST_TYPE,
      event: 'friend-request',
      payload: { senderId, senderName },
    });
  }

  onAction(listener: (msg: TransportMessage) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  onChat(listener: (msg: ChatMessage) => void): () => void {
    this.chatListeners.add(listener);
    return () => this.chatListeners.delete(listener);
  }

  onVoiceSignal(listener: (signal: VoiceSignal) => void): () => void {
    this.voiceListeners.add(listener);
    return () => {
      this.voiceListeners.delete(listener);
    };
  }

  getPresence(): PlayerPresence[] {
    return this.lastPresence;
  }

  onFriendRequest(listener: (data: { senderId: string; senderName: string }) => void): () => void {
    this.friendReqListeners.add(listener);
    return () => this.friendReqListeners.delete(listener);
  }

  onPresence(listener: (players: PlayerPresence[]) => void): () => void {
    this.presenceListeners.add(listener);
    return () => this.presenceListeners.delete(listener);
  }

  onStatus(listener: (status: string) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  disconnect(): void {
    if (this.channel) {
      const supabase = getSupabaseClient();
      if (supabase) supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.actionListeners.clear();
    this.chatListeners.clear();
    this.voiceListeners.clear();
    this.friendReqListeners.clear();
    this.presenceListeners.clear();
    this.statusListeners.clear();
    this.lastPresence = [];
  }
}
