import * as crypto from 'crypto';

/**
 * Produces a SHA-256 hex hash of any token (session, invite, verify, OTP).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a random cryptographic token in hex.
 */
export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a random 6-digit numeric OTP.
 */
export function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Encrypts sensitive fields (such as TOTP secrets) using AES-256-GCM.
 */
export function encryptField(plainText: string, hexKey: string): string {
  const key = Buffer.from(hexKey, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts sensitive fields using AES-256-GCM.
 */
export function decryptField(encryptedPayload: string, hexKey: string): string {
  const [ivHex, tagHex, contentHex] = encryptedPayload.split(':');
  if (!ivHex || !tagHex || !contentHex) {
    throw new Error('Invalid encrypted payload structure');
  }
  const key = Buffer.from(hexKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(contentHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Sanitizes input for MySQL boolean mode full-text search:
 * Strips special operators (+ - < > ( ) ~ * " @) and trims.
 */
export function sanitizeFulltextQuery(query: string): string {
  if (!query) return '';
  return query.replace(/[+\-<>()~*"@]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes values for CSV export to protect against CSV Formula Injection (CWE-1236).
 * Prepends a single quote if string begins with =, +, -, @, \t, or \r.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
