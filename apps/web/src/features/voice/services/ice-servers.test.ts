import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { buildIceServers, hasRelayConfigured } from './ice-servers';

const TURN_URL = 'NEXT_PUBLIC_VOICE_TURN_URL';
const STUN_URLS = 'NEXT_PUBLIC_VOICE_STUN_URLS';

afterEach(() => {
  delete process.env[TURN_URL];
  delete process.env[STUN_URLS];
  delete process.env.NEXT_PUBLIC_VOICE_TURN_USERNAME;
  delete process.env.NEXT_PUBLIC_VOICE_TURN_CREDENTIAL;
});

describe('ICE server Tests', () => {
  it('falls back to public STUN when nothing is configured', () => {
    const servers = buildIceServers();
    assert.equal(servers.length, 1);
    assert.ok(String(servers[0].urls).includes('stun:'));
    assert.equal(hasRelayConfigured(), false);
  });

  it('adds a credentialed TURN relay when one is configured', () => {
    process.env[TURN_URL] = 'turn:relay.example.com:3478';
    process.env.NEXT_PUBLIC_VOICE_TURN_USERNAME = 'playdeck';
    process.env.NEXT_PUBLIC_VOICE_TURN_CREDENTIAL = 'secret';

    const servers = buildIceServers();
    assert.equal(servers.length, 2);
    assert.deepEqual(servers[1].urls, ['turn:relay.example.com:3478']);
    assert.equal(servers[1].username, 'playdeck');
    assert.equal(servers[1].credential, 'secret');
    assert.equal(hasRelayConfigured(), true);
  });

  it('accepts comma separated STUN overrides and trims them', () => {
    process.env[STUN_URLS] = 'stun:one.example.com , stun:two.example.com';
    const servers = buildIceServers();
    assert.deepEqual(servers[0].urls, ['stun:one.example.com', 'stun:two.example.com']);
  });
});
