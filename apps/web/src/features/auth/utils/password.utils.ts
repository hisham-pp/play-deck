import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

export function isBcryptHash(value: string): boolean {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

export async function verifyPassword(plainText: string, hashedOrPlain: string): Promise<boolean> {
  if (!plainText || !hashedOrPlain) return false;

  if (isBcryptHash(hashedOrPlain)) {
    try {
      return await bcrypt.compare(plainText, hashedOrPlain);
    } catch {
      return false;
    }
  }

  return plainText === hashedOrPlain;
}
