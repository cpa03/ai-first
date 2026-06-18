import { redactPIIInObject } from '../src/lib/pii-redaction';
import {
  TEST_API_KEY_OPENAI,
  TEST_JWT_TOKEN,
  TEST_PASSWORD_SIMPLE,
} from './utils/test-secrets';

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
          lng: -74.006,
        },
      },
    },
    credentials: {
      apiKey: TEST_API_KEY_OPENAI,
      token: TEST_JWT_TOKEN,
      password: TEST_PASSWORD_SIMPLE,
    },
    metadata: {
      ip_address: '192.168.1.1',
      public_ip: '203.0.113.1',
      tags: ['tag1', 'tag2', 'tag3'],
      history: Array.from({ length: 20 }, (_, i) => ({
        event: `event_${i}`,
        timestamp: new Date().toISOString(),
        details: `Detail information for event ${i} that contains no PII but is somewhat long.`,
      })),
    },
  };

  const cleanObject = {
    id: 'task_1',
    status: 'pending',
    tags: ['development', 'feature'],
    config: {
      retries: 3,
      enabled: true,
      mode: 'production'
    },
    items: [
      { id: 'item_1', name: 'Setup' },
      { id: 'item_2', name: 'Code' },
      { id: 'item_3', name: 'Test' }
    ]
  };

  it('measures redaction performance for a large object with PII', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      redactPIIInObject(largeObject);
    }
    const end = performance.now();
    const duration = end - start;
    console.log(
      `Redacted large object with PII ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per redaction (with PII): ${(duration / iterations).toFixed(4)}ms`
    );
  });

  it('measures redaction performance for a clean object without PII', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      redactPIIInObject(cleanObject);
    }
    const end = performance.now();
    const duration = end - start;
    console.log(
      `Processed clean object ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per processing (clean): ${(duration / iterations).toFixed(4)}ms`
    );
  });
});
