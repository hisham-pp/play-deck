import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FriendsService } from './friends.service';
import { GameInvitesService } from './game-invites.service';

describe('Friends and Invites Service Tests', () => {
  describe('1. Email Friend Search Validation', () => {
    it('returns empty array when query is empty or less than 3 characters', async () => {
      const empty = await FriendsService.searchUsersByEmail('', 'player_1');
      const short = await FriendsService.searchUsersByEmail('ab', 'player_1');
      assert.deepEqual(empty, []);
      assert.deepEqual(short, []);
    });

    it('rejects adding oneself as friend', async () => {
      const res = await FriendsService.sendFriendRequest('player_1', 'player_1');
      assert.equal(res.success, false);
      assert.match(res.error || '', /yourself/i);
    });
  });

  describe('2. Game Invites Dispatch', () => {
    it('creates a valid game invite with 6-digit room code', async () => {
      const sender = { id: 'player_host', name: 'Host Player', avatar: '🎮' };
      const invite = await GameInvitesService.sendGameInvite(
        sender,
        'player_guest',
        'tic-tac-toe',
        '458921',
      );

      assert.ok(invite);
      assert.equal(invite.senderId, 'player_host');
      assert.equal(invite.senderName, 'Host Player');
      assert.equal(invite.receiverId, 'player_guest');
      assert.equal(invite.roomCode, '458921');
      assert.equal(invite.gameId, 'tic-tac-toe');
      assert.equal(invite.status, 'pending');
      assert.ok(invite.id.startsWith('invite_'));
    });

    it('accepts and declines invites gracefully', async () => {
      const accepted = await GameInvitesService.respondToInvite('invite_123', 'accepted');
      const declined = await GameInvitesService.respondToInvite('invite_123', 'declined');
      assert.equal(accepted, true);
      assert.equal(declined, true);
    });

    it('expires invites when a room is closed', async () => {
      const closed = await GameInvitesService.closeInvitesForRoom('458921');
      assert.equal(closed, true);
    });
  });

  describe('3. Friend Requests Acceptance and Removal', () => {
    it('responds to friend requests without crashing', async () => {
      const accepted = await FriendsService.respondToFriendRequest('friend_123', 'accepted');
      const declined = await FriendsService.respondToFriendRequest('friend_123', 'declined');
      assert.equal(accepted, true);
      assert.equal(declined, true);
    });

    it('removes friends cleanly', async () => {
      const removed = await FriendsService.removeFriend('player_1', 'player_2');
      assert.equal(removed, true);
    });
  });
});
