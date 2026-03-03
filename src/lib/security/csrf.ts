import { APP_CONFIG } from '@/lib/config/app';
import { SecurityAuditLog } from '@/lib/security/audit-log';

export const CSRF_CONFIG = {
  STATE_CHANGING_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH'] as const,

  get TRUSTED_ORIGINS(): string[] {
    const origins: string[] = [APP_CONFIG.URLS.BASE];

    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      origins.push(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`);
    }
    if (process.env.VERCEL_LIVE_URL) {
      origins.push(`https://${process.env.VERCEL_LIVE_URL}`);
    }

    if (process.env.CF_PAGES_URL) {
      origins.push(`https://${process.env.CF_PAGES_URL}`);
    }
    if (process.env.CF_PAGES_BRANCH_URL) {
      origins.push(`https://${process.env.CF_PAGES_BRANCH_URL}`);
    }

    if (process.env.NODE_ENV === 'development') {
      origins.push('http://localhost:3000', 'http://localhost:3001');
    }

    return [...new Set(origins)];
  },

  ENABLED: process.env.NODE_ENV !== 'test',
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

function getOriginFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin.toLowerCase();
  } catch {
    return null;
  }
}

function isTrustedOrigin(origin: string, trustedOrigins: string[]): boolean {
  const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');

  for (const trusted of trustedOrigins) {
    const normalizedTrusted = trusted.toLowerCase().replace(/\/$/, '');

    if (normalizedOrigin === normalizedTrusted) {
      return true;
    }

  }

  return false;
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

  if (!origin) {
    const requestUrl = request.url;
    const requestOrigin = getOriginFromUrl(requestUrl);

    if (requestOrigin && isTrustedOrigin(requestOrigin, trustedOrigins)) {
      return { valid: true, origin: requestOrigin };
    }

    SecurityAuditLog.logEvent({
      timestamp: new Date().toISOString(),
      category: 'configuration',
      severity: 'low',
      message:
        'Request without origin header allowed (potential server-to-server)',
      metadata: {
        method,
        url: requestUrl,
      },
      environment: process.env.NODE_ENV || 'unknown',
    });

    return { valid: true };
  }

  if (isTrustedOrigin(origin, trustedOrigins)) {
    return { valid: true, origin };
  }

  const requestId = request.headers.get('x-request-id');

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
