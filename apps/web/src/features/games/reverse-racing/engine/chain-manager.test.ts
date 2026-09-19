import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RacingPlayer } from '../types/reverse-racing.types';
import { buildSabotageChain, getAttackingSaboteurId } from './chain-manager';

describe('Reverse Racing Chain Manager', () => {
  const mockPlayers: RacingPlayer[] = [
    {
      id: 'p1',
      name: 'Player 1',
      avatar: '🏎️',
      seatIndex: 0,
      color: '#ff0000',
      isBot: false,
      isHost: true,
      ready: true,
      trackId: 'track-p1',
    },
    {
      id: 'p2',
      name: 'Player 2',
      avatar: '🏎️',
      seatIndex: 1,
      color: '#00ff00',
      isBot: false,
      isHost: false,
      ready: true,
      trackId: 'track-p2',
    },
    {
      id: 'p3',
      name: 'Player 3',
      avatar: '🤖',
      seatIndex: 2,
      color: '#0000ff',
      isBot: true,
      isHost: false,
      ready: true,
      trackId: 'track-p3',
    },
  ];

  it('builds circular sabotage chain where each player attacks predecessor', () => {
    const chain = buildSabotageChain(mockPlayers);

    // p1 (index 0) attacks p3 (index 2)
    assert.equal(chain.get('p1'), 'p3');
    // p2 (index 1) attacks p1 (index 0)
    assert.equal(chain.get('p2'), 'p1');
    // p3 (index 2) attacks p2 (index 1)
    assert.equal(chain.get('p3'), 'p2');
  });

  it('identifies attacking saboteur correctly for a racer', () => {
    // p1's track is attacked by p2
    assert.equal(getAttackingSaboteurId('p1', mockPlayers), 'p2');
    // p2's track is attacked by p3
    assert.equal(getAttackingSaboteurId('p2', mockPlayers), 'p3');
    // p3's track is attacked by p1
    assert.equal(getAttackingSaboteurId('p3', mockPlayers), 'p1');
  });

  it('handles 2 players cleanly', () => {
    const twoPlayers = mockPlayers.slice(0, 2);
    const chain = buildSabotageChain(twoPlayers);
    assert.equal(chain.get('p1'), 'p2');
    assert.equal(chain.get('p2'), 'p1');
  });
});
