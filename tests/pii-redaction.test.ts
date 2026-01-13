/**
 * Comprehensive PII Redaction Tests
 *
 * Tests security-critical functionality for redacting personally identifiable information
 * from agent logs and user data.
 */

import {
  redactPII,
  redactPIIInObject,
  sanitizeAgentLog,
  containsPII,
} from '@/lib/pii-redaction';

describe('PII Redaction Utility', () => {
  describe('redactPII', () => {
    it('should redact email addresses', () => {
      const input = 'Contact john.doe@example.com for more info';
      const output = redactPII(input);

      expect(output).toBe('Contact [REDACTED_EMAIL] for more info');
      expect(output).not.toContain('john.doe@example.com');
    });

    it('should redact multiple email addresses', () => {
      const input = 'Email support@example.com or sales@example.com';
      const output = redactPII(input);

      expect(output).toBe('Email [REDACTED_EMAIL] or [REDACTED_EMAIL]');
    });

    it('should redact phone numbers with various formats', () => {
      const inputs = [
        'Call 123-456-7890',
        'Phone: (123) 456-7890',
        '5551234567',
        '1-800-555-0199',
      ];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).toContain('[REDACTED_PHONE]');
      });
    });

    it('should redact Social Security Numbers', () => {
      const input = 'SSN: 123-45-6789';
      const output = redactPII(input);

      expect(output).toBe('SSN: [REDACTED_SSN]');
      expect(output).not.toContain('123-45-6789');
    });

    it('should redact credit card numbers', () => {
      const inputs = [
        'Card: 4111-1111-1111-1111',
        'Pay with 4111111111111111',
        'Credit: 5500 0000 0000 0004',
      ];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).toContain('[REDACTED_CARD]');
        expect(output).not.toMatch(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/);
      });
    });

    it('should preserve private IP addresses', () => {
      const privateIPs = ['10.0.0.1', '192.168.1.1', '172.16.0.1', '127.0.0.1'];

      privateIPs.forEach((ip) => {
        const output = redactPII(`Server at ${ip}`);
        expect(output).toContain(ip);
        expect(output).not.toContain('[REDACTED_IP]');
      });
    });

    it('should redact public IP addresses', () => {
      const publicIPs = ['8.8.8.8', '1.1.1.1', '203.0.113.42'];

      publicIPs.forEach((ip) => {
        const output = redactPII(`Connect to ${ip}`);
        expect(output).toContain('[REDACTED_IP]');
        expect(output).not.toContain(ip);
      });
    });

    it('should redact API keys with long values', () => {
      const inputs = [
        'api_key=abc123xyz789verylongkey',
        'secret: sk_live_1234567890abcdef',
        'token=pk_test_12345678901234567890abcdef',
      ];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).toContain('[REDACTED_API_KEY]');
      });
    });

    it('should redact JWT tokens', () => {
      const input =
        'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const output = redactPII(input);

      expect(output).toContain('[REDACTED_TOKEN]');
      expect(output).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should redact URLs with credentials', () => {
      const inputs = [
        'https://user:password@api.example.com',
        'ftp://admin:secret123@files.example.com',
      ];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).toContain('[REDACTED_URL]');
        expect(output).not.toMatch(/:[^@\s]+@/);
      });
    });

    it('should handle multiple PII types in one string', () => {
      const input =
        'Contact john@example.com or call 123-456-7890. SSN: 123-45-6789';
      const output = redactPII(input);

      expect(output).toContain('[REDACTED_EMAIL]');
      expect(output).toContain('[REDACTED_PHONE]');
      expect(output).toContain('[REDACTED_SSN]');
      expect(output).not.toContain('john@example.com');
      expect(output).not.toContain('123-456-7890');
      expect(output).not.toContain('123-45-6789');
    });

    it('should handle empty strings', () => {
      expect(redactPII('')).toBe('');
    });

    it('should handle strings without PII', () => {
      const input = 'This is a safe message with no personal information';
      const output = redactPII(input);

      expect(output).toBe(input);
    });
  });

  describe('redactPIIInObject', () => {
    it('should redact PII in string values', () => {
      const input = { email: 'test@example.com', name: 'John Doe' };
      const output = redactPIIInObject(input) as Record<string, unknown>;

      expect(output.email).toBe('[REDACTED_EMAIL]');
      expect(output.name).toBe('John Doe');
    });

    it('should recursively redact PII in nested objects', () => {
      const input = {
        user: {
          contact: 'john@example.com',
          phone: '123-456-7890',
          details: {
            ssn: '123-45-6789',
            address: '123 Main St',
          },
        },
      };

      const output = redactPIIInObject(input) as {
        user: {
          contact: unknown;
          phone: unknown;
          details: { ssn: unknown; address: unknown };
        };
      };

      expect(output.user.contact).toBe('[REDACTED_EMAIL]');
      expect(output.user.phone).toBe('[REDACTED_PHONE]');
      expect(output.user.details.ssn).toBe('[REDACTED_SSN]');
      expect(output.user.details.address).toBe('123 Main St');
    });

    it('should redact PII in arrays', () => {
      const input = ['test@example.com', 'safe text', '123-456-7890'];
      const output = redactPIIInObject(input) as unknown[];

      expect(output).toEqual([
        '[REDACTED_EMAIL]',
        'safe text',
        '[REDACTED_PHONE]',
      ]);
    });

    it('should redact PII in object arrays', () => {
      const input = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
      ];

      const output = redactPIIInObject(input) as Array<{
        id: number;
        email: unknown;
      }>;

      expect(output[0].email).toBe('[REDACTED_EMAIL]');
      expect(output[1].email).toBe('[REDACTED_EMAIL]');
      expect(output[0].id).toBe(1);
      expect(output[1].id).toBe(2);
    });

    it('should preserve safe field names (case-insensitive)', () => {
      const input = {
        id: '123',
        CREATED_AT: '2024-01-01',
        Status: 'active',
        Priority: 1,
        estimate_hours: 8,
        email: 'test@example.com',
      };

      const output = redactPIIInObject(input) as Record<string, unknown>;

      expect(output.id).toBe('123');
      expect(output.CREATED_AT).toBe('2024-01-01');
      expect(output.Status).toBe('active');
      expect(output.Priority).toBe(1);
      expect(output.estimate_hours).toBe(8);
      expect(output.email).toBe('[REDACTED_EMAIL]');
    });

    it('should handle null and undefined values', () => {
      const input = {
        email: 'test@example.com',
        nullValue: null,
        undefinedValue: undefined,
        numberValue: 42,
        booleanValue: true,
      };

      const output = redactPIIInObject(input) as Record<string, unknown>;

      expect(output.email).toBe('[REDACTED_EMAIL]');
      expect(output.nullValue).toBeNull();
      expect(output.undefinedValue).toBeUndefined();
      expect(output.numberValue).toBe(42);
      expect(output.booleanValue).toBe(true);
    });

    it('should handle deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                email: 'deep@example.com',
                safe: 'data',
              },
            },
          },
        },
      };

      const output = redactPIIInObject(input) as {
        level1: {
          level2: {
            level3: {
              level4: { email: unknown; safe: unknown };
            };
          };
        };
      };

      expect(output.level1.level2.level3.level4.email).toBe('[REDACTED_EMAIL]');
      expect(output.level1.level2.level3.level4.safe).toBe('data');
    });

    it('should handle mixed content (objects and arrays)', () => {
      const input = {
        contacts: [
          { type: 'email', value: 'user1@example.com' },
          { type: 'phone', value: '123-456-7890' },
        ],
        metadata: {
          api_key: 'very_long_api_key_string_here_12345',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      const output = redactPIIInObject(input) as {
        contacts: Array<{ type: string; value: unknown }>;
        metadata: { api_key: unknown; timestamp: unknown };
      };

      expect(output.contacts[0].value).toBe('[REDACTED_EMAIL]');
      expect(output.contacts[1].value).toBe('[REDACTED_PHONE]');
      expect(output.metadata.api_key).toBe('[REDACTED_API_KEY]');
      expect(output.metadata.timestamp).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('sanitizeAgentLog', () => {
    it('should sanitize agent log payload', () => {
      const log = sanitizeAgentLog('clarifier', 'start-clarification', {
        ideaId: 'idea-123',
        email: 'user@example.com',
        apiKey: 'very_long_api_key_string_here',
      });

      expect(log.agent).toBe('clarifier');
      expect(log.action).toBe('start-clarification');
      const payload = log.payload as Record<string, unknown>;
      expect(payload).toHaveProperty('ideaId');
      expect(payload.email).toBe('[REDACTED_EMAIL]');
      expect(payload.apiKey).toBe('very_long_api_key_string_here');
      expect(log.timestamp).toBeDefined();
    });

    it('should handle nested payload objects', () => {
      const log = sanitizeAgentLog('ai-service', 'model-call', {
        messages: [
          { role: 'user', content: 'Email: test@example.com' },
          { role: 'assistant', content: 'Response' },
        ],
        metadata: {
          ssn: '123-45-6789',
          safeField: 'data',
        },
      });

      const payload = log.payload as {
        messages: Array<{ content: unknown }>;
        metadata: { ssn: unknown; safeField: unknown };
      };
      expect(payload.messages[0].content).toContain('[REDACTED_EMAIL]');
      expect(payload.metadata.ssn).toBe('[REDACTED_SSN]');
      expect(payload.metadata.safeField).toBe('data');
    });

    it('should handle empty payload', () => {
      const log = sanitizeAgentLog('test-agent', 'test-action', {});

      expect(log.agent).toBe('test-agent');
      expect(log.action).toBe('test-action');
      const payload = log.payload as Record<string, unknown>;
      expect(payload).toEqual({});
      expect(log.timestamp).toBeDefined();
    });

    it('should handle null and undefined payload values', () => {
      const log = sanitizeAgentLog('test-agent', 'test-action', {
        email: 'test@example.com',
        nullValue: null,
        undefinedValue: undefined,
      });

      const payload = log.payload as Record<string, unknown>;
      expect(payload.email).toBe('[REDACTED_EMAIL]');
      expect(payload.nullValue).toBeNull();
      expect(payload.undefinedValue).toBeUndefined();
    });
  });

  describe('containsPII', () => {
    it('should return true when email is present', () => {
      expect(containsPII('Contact user@example.com')).toBe(true);
    });

    it('should return true when phone number is present', () => {
      expect(containsPII('Call 123-456-7890')).toBe(true);
    });

    it('should return true when SSN is present', () => {
      expect(containsPII('SSN: 123-45-6789')).toBe(true);
    });

    it('should return true when credit card is present', () => {
      expect(containsPII('Card: 4111111111111111')).toBe(true);
    });

    it('should return true when public IP is present', () => {
      expect(containsPII('Server: 8.8.8.8')).toBe(true);
    });

    it('should return true when API key is present', () => {
      expect(containsPII('api_key=verylongsecretkeyhere')).toBe(true);
    });

    it('should return true when JWT is present', () => {
      expect(containsPII('Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe(
        true
      );
    });

    it('should return true when URL with credentials is present', () => {
      expect(containsPII('https://user:password@api.example.com')).toBe(true);
    });

    it('should return false when no PII is present', () => {
      expect(containsPII('This is safe text with no PII')).toBe(false);
    });

    it('should return false for private IP addresses', () => {
      expect(containsPII('Server at 192.168.1.1')).toBe(false);
      expect(containsPII('Server at 10.0.0.1')).toBe(false);
      expect(containsPII('Server at 127.0.0.1')).toBe(false);
    });

    it('should return true for mixed content with PII', () => {
      expect(containsPII('Safe text with user@example.com mixed in')).toBe(
        true
      );
    });

    it('should handle empty strings', () => {
      expect(containsPII('')).toBe(false);
    });

    it('should detect multiple types of PII', () => {
      const text = 'Email: test@example.com and phone: 123-456-7890';
      expect(containsPII(text)).toBe(true);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very long strings', () => {
      const longString =
        'a'.repeat(100000) + ' test@example.com ' + 'a'.repeat(100000);
      const output = redactPII(longString);

      expect(output).toContain('[REDACTED_EMAIL]');
      expect(output.length).toBeLessThan(longString.length + 1000);
    });

    it('should handle special characters around PII', () => {
      const input = 'Email: <test@example.com>, (555)123-4567, [123-45-6789]';
      const output = redactPII(input);

      expect(output).toContain('[REDACTED_EMAIL]');
      expect(output).toContain('[REDACTED_PHONE]');
      expect(output).toContain('[REDACTED_SSN]');
    });

    it('should handle malformed PII patterns', () => {
      const inputs = [
        'test@@example.com',
        '123-456-789',
        '1-2-3-4-5',
        'not-a-ssn',
      ];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).not.toContain('[REDACTED_');
      });
    });

    it('should handle standard email formats', () => {
      const input = 'Email: test@example.com Phone: 123-456-7890';
      const output = redactPII(input);

      expect(output).toContain('[REDACTED_EMAIL]');
      expect(output).toContain('[REDACTED_PHONE]');
    });

    it('should handle US phone formats', () => {
      const inputs = ['+1-555-123-4567', '+15551234567', '1-555-123-4567'];

      inputs.forEach((input) => {
        const output = redactPII(input);
        expect(output).toContain('[REDACTED_PHONE]');
      });
    });

    it('should not redact similar-looking non-PII patterns', () => {
      const input = 'Email-like: test_at_example.com (underscore not @)';
      const output = redactPII(input);

      expect(output).not.toContain('[REDACTED_EMAIL]');
      expect(output).toBe(input);
    });

    it('should handle repeated PII patterns', () => {
      const input = 'user1@example.com and user2@example.com';
      const output = redactPII(input);

      const matches = output.match(/\[REDACTED_EMAIL\]/g);
      expect(matches).toHaveLength(2);
    });

    it('should handle objects with circular references (gracefully)', () => {
      const obj: any = { email: 'test@example.com' };
      obj.self = obj;

      expect(() => redactPIIInObject(obj)).not.toThrow();
      expect(obj.email).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large nested objects efficiently', () => {
      const largeObj = {
        data: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          email: `user${i}@example.com`,
          metadata: {
            phone: `123-456-${String(i).padStart(4, '0')}`,
            details: {
              ssn: `${i}${i}${i}-${i}${i}-${String(i).repeat(4)}`,
            },
          },
        })),
      };

      const startTime = Date.now();
      const output = redactPIIInObject(largeObj) as {
        data: Array<{ email: unknown }>;
      };
      const endTime = Date.now();

      expect(output.data[0].email).toBe('[REDACTED_EMAIL]');
      expect(output.data[99].email).toBe('[REDACTED_EMAIL]');
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle many concurrent redactions', () => {
      const inputs = Array.from(
        { length: 1000 },
        (_, i) => `Email ${i}: user${i}@example.com`
      );

      const startTime = Date.now();
      const outputs = inputs.map(redactPII);
      const endTime = Date.now();

      outputs.forEach((output, i) => {
        expect(output).toContain('[REDACTED_EMAIL]');
        expect(output).not.toContain(`user${i}@example.com`);
      });

      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
