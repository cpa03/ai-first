import { redactPIIInObject } from '../src/lib/pii-redaction';

describe('PII Redaction Performance', () => {
  const largeObject = {
    id: 'user_123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    status: 'active',
    priority: 'high',
    estimate_hours: 10,
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zip: '12345',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      }
    },
    credentials: {
      apiKey: 'sk-1234567890abcdef1234567890abcdef',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      password: 'secret_password_123'
    },
    metadata: {
      ip_address: '192.168.1.1',
      public_ip: '203.0.113.1',
      tags: ['tag1', 'tag2', 'tag3'],
      history: Array.from({ length: 20 }, (_, i) => ({
        event: `event_${i}`,
        timestamp: new Date().toISOString(),
        details: `Detail information for event ${i} that contains no PII but is somewhat long.`
      }))
    }
  };

  it('measures redaction performance for a large object', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      redactPIIInObject(largeObject);
    }
    const end = performance.now();
    const duration = end - start;
    console.log(`Redacted large object ${iterations} times in ${duration.toFixed(2)}ms`);
    console.log(`Average time per redaction: ${(duration / iterations).toFixed(4)}ms`);
  });
});
