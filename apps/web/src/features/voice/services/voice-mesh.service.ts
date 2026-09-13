import type {
  VoiceIceCandidate,
  VoiceSessionDescription,
  VoiceSignal,
  VoiceSignalChannel,
} from '@playdeck/game-types';
import type { VoiceIdentity, VoiceRemotePeer } from '../types/voice.types';
import { MAX_MESH_PEERS } from '../voice.constants';
import { buildIceServers } from './ice-servers';
import { createSignal, isSignalForLocalPeer, shouldInitiateOffer } from './voice-negotiation';
import { VoicePeerConnection } from './voice-peer-connection.service';

interface PeerRecord {
  connection: VoicePeerConnection;
  peer: VoiceRemotePeer;
}

export interface VoiceMeshOptions {
  roomCode: string;
  localPlayer: VoiceIdentity;
  channel: VoiceSignalChannel;
  localStream: MediaStream;
  onPeersChanged: (peers: VoiceRemotePeer[]) => void;
}

const HELLO = 'hello';
const OFFER = 'offer';
const PEER_STATE = 'peer-state';

/**
 * A full mesh of audio-only peer connections for one room. Signalling rides the
 * realtime channel the games already use, so voice needs no extra server.
 *
 * Handshake: every first-contact hello is answered with a direct hello, then the
 * peer with the lower id sends the offer. Both sides evaluate the same
 * comparison, so there is never a glare collision and a hello is safe to repeat.
 */
export class VoiceMesh {
  private readonly options: VoiceMeshOptions;
  private readonly peers = new Map<string, PeerRecord>();
  private readonly iceServers = buildIceServers();
  private unsubscribe: (() => void) | null = null;
  private isMuted = false;
  private isStopped = false;

  constructor(options: VoiceMeshOptions) {
    this.options = options;
  }

  start(): void {
    this.unsubscribe = this.options.channel.onVoiceSignal((signal) => {
      void this.handleSignal(signal);
    });
    this.send(HELLO, null);
  }

  stop(): void {
    this.isStopped = true;
    this.send('bye', null);
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.peers.forEach((record) => record.connection.close());
    this.peers.clear();
    this.emit();
  }

  setMuted(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.send(PEER_STATE, null, { type: PEER_STATE, isMuted });
  }

  /**
   * Presence is the source of truth for who is in the room. Anyone present but
   * unconnected gets a direct hello and anyone who vanished is torn down, which
   * is what recovers a mesh after a dropped broadcast or a refreshed tab.
   */
  syncRoster(presentPeerIds: string[]): void {
    if (this.isStopped) return;
    const present = new Set(presentPeerIds.filter((id) => id !== this.options.localPlayer.id));

    present.forEach((peerId) => {
      this.dropDeadPeer(peerId);
      if (!this.peers.has(peerId)) this.send(HELLO, peerId);
    });

    Array.from(this.peers.keys()).forEach((peerId) => {
      if (!present.has(peerId)) this.removePeer(peerId);
    });
  }

  private async handleSignal(signal: VoiceSignal): Promise<void> {
    if (this.isStopped) return;
    if (!isSignalForLocalPeer(signal, this.options.localPlayer.id, this.options.roomCode)) return;

    switch (signal.kind) {
      case HELLO:
        await this.handleHello(signal);
        break;
      case OFFER:
      case 'answer':
        await this.handleDescription(signal);
        break;
      case 'candidate':
        await this.handleCandidate(signal);
        break;
      case PEER_STATE:
        this.applyPeerState(signal);
        break;
      case 'bye':
        this.removePeer(signal.senderId);
        break;
    }
  }

