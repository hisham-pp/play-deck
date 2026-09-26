import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { PlayerPresence } from './supabase-transport.service';
import { SupabaseTransportService } from './supabase-transport.service';

describe('SupabaseTransportService', () => {
  it('preserves presenceListeners across connect() and invokes them on presence sync', async () => {
    let presenceSyncHandler: (() => void) | null = null;
    let trackedPlayer: PlayerPresence | null = null;
    let removedChannel: unknown = null;

    const mockChannel = {
      on: (type: string, filter: { event?: string }, handler: () => void) => {
        if (type === 'presence' && filter.event === 'sync') {
          presenceSyncHandler = handler;
        }
        return mockChannel;
      },
      subscribe: (callback: (status: string) => void) => {
        callback('SUBSCRIBED');
        return mockChannel;
      },
      track: async (p: PlayerPresence) => {
        trackedPlayer = p;
        return 'ok';
      },
      presenceState: () => ({
        'host-1': [{ playerId: 'host-1', displayName: 'Host', avatar: '🕹️', role: 'host' }],
        'guest-2': [{ playerId: 'guest-2', displayName: 'Guest', avatar: '🕹️', role: 'guest' }],
      }),
      send: () => {},
    };

    const mockSupabase = {
      channel: () => mockChannel as unknown as RealtimeChannel,
      removeChannel: (ch: unknown) => {
        removedChannel = ch;
      },
    } as unknown as SupabaseClient;

    const transport = new SupabaseTransportService('ludo', mockSupabase);
    const receivedPresences: PlayerPresence[][] = [];

    // 1. Attach presence listener BEFORE connect (like all store attachPresence methods do)
    const unsub = transport.onPresence((presences) => {
      receivedPresences.push(presences);
    });

    // 2. Call connect
    const hostPresence: PlayerPresence = {
      playerId: 'host-1',
      displayName: 'Host',
      avatar: '🕹️',
      role: 'host',
    };
    const connected = await transport.connect('123456', hostPresence);
    assert.strictEqual(connected, true);
    assert.strictEqual(trackedPlayer, hostPresence);

    // 3. Trigger presence sync from realtime channel
    const triggerSync = presenceSyncHandler as (() => void) | null;
    assert.ok(triggerSync, 'presence sync handler must be registered on channel');
    triggerSync();

    // 4. Verify presence listener was NOT cleared by connect() and received both players
    assert.strictEqual(receivedPresences.length, 1);
    assert.strictEqual(receivedPresences[0].length, 2);
    assert.strictEqual(receivedPresences[0][0].playerId, 'host-1');
    assert.strictEqual(receivedPresences[0][1].playerId, 'guest-2');

    // 5. Connect again to a different room: should remove old channel without wiping listeners
    await transport.connect('654321', hostPresence);
    assert.strictEqual(removedChannel, mockChannel);

    triggerSync();
    assert.strictEqual(receivedPresences.length, 2);

    // 6. Disconnect should tear down channel and clear listeners
    transport.disconnect();
    assert.strictEqual(transport.getPresence().length, 0);

    unsub();
  });
});
