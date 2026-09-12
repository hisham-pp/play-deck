import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RoomChatService } from './room-chat.service';

describe('Room Chat Service Tests', () => {
  it('creates structured chat message with unique ID and timestamps', () => {
    const sender = { id: 'player_1', name: 'Pilot Alpha', avatar: '👾' };
    const msg = RoomChatService.createMessage('123456', sender, 'GG well played!');

    assert.ok(msg.id.startsWith('msg_'));
    assert.equal(msg.roomCode, '123456');
    assert.equal(msg.senderId, 'player_1');
    assert.equal(msg.senderName, 'Pilot Alpha');
    assert.equal(msg.senderAvatar, '👾');
    assert.equal(msg.message, 'GG well played!');
    assert.ok(Date.parse(msg.createdAt));
  });

  it('handles empty message fetch gracefully when unconfigured', async () => {
    const messages = await RoomChatService.fetchMessages('999999');
    assert.ok(Array.isArray(messages));
  });
});
