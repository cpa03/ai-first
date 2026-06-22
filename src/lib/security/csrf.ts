import { APP_CONFIG } from '@/lib/config/app';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';
import { SecurityAuditLog } from '@/lib/security/audit-log';

/**
 * PERFORMANCE: Lazy-initialized trusted origins to avoid expensive array creation
 * on every access while ensuring compatibility with Edge/Workers initialization.
 */
let memoizedOriginsArray: string[] | null = null;
let memoizedOriginsSet: Set<string> | null = null;

function getOriginsConfig() {
  if (!memoizedOriginsArray || !memoizedOriginsSet) {
    const origins: string[] = [APP_CONFIG.URLS.BASE];

    const vercelUrl = ENV_ACCESSORS.PLATFORM.VERCEL_URL();
    if (vercelUrl) {
      origins.push(`https://${vercelUrl}`);
    }
    const nextPublicVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    if (nextPublicVercelUrl) {
      origins.push(`https://${nextPublicVercelUrl}`);
    }
    const vercelLiveUrl = ENV_ACCESSORS.PLATFORM.VERCEL_LIVE_URL();
    if (vercelLiveUrl) {
      origins.push(`https://${vercelLiveUrl}`);
    }

    const cfPagesUrl = ENV_ACCESSORS.PLATFORM.CF_PAGES_URL();
    if (cfPagesUrl) {
      origins.push(`https://${cfPagesUrl}`);
    }
    const cfPagesBranchUrl = ENV_ACCESSORS.PLATFORM.CF_PAGES_BRANCH_URL();
    if (cfPagesBranchUrl) {
      origins.push(`https://${cfPagesBranchUrl}`);
    }

    if (ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development') {
      origins.push(
        APP_CONFIG.DEVELOPMENT.LOCALHOST_PRIMARY,
        APP_CONFIG.DEVELOPMENT.LOCALHOST_ALT
      );
    }

    memoizedOriginsArray = [...new Set(origins)];
    memoizedOriginsSet = new Set(
      memoizedOriginsArray.map((t) => t.toLowerCase().replace(/\/$/, ''))
    );
  }
  return { array: memoizedOriginsArray, set: memoizedOriginsSet };
}

export const CSRF_CONFIG = {
  STATE_CHANGING_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH'] as const,

  get TRUSTED_ORIGINS(): string[] {
    return getOriginsConfig().array;
  },

  ENABLED: ENV_ACCESSORS.PLATFORM.NODE_ENV() !== 'test',
} as const;

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  origin?: string;
}

function extractOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (origin) {
    return origin.toLowerCase();
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.origin.toLowerCase();
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Checks if the origin is in the trusted origins set.
 * PERFORMANCE: Uses O(1) Set lookup with pre-normalized trusted origins.
 */
function isTrustedOrigin(origin: string, trustedOrigins?: string[]): boolean {
  const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
  const config = getOriginsConfig();

  // If custom trusted origins are provided, use the O(N) fallback loop.
  // This is rare and typically only happens in tests.
  if (trustedOrigins && trustedOrigins !== config.array) {
    for (const trusted of trustedOrigins) {
      const normalizedTrusted = trusted.toLowerCase().replace(/\/$/, '');
      if (normalizedOrigin === normalizedTrusted) {
        return true;
      }
    }
    return false;
  }

  return config.set.has(normalizedOrigin);
}

export function validateCSRF(
  request: Request,
  options?: {
    trustedOrigins?: string[];
    bypass?: boolean;
    stateChangingMethods?: readonly string[];
  }
): CSRFValidationResult {
  if (!CSRF_CONFIG.ENABLED || options?.bypass) {
    return { valid: true };
  }

  const trustedOrigins = options?.trustedOrigins ?? CSRF_CONFIG.TRUSTED_ORIGINS;
  const stateChangingMethods: readonly string[] =
    options?.stateChangingMethods ?? CSRF_CONFIG.STATE_CHANGING_METHODS;

  const method = request.method.toUpperCase();

  if (!stateChangingMethods.includes(method)) {
    return { valid: true };
  }

  const origin = extractOrigin(request);
  const requestId = request.headers.get('x-request-id');

  if (!origin) {
    // Allow requests without Origin/Referer if they have an Authorization or API Key header
    // These are typical for server-to-server or CLI-based API requests and are
    // inherently protected against CSRF as they aren't automatically sent by browsers.
    const hasAuthHeader =
      request.headers.has('authorization') || request.headers.has('x-api-key');

    if (hasAuthHeader) {
      return { valid: true };
    }

    SecurityAuditLog.logEvent({
      timestamp: new Date().toISOString(),
      category: 'authentication',
      severity: 'high',
      message: 'CSRF validation failed: missing origin/referer headers',
      requestId: requestId || undefined,
      metadata: {
        method,
        url: request.url,
      },
      environment: process.env.NODE_ENV || 'unknown',
    });

    return {
      valid: false,
      error: 'Missing Origin or Referer header.',
    };
  }

  if (isTrustedOrigin(origin, trustedOrigins)) {
    return { valid: true, origin };
  }

  SecurityAuditLog.logEvent({
    timestamp: new Date().toISOString(),
    category: 'authentication',
    severity: 'high',
    message: 'CSRF validation failed: untrusted origin',
    requestId: requestId || undefined,
    metadata: {
      method,
      origin,
      trustedOrigins: trustedOrigins.length,
      url: request.url,
    },
    environment: process.env.NODE_ENV || 'unknown',
  });

  return {
    valid: false,
    error: 'Invalid origin header. Cross-origin requests are not allowed.',
    origin,
  };
}

export function requireCSRF(request: Request): void {
  const result = validateCSRF(request);

  if (!result.valid) {
    const error = new Error(result.error || 'CSRF validation failed');
    (error as Error & { code: string }).code = 'CSRF_ERROR';
    throw error;
  }
}

const csrfModule = {
  validateCSRF,
  requireCSRF,
  CSRF_CONFIG,
};

export default csrfModule;
