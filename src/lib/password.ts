import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedPassword: string) {
  const [algorithm, salt, storedKey, ...extra] = storedPassword.split('$');
  if (algorithm !== 'scrypt' || !salt || !storedKey || extra.length > 0) {
    const supplied = Buffer.from(password);
    const stored = Buffer.from(storedPassword);
    return supplied.length === stored.length && timingSafeEqual(supplied, stored);
  }

  try {
    const expected = Buffer.from(storedKey, 'hex');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = await scrypt(password, salt, KEY_LENGTH) as Buffer;
    return timingSafeEqual(expected, actual);
  } catch (error) {
    console.error('Unable to verify password hash.', error);
    throw error;
  }
}
