import { describe, expect, it } from 'vitest';
import { decryptPackage, encryptPackage, hashPassword, MINIMUM_SECRET_LENGTH, verifyPassword } from './crypto';

describe('credential and package cryptography', () => {
  const secret = 'correct horse battery staple';

  it('creates a salted verifier that accepts only the original password', async () => {
    const verifierOne = await hashPassword(secret);
    const verifierTwo = await hashPassword(secret);

    expect(verifierOne).toMatch(/^CGP1\$pbkdf2-sha256\$600000\$/);
    expect(verifierOne).not.toBe(verifierTwo);
    await expect(verifyPassword(secret, verifierOne)).resolves.toBe(true);
    await expect(verifyPassword('incorrect password', verifierOne)).resolves.toBe(false);
  });

  it('rejects secrets below the minimum length', async () => {
    await expect(hashPassword('x'.repeat(MINIMUM_SECRET_LENGTH - 1))).rejects.toThrow('at least');
  });

  it('authenticates encrypted packages and rejects tampering', async () => {
    const encrypted = await encryptPackage(JSON.stringify({ case: 'OP-001' }), secret);
    expect(encrypted.startsWith('CGX1.')).toBe(true);
    await expect(decryptPackage(encrypted, secret)).resolves.toBe(JSON.stringify({ case: 'OP-001' }));
    await expect(decryptPackage(`${encrypted.slice(0, -1)}A`, secret)).rejects.toThrow();
    await expect(decryptPackage(encrypted, 'incorrect password')).rejects.toThrow();
  });
});
