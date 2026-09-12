import assert from 'node:assert';
import { describe, it } from 'node:test';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { createGuestPlayer, DEFAULT_STATS } from '../../../stores/player-store.utils';
import { USERS_TABLE, PLAYERS_TABLE } from '../auth.constants';
import { SupabaseAuthService } from './supabase-auth.service';

describe('Table-Based Auth & Player Integration Tests', () => {
  describe('1. Users Table Schema & Constants', () => {
    it('targets public.users table for user persistence', () => {
      assert.strictEqual(USERS_TABLE, 'users');
      assert.strictEqual(PLAYERS_TABLE, 'users');
    });
  });

  describe('2. Guest Player Fallback', () => {
    it('generates a valid guest player structure', () => {
      const guest = createGuestPlayer();
      assert.ok(guest.id.startsWith('player_'));
      assert.ok(guest.displayName.startsWith('Player_'));
      assert.strictEqual(guest.isGuest, true);
      assert.strictEqual(guest.avatar, '🕹️');
      assert.ok(Date.parse(guest.createdAt) > 0);
    });

    it('provides clean zeroed stats for new players', () => {
      assert.strictEqual(DEFAULT_STATS.gamesPlayed, 0);
      assert.strictEqual(DEFAULT_STATS.wins, 0);
      assert.strictEqual(DEFAULT_STATS.losses, 0);
    });
  });

  describe('3. Table Auth Configuration Guard', () => {
    it('gracefully detects when credentials are configured or default', () => {
      const configured = isSupabaseConfigured();
      assert.strictEqual(typeof configured, 'boolean');
    });

    it('returns graceful error when attempting table auth without configuration', async () => {
      if (!isSupabaseConfigured()) {
        const signUpResult = await SupabaseAuthService.signUp('test@example.com', 'secret123');
        assert.strictEqual(signUpResult.success, false);
        assert.ok(signUpResult.error?.includes('credentials not configured'));

        const signInResult = await SupabaseAuthService.signIn('test@example.com', 'secret123');
        assert.strictEqual(signInResult.success, false);
        assert.ok(signInResult.error?.includes('credentials not configured'));
      }
    });

    it('supports sign out gracefully', async () => {
      const signOutResult = await SupabaseAuthService.signOut();
      assert.strictEqual(signOutResult.success, true);
    });
  });
});
