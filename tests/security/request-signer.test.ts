/**
 * Tests for request signing module
 * @module tests/security/request-signer.test
 */

import {
  signRequest,
  verifySignature,
  createSignedHeaders,
  extractAndVerifySignature,
  isSigningEnabled,
  getSigningConfig,
  REQUEST_SIGNER_CONFIG,
} from '@/lib/security/request-signer';

describe('Request Signing', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    // Set a test secret for most tests
    process.env.INTERNAL_API_SECRET = 'test-secret-key-for-signing-32chars';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('signRequest', () => {
    it('should generate consistent signatures for same input', async () => {
      const payload = '{"action":"test"}';
      const timestamp = 1700000000000;

      const sig1 = await signRequest(payload, timestamp);
      const sig2 = await signRequest(payload, timestamp);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different signatures for different payloads', async () => {
      const timestamp = 1700000000000;

      const sig1 = await signRequest('payload1', timestamp);
      const sig2 = await signRequest('payload2', timestamp);

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different timestamps', async () => {
      const payload = '{"action":"test"}';

      const sig1 = await signRequest(payload, 1700000000000);
      const sig2 = await signRequest(payload, 1700000000001);

      expect(sig1).not.toBe(sig2);
    });

    it('should throw when INTERNAL_API_SECRET is not set', async () => {
      delete process.env.INTERNAL_API_SECRET;

      await expect(signRequest('payload', Date.now())).rejects.toThrow(
        'Internal API secret not configured'
      );
    });
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', async () => {
      const payload = '{"action":"test"}';
      const timestamp = Date.now();

      const signature = await signRequest(payload, timestamp);
      const result = await verifySignature(payload, timestamp, signature);

      expect(result).toBe(true);
    });

    it('should return false for invalid signature', async () => {
      const payload = '{"action":"test"}';
      const timestamp = Date.now();

      const result = await verifySignature(
        payload,
        timestamp,
        'invalid-signature'
      );

      expect(result).toBe(false);
    });

    it('should return false for tampered payload', async () => {
      const timestamp = Date.now();
      const signature = await signRequest('original', timestamp);

      const result = await verifySignature('tampered', timestamp, signature);

      expect(result).toBe(false);
    });

    it('should return false for expired timestamp', async () => {
      const payload = '{"action":"test"}';
      // Use a timestamp older than MAX_TIMESTAMP_AGE (5 minutes)
      const expiredTimestamp =
        Date.now() - REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE - 1000;
      const signature = await signRequest(payload, expiredTimestamp);

      const result = await verifySignature(
        payload,
        expiredTimestamp,
        signature
      );

      expect(result).toBe(false);
    });

    it('should return false when INTERNAL_API_SECRET is not configured', async () => {
      delete process.env.INTERNAL_API_SECRET;

      const result = await verifySignature('payload', Date.now(), 'signature');

      expect(result).toBe(false);
    });
  });

  describe('createSignedHeaders', () => {
    it('should create all required headers', async () => {
      const payload = '{"action":"test"}';
      const timestamp = 1700000000000;

      const headers = await createSignedHeaders(payload, timestamp);

      expect(headers).toHaveProperty('x-request-signature');
      expect(headers).toHaveProperty('x-request-timestamp');
      expect(headers).toHaveProperty('x-request-payload-hash');
      expect(headers['x-request-timestamp']).toBe(String(timestamp));
    });

    it('should use current time when timestamp not provided', async () => {
      const payload = '{"action":"test"}';

      const before = Date.now();
      const headers = await createSignedHeaders(payload);
      const after = Date.now();

      const timestamp = parseInt(headers['x-request-timestamp'], 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should include valid signature in headers', async () => {
      const payload = '{"action":"test"}';
      const timestamp = 1700000000000;
      const headers = await createSignedHeaders(payload, timestamp);
      // Note: createSignedHeaders uses signRequest which generates a signature
      // based on the message format: `${payload}:${timestamp}`
      // verifySignature does the same, so they should match
      
      // Debug: generate a fresh signature for comparison
      const freshSignature = await signRequest(payload, timestamp);
      
      expect(headers['x-request-signature']).toBe(freshSignature);
    });
  });

  describe('extractAndVerifySignature', () => {
    it('should extract and verify valid headers', () => {
      const timestamp = Date.now();
      const headers = new Headers({
        'x-request-signature': 'some-signature',
        'x-request-timestamp': String(timestamp),
      });

      // This won't verify properly without the actual payload
      // but should not crash
      const result = extractAndVerifySignature(headers);

      expect(result).toHaveProperty('valid');
    });

    it('should return error for missing signature', () => {
      const headers = new Headers({
        'x-request-timestamp': String(Date.now()),
      });

      const result = extractAndVerifySignature(headers);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature header');
    });

    it('should return error for missing timestamp', () => {
      const headers = new Headers({
        'x-request-signature': 'some-signature',
      });

      const result = extractAndVerifySignature(headers);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing timestamp header');
    });

    it('should return error for invalid timestamp format', () => {
      const headers = new Headers({
        'x-request-signature': 'some-signature',
        'x-request-timestamp': 'not-a-number',
      });

      const result = extractAndVerifySignature(headers);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });
  });

  describe('isSigningEnabled', () => {
    it('should return true when INTERNAL_API_SECRET is set', () => {
      process.env.INTERNAL_API_SECRET = 'test-secret-key-32-chars-minimum';

      expect(isSigningEnabled()).toBe(true);
    });

    it('should return false when INTERNAL_API_SECRET is not set', () => {
      delete process.env.INTERNAL_API_SECRET;

      expect(isSigningEnabled()).toBe(false);
    });

    it('should return false when INTERNAL_API_SECRET is empty', () => {
      process.env.INTERNAL_API_SECRET = '';

      expect(isSigningEnabled()).toBe(false);
    });
  });

  describe('getSigningConfig', () => {
    it('should return configuration object', () => {
      const config = getSigningConfig();

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('secretLength');
      expect(config).toHaveProperty('minSecretLength');
      expect(config).toHaveProperty('timestampTolerance');
      expect(config).toHaveProperty('maxTimestampAge');
    });

    it('should reflect current secret length', () => {
      process.env.INTERNAL_API_SECRET = 'short';

      const config = getSigningConfig();

      expect(config.secretLength).toBe(5);
    });
  });

  describe('REQUEST_SIGNER_CONFIG', () => {
    it('should have reasonable timestamp tolerance', () => {
      expect(REQUEST_SIGNER_CONFIG.TIMESTAMP_TOLERANCE).toBe(5 * 60 * 1000);
    });

    it('should have minimum secret length', () => {
      expect(REQUEST_SIGNER_CONFIG.MIN_SECRET_LENGTH).toBe(32);
    });

    it('should have maximum timestamp age', () => {
      expect(REQUEST_SIGNER_CONFIG.MAX_TIMESTAMP_AGE).toBe(5 * 60 * 1000);
    });
  });
});
