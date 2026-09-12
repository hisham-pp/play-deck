import assert from 'node:assert';
import { describe, it } from 'node:test';
import { hashPassword, verifyPassword, isBcryptHash } from './password.utils';

describe('Bcrypt Password Utility Tests', () => {
  const plain = 'SuperSecretArcade!42';

  it('generates a valid bcrypt hash format', async () => {
    const hash = await hashPassword(plain);
    assert.notStrictEqual(hash, plain);
    assert.strictEqual(isBcryptHash(hash), true);
  });

  it('successfully verifies correct password against bcrypt hash', async () => {
    const hash = await hashPassword(plain);
    const valid = await verifyPassword(plain, hash);
    assert.strictEqual(valid, true);
  });

  it('rejects incorrect password against bcrypt hash', async () => {
    const hash = await hashPassword(plain);
    const valid = await verifyPassword('WrongPassword123', hash);
    assert.strictEqual(valid, false);
  });

  it('gracefully verifies legacy plaintext passwords and rejects mismatches', async () => {
    const legacyPlain = 'legacy_plain_pass';
    assert.strictEqual(await verifyPassword(legacyPlain, legacyPlain), true);
    assert.strictEqual(await verifyPassword('incorrect', legacyPlain), false);
    assert.strictEqual(isBcryptHash(legacyPlain), false);
  });

  it('rejects empty strings for password or hash', async () => {
    assert.strictEqual(await verifyPassword('', 'hash'), false);
    assert.strictEqual(await verifyPassword('password', ''), false);
  });
});
