import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;

  try {
    return await bcrypt.compare(plainText, hash);
  } catch {
    return false;
  }
}
