import type {
  VoiceIceCandidate,
  VoicePeerStatus,
  VoiceSessionDescription,
} from '@playdeck/game-types';
import { mapConnectionState } from './voice-negotiation';

export interface VoicePeerCallbacks {
  onLocalDescription: (description: VoiceSessionDescription) => void;
  onIceCandidate: (candidate: VoiceIceCandidate) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onStatusChange: (status: VoicePeerStatus) => void;
}

/**
 * One `RTCPeerConnection` plus the bookkeeping every peer needs: trickled
 * candidates that arrive before the remote description are buffered instead of
 * being thrown away, which is the most common cause of one-way audio.
 */
export class VoicePeerConnection {
  private readonly pc: RTCPeerConnection;
  private readonly callbacks: VoicePeerCallbacks;
  private pendingCandidates: VoiceIceCandidate[] = [];
  private hasRemoteDescription = false;
  private isClosed = false;

  constructor(localStream: MediaStream, iceServers: RTCIceServer[], callbacks: VoicePeerCallbacks) {
    this.callbacks = callbacks;
    this.pc = new RTCPeerConnection({ iceServers });

    localStream.getAudioTracks().forEach((track) => {
      this.pc.addTrack(track, localStream);
    });

    this.pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.callbacks.onRemoteStream(stream);
    };

    this.pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      this.callbacks.onIceCandidate(event.candidate.toJSON() as VoiceIceCandidate);
    };

    this.pc.onconnectionstatechange = () => {
      if (this.isClosed) return;
      this.callbacks.onStatusChange(mapConnectionState(this.pc.connectionState));
    };
  }

  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }

  async createOffer(iceRestart = false): Promise<void> {
    const offer = await this.pc.createOffer({ iceRestart });
    await this.pc.setLocalDescription(offer);
    this.emitLocalDescription();
  }

  async acceptOffer(description: VoiceSessionDescription): Promise<void> {
    await this.pc.setRemoteDescription(description as RTCSessionDescriptionInit);
    await this.drainCandidates();

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.emitLocalDescription();
  }

  async acceptAnswer(description: VoiceSessionDescription): Promise<void> {
    if (this.pc.signalingState !== 'have-local-offer') return;
    await this.pc.setRemoteDescription(description as RTCSessionDescriptionInit);
    await this.drainCandidates();
  }

  async addRemoteCandidate(candidate: VoiceIceCandidate): Promise<void> {
    if (!this.hasRemoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    await this.pc.addIceCandidate(candidate as RTCIceCandidateInit).catch(() => undefined);
  }

  close(): void {
    this.isClosed = true;
    this.pc.ontrack = null;
    this.pc.onicecandidate = null;
    this.pc.onconnectionstatechange = null;
    this.pc.close();
  }

  private emitLocalDescription(): void {
    const local = this.pc.localDescription;
    if (!local) return;
    this.callbacks.onLocalDescription({ type: local.type, sdp: local.sdp });
  }

  private async drainCandidates(): Promise<void> {
    this.hasRemoteDescription = true;
    const queued = this.pendingCandidates;
    this.pendingCandidates = [];
    for (const candidate of queued) {
      await this.pc.addIceCandidate(candidate as RTCIceCandidateInit).catch(() => undefined);
    }
  }
}
