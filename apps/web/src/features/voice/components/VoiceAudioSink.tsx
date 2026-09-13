'use client';

import React, { useEffect, useRef } from 'react';
import type { VoiceRemotePeer } from '../types/voice.types';

function RemoteAudio({ peer, isDeafened }: { peer: VoiceRemotePeer; isDeafened: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !peer.stream) return;
    if (element.srcObject === peer.stream) return;

    element.srcObject = peer.stream;
    // Autoplay can still be refused; the join click normally satisfies the policy.
    void element.play().catch(() => undefined);
  }, [peer.stream]);

  return <audio ref={audioRef} autoPlay playsInline muted={isDeafened} />;
}

/**
 * Remote audio has to live in real media elements to be audible, but nothing
 * about it is visual, so it renders as an inert, screen-reader-hidden node.
 */
export function VoiceAudioSink({
  peers,
  isDeafened,
}: {
  peers: VoiceRemotePeer[];
  isDeafened: boolean;
}) {
  return (
    <div aria-hidden className="hidden">
      {peers.map((peer) => (
        <RemoteAudio key={peer.peerId} peer={peer} isDeafened={isDeafened} />
      ))}
    </div>
  );
}
