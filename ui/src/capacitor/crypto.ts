const PASSWORD_FORMAT = 'CGP1';
const PACKAGE_FORMAT = 'CGX1';
const PBKDF2_HASH = 'SHA-256';
const PASSWORD_ITERATIONS = 600_000;
const LEGACY_EXPORT_ITERATIONS = 100_000;
const EXPORT_SALT_BYTES = 16;
const EXPORT_IV_BYTES = 12;
const EXPORT_AAD = new TextEncoder().encode('CrimeGraph case package v1');

export const MINIMUM_SECRET_LENGTH = 12;

function requireWebCrypto(): Crypto {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('Secure cryptography is unavailable on this device.');
  }
  return globalThis.crypto;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  if (!value || value.length > 50_000_000) throw new Error('Invalid encoded package.');
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    throw new Error('Invalid encoded package.');
  }
}

function requireSecret(secret: string): void {
  if (secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(`Secret must contain at least ${MINIMUM_SECRET_LENGTH} characters.`);
  }
}

async function deriveBits(secret: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const crypto = requireWebCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: asArrayBuffer(salt), iterations, hash: PBKDF2_HASH },
    keyMaterial,
    256,
  );
  return new Uint8Array(derived);
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

/** Creates a self-describing, salted password verifier. Never store a raw secret. */
export async function hashPassword(secret: string): Promise<string> {
  requireSecret(secret);
  const crypto = requireWebCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(EXPORT_SALT_BYTES));
  const digest = await deriveBits(secret, salt, PASSWORD_ITERATIONS);
  return [PASSWORD_FORMAT, 'pbkdf2-sha256', String(PASSWORD_ITERATIONS), toBase64(salt), toBase64(digest)].join('$');
}

/** Verifies a password without exposing which part of the verifier was invalid. */
export async function verifyPassword(secret: string, storedVerifier: string): Promise<boolean> {
  const [format, algorithm, iterationsText, saltEncoded, digestEncoded] = storedVerifier.split('$');
  const iterations = Number(iterationsText);
  if (
    format !== PASSWORD_FORMAT
    || algorithm !== 'pbkdf2-sha256'
    || !Number.isSafeInteger(iterations)
    || iterations < 100_000
    || iterations > 2_000_000
    || !saltEncoded
    || !digestEncoded
  ) {
    return false;
  }

  try {
    const expected = fromBase64(digestEncoded);
    const actual = await deriveBits(secret, fromBase64(saltEncoded), iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

async function deriveExportKey(secret: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const crypto = requireWebCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: asArrayBuffer(salt), iterations, hash: PBKDF2_HASH },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Encrypts an exported case with AES-256-GCM and versioned authenticated metadata. */
export async function encryptPackage(data: string, secret: string): Promise<string> {
  requireSecret(secret);
  if (data.length > 25_000_000) throw new Error('Export exceeds the supported package size.');

  const crypto = requireWebCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(EXPORT_SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(EXPORT_IV_BYTES));
  const key = await deriveExportKey(secret, salt, PASSWORD_ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(iv), additionalData: EXPORT_AAD },
    key,
    new TextEncoder().encode(data),
  );
  const bundle = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  bundle.set(salt, 0);
  bundle.set(iv, salt.length);
  bundle.set(new Uint8Array(ciphertext), salt.length + iv.length);
  return `${PACKAGE_FORMAT}.${toBase64(bundle)}`;
}

/**
 * Decrypts a current package or a legacy raw-base64 package created by earlier builds.
 * Legacy support can be removed once all supported devices have migrated to CGX1 packages.
 */
export async function decryptPackage(encryptedValue: string, secret: string): Promise<string> {
  requireSecret(secret);
  const isCurrentPackage = encryptedValue.startsWith(`${PACKAGE_FORMAT}.`);
  const encoded = isCurrentPackage ? encryptedValue.slice(PACKAGE_FORMAT.length + 1) : encryptedValue;
  const bundle = fromBase64(encoded);
  if (bundle.length <= EXPORT_SALT_BYTES + EXPORT_IV_BYTES + 16) {
    throw new Error('Encrypted package is incomplete.');
  }

  const salt = bundle.slice(0, EXPORT_SALT_BYTES);
  const iv = bundle.slice(EXPORT_SALT_BYTES, EXPORT_SALT_BYTES + EXPORT_IV_BYTES);
  const ciphertext = bundle.slice(EXPORT_SALT_BYTES + EXPORT_IV_BYTES);
  const key = await deriveExportKey(secret, salt, isCurrentPackage ? PASSWORD_ITERATIONS : LEGACY_EXPORT_ITERATIONS);
  const crypto = requireWebCrypto();
  const decrypted = await crypto.subtle.decrypt(
    isCurrentPackage
      ? { name: 'AES-GCM', iv: asArrayBuffer(iv), additionalData: EXPORT_AAD }
      : { name: 'AES-GCM', iv: asArrayBuffer(iv) },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
}
