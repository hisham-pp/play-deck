import assert from 'node:assert';
import { describe, it } from 'node:test';
import { hashPassword, verifyPassword } from './password.utils';

describe('Bcrypt Password Utility Tests', () => {
  const plain = 'SuperSecretArcade!42';

  it('generates a valid bcrypt hash format', async () => {
    const hash = await hashPassword(plain);
    assert.notStrictEqual(hash, plain);
    assert.ok(hash.startsWith('$2b$10$'));
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

  it('rejects empty strings for password or hash', async () => {
    assert.strictEqual(await verifyPassword('', 'hash'), false);
    assert.strictEqual(await verifyPassword('password', ''), false);
  });
});
