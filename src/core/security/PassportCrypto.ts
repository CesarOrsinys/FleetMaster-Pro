/**
 * FleetMaster-Pro - Enterprise Passport Authentication Security Service
 *
 * Implements client-side credential encryption into an encrypted 'Passport' envelope (AES-256-GCM)
 * preventing exposure of cleartext username and password in network inspection or dev tools.
 * Universal implementation utilizing standard Web Crypto API (crypto.subtle).
 */

const PASSPORT_PREFIX = 'FM_PASS_v1_';
const PASSPORT_DEFAULT_SECRET = 'FM_PASSPORT_SECURE_AUTH_KEY_2026_VALENCIA_CORONADA';
const PASSPORT_TTL_MS = 10 * 60 * 1000; // 10 minutes replay protection window

function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is not available in the current environment.');
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error('Web Crypto API (crypto.getRandomValues) is not available.');
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let cachedCryptoKey: CryptoKey | null = null;

async function getDerivedKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;

  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const secret = (typeof process !== 'undefined' && process.env?.PASSPORT_SECRET) || PASSPORT_DEFAULT_SECRET;
  const keyMaterial = await subtle.digest('SHA-256', enc.encode(secret));

  cachedCryptoKey = await subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedCryptoKey;
}

export interface DecryptedPassport {
  username: string;
  password: string;
  timestamp: number;
}

export class PassportCrypto {
  /**
   * Encrypts username and password into a secure, opaque Passport token
   * to send safely over HTTP/JSON without revealing cleartext credentials.
   */
  public static async createAuthPassport(credentials: { username: string; password: string }): Promise<string> {
    const subtle = getSubtleCrypto();
    const key = await getDerivedKey();
    const enc = new TextEncoder();

    const iv = getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const payload = JSON.stringify({
      u: credentials.username.trim(),
      p: credentials.password,
      ts: Date.now(),
      nonce: Math.random().toString(36).substring(2, 10)
    });

    const ciphertext = await subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      enc.encode(payload) as any
    );

    // Combine IV (12 bytes) + Ciphertext (with 16-byte auth tag)
    const combined = new Uint8Array(12 + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), 12);

    return `${PASSPORT_PREFIX}${bytesToBase64(combined)}`;
  }

  /**
   * Decrypts and verifies an authentication Passport on the server side.
   * Enforces format validation, authentication tag check, and replay protection window.
   */
  public static async decryptAuthPassport(passportString: string): Promise<DecryptedPassport | null> {
    try {
      if (!passportString || typeof passportString !== 'string') return null;
      if (!passportString.startsWith(PASSPORT_PREFIX)) return null;

      const rawB64 = passportString.slice(PASSPORT_PREFIX.length);
      const bytes = base64ToBytes(rawB64);
      if (bytes.length < 28) return null; // 12-byte IV + min 16-byte GCM tag

      const iv = bytes.subarray(0, 12);
      const ciphertext = bytes.subarray(12);

      const subtle = getSubtleCrypto();
      const key = await getDerivedKey();
      const dec = new TextDecoder();

      const decryptedBuffer = await subtle.decrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        ciphertext as any
      );

      const payload = JSON.parse(dec.decode(decryptedBuffer));
      if (!payload.u || !payload.p || !payload.ts) return null;

      // Replay attack prevention check (10-minute window)
      const now = Date.now();
      const age = Math.abs(now - payload.ts);
      if (age > PASSPORT_TTL_MS) {
        console.warn(`[PassportCrypto] Expired passport rejected. Age: ${age}ms > ${PASSPORT_TTL_MS}ms`);
        return null;
      }

      return {
        username: payload.u,
        password: payload.p,
        timestamp: payload.ts
      };
    } catch (err) {
      console.warn('[PassportCrypto] Decryption failed or tampered passport:', (err as Error).message);
      return null;
    }
  }
}
