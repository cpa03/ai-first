import { APP_CONFIG } from '@/lib/config/app';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

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
    const nextPublicVercelUrl = ENV_ACCESSORS.PLATFORM.NEXT_PUBLIC_VERCEL_URL();
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
    // Return a shallow copy to prevent external mutation of the internal list
    return [...getOriginsConfig().array];
  },

  ENABLED: ENV_ACCESSORS.PLATFORM.NODE_ENV() !== 'test',
} as const;

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  origin?: string;
}

/**
 * Checks if a string contains CRLF injection attempts or control characters.
 * Rejects: \r, \n, \x00-\x1F, \x7F (control characters), and whitespace.
 */
function containsMaliciousCharacters(input: string): boolean {
  return /[\r\n\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(input);
}

/**
 * Validates that an origin string is well-formed and safe.
 * Rejects CRLF injection, control characters, and malformed URLs.
 */
function sanitizeOrigin(origin: string): string | null {
  // Reject empty or whitespace-only strings
  if (!origin || origin.trim() === '') {
    return null;
  }

  // Reject CRLF injection and control characters
  if (containsMaliciousCharacters(origin)) {
    return null;
  }

  // Reject origins with spaces (potential header injection)
  if (/\s/.test(origin)) {
    return null;
  }

  // Try to parse as URL to validate structure
  try {
    const url = new URL(origin);
    // Only allow http/https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    // Return normalized origin (protocol + hostname + port)
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

function extractOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (origin) {
    return sanitizeOrigin(origin);
  }

  const referer = request.headers.get('referer');
  if (referer) {
    // Reject CRLF injection in referer
    if (containsMaliciousCharacters(referer)) {
      return null;
    }

    try {
      const refererUrl = new URL(referer);
      // Only allow http/https protocols
      if (refererUrl.protocol !== 'http:' && refererUrl.protocol !== 'https:') {
        return null;
      }
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

  // If custom trusted origins are provided, check if it's identical to our pre-configured array
  // to avoid O(N) lookup. Since TRUSTED_ORIGINS getter returns config.array, they are identical.
  if (trustedOrigins && trustedOrigins !== config.array) {
    for (let i = 0; i < trustedOrigins.length; i++) {
      const normalizedTrusted = trustedOrigins[i]
        .toLowerCase()
        .replace(/\/$/, '');
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

  const config = getOriginsConfig();
  const trustedOrigins = options?.trustedOrigins ?? config.array;
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
      message: API_ERROR_MESSAGES.CSRF.MISSING_HEADERS,
      requestId: requestId || undefined,
      metadata: {
        method,
        url: request.url,
      },
      environment: ENV_ACCESSORS.PLATFORM.NODE_ENV() || 'unknown',
    });

    return {
      valid: false,
      error: API_ERROR_MESSAGES.CSRF.MISSING_HEADERS_USER,
    };
  }

  if (isTrustedOrigin(origin, trustedOrigins)) {
    return { valid: true, origin };
  }

  SecurityAuditLog.logEvent({
    timestamp: new Date().toISOString(),
    category: 'authentication',
    severity: 'high',
    message: API_ERROR_MESSAGES.CSRF.UNTRUSTED_ORIGIN,
    requestId: requestId || undefined,
    metadata: {
      method,
      origin,
      trustedOrigins: trustedOrigins.length,
      url: request.url,
    },
    environment: ENV_ACCESSORS.PLATFORM.NODE_ENV() || 'unknown',
  });

  return {
    valid: false,
    error: API_ERROR_MESSAGES.CSRF.UNTRUSTED_ORIGIN_USER,
    origin,
  };
}

export function requireCSRF(request: Request): void {
  const result = validateCSRF(request);

  if (!result.valid) {
    const error = new Error(
      result.error || API_ERROR_MESSAGES.CSRF.VALIDATION_FAILED
    );
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