  private async handleHello(signal: VoiceSignal): Promise<void> {
    this.dropDeadPeer(signal.senderId);

    if (this.peers.has(signal.senderId)) {
      this.applyPeerState(signal);
      return;
    }
    if (this.peers.size >= MAX_MESH_PEERS - 1) return;

    const record = this.ensurePeer(signal);
    this.applyPeerState(signal);

    // Greet back so the other side records us too, whichever way contact started.
    this.send(HELLO, signal.senderId);

    if (shouldInitiateOffer(this.options.localPlayer.id, signal.senderId)) {
      await record.connection.createOffer().catch(() => this.markFailed(signal.senderId));
    }
  }

  private async handleDescription(signal: VoiceSignal): Promise<void> {
    if (signal.payload.type !== 'session-description') return;
    const description: VoiceSessionDescription = signal.payload.description;
    const record = this.ensurePeer(signal);

    try {
      if (description.type === OFFER) {
        await record.connection.acceptOffer(description);
      } else {
        await record.connection.acceptAnswer(description);
      }
    } catch {
      this.markFailed(signal.senderId);
    }
  }

  private async handleCandidate(signal: VoiceSignal): Promise<void> {
    if (signal.payload.type !== 'ice-candidate') return;
    const record = this.peers.get(signal.senderId);
    if (!record) return;
    await record.connection.addRemoteCandidate(signal.payload.candidate);
  }

  private applyPeerState(signal: VoiceSignal): void {
    if (signal.payload.type !== PEER_STATE) return;
    this.patchPeer(signal.senderId, { isMuted: signal.payload.isMuted });
  }

  private ensurePeer(signal: VoiceSignal): PeerRecord {
    const existing = this.peers.get(signal.senderId);
    if (existing) return existing;

    const peerId = signal.senderId;
    const connection = new VoicePeerConnection(this.options.localStream, this.iceServers, {
      onLocalDescription: (description) =>
        this.send(description.type === OFFER ? OFFER : 'answer', peerId, {
          type: 'session-description',
          description,
        }),
      onIceCandidate: (candidate: VoiceIceCandidate) =>
        this.send('candidate', peerId, { type: 'ice-candidate', candidate }),
      onRemoteStream: (stream) => this.patchPeer(peerId, { stream }),
      onStatusChange: (status) => this.patchPeer(peerId, { status }),
    });

    const record: PeerRecord = {
      connection,
      peer: {
        peerId,
        displayName: signal.senderName || 'Player',
        avatar: signal.senderAvatar || '🎧',
        status: 'connecting',
        isMuted: false,
        stream: null,
      },
    };

    this.peers.set(peerId, record);
    this.emit();
    return record;
  }

  /** A failed or closed connection is unusable; forget it so a hello rebuilds it. */
  private dropDeadPeer(peerId: string): void {
    const record = this.peers.get(peerId);
    if (!record) return;
    const state = record.connection.connectionState;
    if (state === 'failed' || state === 'closed') this.removePeer(peerId);
  }

  private markFailed(peerId: string): void {
    this.patchPeer(peerId, { status: 'failed' });
  }

  private patchPeer(peerId: string, patch: Partial<VoiceRemotePeer>): void {
    const record = this.peers.get(peerId);
    if (!record) return;
    record.peer = { ...record.peer, ...patch };
    this.emit();
  }

  private removePeer(peerId: string): void {
    const record = this.peers.get(peerId);
    if (!record) return;
    record.connection.close();
    this.peers.delete(peerId);
    this.emit();
  }

  private send(
    kind: VoiceSignal['kind'],
    targetId: string | null,
    payload: VoiceSignal['payload'] = { type: PEER_STATE, isMuted: this.isMuted },
  ): void {
    const { id, displayName, avatar } = this.options.localPlayer;
    const identity = {
      roomCode: this.options.roomCode,
      senderId: id,
      senderName: displayName,
      senderAvatar: avatar,
    };
    this.options.channel.sendVoiceSignal(createSignal(identity, kind, targetId, payload));
  }

  private emit(): void {
    this.options.onPeersChanged(Array.from(this.peers.values(), (record) => record.peer));
  }
}
