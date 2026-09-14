import { DEFAULT_STUN_URLS } from '../voice.constants';

/**
 * STUN alone gets most home networks connected. Symmetric NATs and strict
 * corporate firewalls need a relay, so a TURN server can be supplied through
 * `NEXT_PUBLIC_VOICE_TURN_URL` (plus credentials) without a code change.
 */
export function buildIceServers(): RTCIceServer[] {
  const stunOverride = process.env.NEXT_PUBLIC_VOICE_STUN_URLS;
  const stunUrls = stunOverride
    ? stunOverride
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : [...DEFAULT_STUN_URLS];

  const servers: RTCIceServer[] = [{ urls: stunUrls }];

  const turnUrl = process.env.NEXT_PUBLIC_VOICE_TURN_URL;
  const turnUsername = process.env.NEXT_PUBLIC_VOICE_TURN_USERNAME;
  const turnCredential = process.env.NEXT_PUBLIC_VOICE_TURN_CREDENTIAL;

  if (turnUrl) {
    servers.push({
      urls: turnUrl.split(',').map((url) => url.trim()),
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return servers;
}

export function hasRelayConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VOICE_TURN_URL);
}
