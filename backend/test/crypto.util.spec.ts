import {
  hashToken,
  encryptField,
  decryptField,
  sanitizeCsvCell,
  sanitizeFulltextBooleanQuery,
} from '../src/common/utils/crypto.util';

describe('Cryptographic & Sanitization Utilities', () => {
  const testKey = '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';

  describe('Field Encryption (AES-256-GCM)', () => {
    it('should encrypt and decrypt a sensitive string reversibly', () => {
      const plaintext = 'TOTP_SECRET_JBSWY3DPEHPK3PXP';
      const encrypted = encryptField(plaintext, testKey);

      expect(encrypted).not.toEqual(plaintext);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:ciphertext

      const decrypted = decryptField(encrypted, testKey);
      expect(decrypted).toEqual(plaintext);
    });

    it('should fail decryption if ciphertext or auth tag is tampered with', () => {
      const encrypted = encryptField('test_secret', testKey);
      const parts = encrypted.split(':');
      // Tamper with ciphertext
      parts[2] = 'deadbeef' + parts[2].substring(8);
      const tampered = parts.join(':');

      expect(() => decryptField(tampered, testKey)).toThrow();
    });
  });

  describe('Token Hashing (SHA-256)', () => {
    it('should produce consistent sha256 hex hashes', () => {
      const token = 'oasis_session_token_123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toEqual(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('CSV Injection Sanitization', () => {
    it('should prefix dangerous formula triggers (=, +, -, @) with a single quote', () => {
      expect(sanitizeCsvCell('=1+1')).toEqual("'=1+1");
      expect(sanitizeCsvCell('+cmd|')).toEqual("'+cmd|");
      expect(sanitizeCsvCell('-2+5')).toEqual("'-2+5");
      expect(sanitizeCsvCell('@SUM(A1)')).toEqual("'@SUM(A1)");
    });

    it('should leave normal strings unchanged', () => {
      expect(sanitizeCsvCell('Debabrata Mohanty')).toEqual('Debabrata Mohanty');
      expect(sanitizeCsvCell('user@oasis.community')).toEqual('user@oasis.community');
    });
  });

  describe('Fulltext Boolean Query Sanitization', () => {
    it('should strip syntax operators (+, -, *, <, >, ~, @, ", ()) and format with prefix wildcards', () => {
      const raw = 'fintech* +ai/ml @bangalore (founder)';
      const sanitized = sanitizeFulltextBooleanQuery(raw);

      expect(sanitized).not.toContain('*');
      expect(sanitized).not.toContain('+');
      expect(sanitized).not.toContain('@');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
      expect(sanitized).toContain('+fintech*');
    });
  });
});
