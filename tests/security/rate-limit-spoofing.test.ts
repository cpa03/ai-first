import {
  getUserRateLimitInfo,
  checkUserRateLimit,
  rateLimitConfigs,
} from '@/lib/rate-limit';
import { BASE_URL } from '../config/test-config';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';

// Mock ENV_ACCESSORS to simulate production
jest.mock('@/lib/config/env-keys', () => {
  const actual = jest.requireActual('@/lib/config/env-keys');
  return {
    ...actual,
    ENV_ACCESSORS: {
      ...actual.ENV_ACCESSORS,
      PLATFORM: {
        ...actual.ENV_ACCESSORS.PLATFORM,
        NODE_ENV: jest.fn().mockReturnValue('production'),
      },
      SECURITY: {
        ...actual.ENV_ACCESSORS.SECURITY,
        INTERNAL_API_SECRET: jest.fn().mockReturnValue('secret-123'),
      },
    },
  };
});

describe('Rate Limit Header Spoofing (Security)', () => {
  const productionConfig = rateLimitConfigs.strict; // 10 requests

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('FIXED: should ignore spoofed user ID via x-supabase-user-id in production', () => {
    // Simulated production environment (via mock)
    (ENV_ACCESSORS.PLATFORM.NODE_ENV as jest.Mock).mockReturnValue(
      'production'
    );

    const request = new Request(BASE_URL, {
      headers: {
        'x-supabase-user-id': 'spoofed-user-id',
      },
    });

    const userInfo = getUserRateLimitInfo(request);

    // In production, an untrusted client should NOT be able to set their own user ID via this header
    expect(userInfo.userId).toBeNull();
    expect(userInfo.identifier).not.toBe('user:spoofed-user-id');
  });

  it('FIXED: should ignore spoofed user tier via x-user-tier in production', () => {
    // Simulated production environment
    (ENV_ACCESSORS.PLATFORM.NODE_ENV as jest.Mock).mockReturnValue(
      'production'
    );

    const request = new Request(BASE_URL, {
      headers: {
        'x-supabase-user-id': 'any-user',
        'x-user-tier': 'enterprise',
      },
    });

    const userInfo = getUserRateLimitInfo(request);

    // In production, an untrusted client should NOT be able to elevate their tier via this header
    expect(userInfo.role).toBe('anonymous');

    const result = checkUserRateLimit(request, productionConfig);
    // Standard limit (strict) is 10. Anonymous limit is 30.
    // effectiveConfig = Math.max(strict.limit=10, anonymous.limit=30) = 30.
    expect(result.info.limit).toBe(30);
  });

  it('PROTECTION: should allow internal headers if valid secret is provided', () => {
    // This test ensures that legitimate internal traffic (e.g. from a proxy) can still use these headers
    // once we implement the fix.
    (ENV_ACCESSORS.PLATFORM.NODE_ENV as jest.Mock).mockReturnValue(
      'production'
    );
    (ENV_ACCESSORS.SECURITY.INTERNAL_API_SECRET as jest.Mock).mockReturnValue(
      'secret-123'
    );

    const request = new Request(BASE_URL, {
      headers: {
        'x-supabase-user-id': 'trusted-user',
        'x-user-tier': 'premium',
        'x-internal-secret': 'secret-123',
      },
    });

    const userInfo = getUserRateLimitInfo(request);

    // This will initially pass because headers are always accepted currently.
    // After the fix, it should STILL pass because the secret is provided.
    expect(userInfo.userId).toBe('trusted-user');
    expect(userInfo.role).toBe('premium');
  });
});
