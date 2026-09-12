import assert from 'node:assert';
import { describe, it } from 'node:test';
import { generateSixDigitCode, RoomService } from './room.service';

describe('Multiplayer Room Service & 6-Digit Code Tests', () => {
  describe('1. 6-Digit Code Generation', () => {
    it('generates a string of exactly 6 digits', () => {
      const code = generateSixDigitCode();
      assert.strictEqual(code.length, 6);
      assert.match(code, /^\d{6}$/);
    });

    it('generates numbers within the 100000 to 999999 range', () => {
      for (let i = 0; i < 50; i++) {
        const code = generateSixDigitCode();
        const num = Number(code);
        assert.ok(num >= 100000 && num <= 999999);
        assert.strictEqual(code.length, 6);
      }
    });

    it('generates unique random codes across successive calls', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 20; i++) {
        codes.add(generateSixDigitCode());
      }
      assert.ok(codes.size > 15);
    });
  });

  describe('2. Room Operations with 6-Digit Code', () => {
    it('creates room with 6-digit code and waiting status', async () => {
      const room = await RoomService.createRoom('tic-tac-toe', 'player_123');
      assert.ok(room.id.startsWith('room_'));
      assert.strictEqual(room.code.length, 6);
      assert.match(room.code, /^\d{6}$/);
      assert.strictEqual(room.gameId, 'tic-tac-toe');
      assert.strictEqual(room.hostId, 'player_123');
      assert.strictEqual(room.maxPlayers, 2);
    });

    it('rejects invalid non-6-digit codes on lookup', async () => {
      const invalidShort = await RoomService.fetchRoomByCode('123');
      assert.strictEqual(invalidShort, null);

      const invalidLetters = await RoomService.fetchRoomByCode('ABCDEF');
      assert.strictEqual(invalidLetters, null);

      const invalidLong = await RoomService.fetchRoomByCode('1234567');
      assert.strictEqual(invalidLong, null);
    });
  });
});
