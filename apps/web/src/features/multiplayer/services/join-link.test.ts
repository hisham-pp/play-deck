import assert from 'node:assert';
import { describe, it } from 'node:test';
import { buildJoinLink, JOIN_ROOM_PARAM, parseJoinCode } from './join-link';

describe('Shareable join links', () => {
  it('builds a play link carrying the room code', () => {
    const link = buildJoinLink('chess', '482913', 'https://playdeck.app');
    assert.strictEqual(link, 'https://playdeck.app/play/chess?room=482913');
    assert.strictEqual(new URL(link).searchParams.get(JOIN_ROOM_PARAM), '482913');
  });

  it('ignores any path already on the origin', () => {
    const link = buildJoinLink('ludo', ' 100200 ', 'http://localhost:3000/games/ludo');
    assert.strictEqual(link, 'http://localhost:3000/play/ludo?room=100200');
  });

  it('accepts only six-digit codes', () => {
    assert.strictEqual(parseJoinCode('482913'), '482913');
    assert.strictEqual(parseJoinCode(' 482913 '), '482913');
    assert.strictEqual(parseJoinCode('48291'), null);
    assert.strictEqual(parseJoinCode('4829130'), null);
    assert.strictEqual(parseJoinCode('ABCDEF'), null);
    assert.strictEqual(parseJoinCode(''), null);
    assert.strictEqual(parseJoinCode(null), null);
    assert.strictEqual(parseJoinCode(undefined), null);
  });
});
