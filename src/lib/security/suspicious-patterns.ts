/**
 * Suspicious Request Pattern Detection
 *
 * Detects and logs potentially malicious patterns in incoming requests.
 * This provides security monitoring for common attack vectors including:
 * - SQL Injection
 * - Cross-Site Scripting (XSS)
 * - Path Traversal
 * - Command Injection
 * - Server-Side Request Forgery (SSRF)
 *
 * @module lib/security/suspicious-patterns
 *
 * @example
 * ```typescript
 * import { detectSuspiciousPatterns, hasSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
 *
 * // In API handler
 * const result = detectSuspiciousPatterns(request);
 * if (result.detected) {
 *   // Patterns are automatically logged via SecurityAuditLog
 *   // Consider additional rate limiting or blocking
 * }
 * ```
 */

import { createLogger } from '@/lib/logger';
import { SecurityAuditLog } from './audit-log';
import { getClientIdentifier } from '@/lib/rate-limit';
import { CACHE_CONFIG } from '@/lib/config/cache';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';
import { SUSPICIOUS_PATTERNS_CONFIG } from '@/lib/config/security-patterns';
import { SuspiciousPatternCategory } from '@/types/security';

// Re-export for backward compatibility
export type { SuspiciousPatternCategory } from '@/types/security';

const logger = createLogger('SuspiciousPatterns');

/**
 * Details about a detected suspicious pattern
 */
export interface SuspiciousPatternDetail {
  /** Category of the suspicious pattern */
  category: SuspiciousPatternCategory;
  /** Pattern that was matched */
  pattern: string;
  /** Location where pattern was found */
  location: 'header' | 'query' | 'body' | 'path';
  /** Field name where pattern was found (if applicable) */
  field?: string;
  /** Severity of the pattern (1-3, where 3 is most severe) */
  severity: 1 | 2 | 3;
}

/**
 * Result of suspicious pattern detection
 */
export interface SuspiciousPatternResult {
  /** Whether any suspicious patterns were detected */
  detected: boolean;
  /** Details of detected patterns */
  patterns: SuspiciousPatternDetail[];
  /** Overall severity (highest among detected patterns) */
  maxSeverity: 0 | 1 | 2 | 3;
}

const SUSPICIOUS_PATTERNS = SUSPICIOUS_PATTERNS_CONFIG;

/**
 * Internal interface for flattened patterns to avoid re-calculating on every request
 */
interface FlattenedPattern {
  category: SuspiciousPatternCategory;
  pattern: RegExp;
  severity: 1 | 2 | 3;
  description: string;
}

/**
 * PERFORMANCE: Pre-flattened and pre-filtered pattern lists by minimum severity.
 * This avoids iterating through the nested object structure and executing
 * irrelevant regexes during request scanning.
 */
const PATTERNS_BY_MIN_SEVERITY: Record<number, FlattenedPattern[]> = {
  0: [],
  1: [],
  2: [],
  3: [],
};

/**
 * PERFORMANCE: Combined trigger regex for each minimum severity level.
 * Used as a fast-path to skip individual pattern scanning for safe strings.
 */
const COMBINED_TRIGGERS_BY_MIN_SEVERITY: Record<number, RegExp | null> = {
  0: null,
  1: null,
  2: null,
  3: null,
};

// Initialize PATTERNS_BY_MIN_SEVERITY
(function initializePatternCache() {
  const allPatterns: FlattenedPattern[] = [];
  for (const [category, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
    for (const p of patterns) {
      allPatterns.push({
        category: category as SuspiciousPatternCategory,
        ...p,
      });
    }
  }

  for (let severity = 0; severity <= 3; severity++) {
    const filteredPatterns = allPatterns.filter((p) => p.severity >= severity);
    PATTERNS_BY_MIN_SEVERITY[severity] = filteredPatterns;

    if (filteredPatterns.length > 0) {
      try {
        // Build a combined regex by joining individual pattern sources.
        // PERFORMANCE: Using non-capturing groups (?:...) to avoid breaking
        // backreferences (\1, \2, etc.) in individual patterns.
        // FLAGS: Using 'ims' flags to ensure the combined regex is a safe
        // superset of all individual patterns (multiline, case-insensitive, dot-all).
        // PERFORMANCE: Replace backreferences (e.g. \1, \2) with .* in the combined
        // trigger source to avoid failing when group indices shift during concatenation.
        const combinedSource = filteredPatterns
          .map((p) => `(?:${p.pattern.source.replace(/\\\d+/g, '.*')})`)
          .join('|');
        COMBINED_TRIGGERS_BY_MIN_SEVERITY[severity] = new RegExp(
          combinedSource,
          'ims'
        );
      } catch (e) {
        // Fallback: if combining regex fails (e.g. named group collision),
        // we skip the fast-path for this severity level.
        logger.error(
          `Failed to build combined trigger regex for severity ${severity}:`,
          e
        );
        COMBINED_TRIGGERS_BY_MIN_SEVERITY[severity] = null;
      }
    }
  }
})();

/**
 * PERFORMANCE: Static set of headers to skip during scanning to avoid
 * repeated Set allocations on every request.
 */
const SKIP_HEADERS = new Set([
  'host',
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'connection',
  'content-type',
  'content-length',
  'cookie',
  'authorization',
  'x-api-key',
  'x-csrf-token',
]);

/**
 * Partial match data for caching to avoid storing redundant location/field metadata.
 */
type PatternMatch = {
  category: SuspiciousPatternCategory;
  pattern: string;
  severity: 1 | 2 | 3;
};

/**
 * Consolidates LRU cache eviction logic.
 */
function evictOldest(cache: Map<string, unknown>): void {
  if (cache.size >= CACHE_CONFIG.SECURITY.MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
}

/**
 * PERFORMANCE: Results cache for scanString to avoid redundant regex execution
 * on repeated values (e.g., common header values, repeat query params).
 * Uses a nested Map structure (minSeverity -> input -> matches) to avoid string concatenation.
 */
const SCAN_RESULT_CACHE = new Map<number, Map<string, PatternMatch[]>>([
  [0, new Map()],
  [1, new Map()],
  [2, new Map()],
  [3, new Map()],
]);
const EMPTY_FINDINGS: SuspiciousPatternDetail[] = [];

/**
 * Scan a string for suspicious patterns
 */
function scanString(
  input: string,
  location: SuspiciousPatternDetail['location'],
  minSeverity: number,
  field?: string
): SuspiciousPatternDetail[] {
  // PERFORMANCE: Early return for empty input
  if (!input) return EMPTY_FINDINGS;

  // PERFORMANCE: Check cache for small inputs to avoid repeated regex runs.
  const isCacheable =
    input.length < CACHE_CONFIG.SECURITY.INPUT_LENGTH_THRESHOLD;
  const severityCache = isCacheable
    ? SCAN_RESULT_CACHE.get(minSeverity)
    : undefined;

  if (severityCache) {
    const cached = severityCache.get(input);
    if (cached) {
      if (cached.length === 0) return EMPTY_FINDINGS;

      // Reconstruct full detail objects with current location and field
      return cached.map((match) => ({
        ...match,
        location,
        field,
      }));
    }
  }

  // PERFORMANCE: Fast-path check using combined trigger regex.
  // If the combined regex doesn't match, we know no individual patterns will match.
  const triggerRegex = COMBINED_TRIGGERS_BY_MIN_SEVERITY[minSeverity];
  if (triggerRegex && !triggerRegex.test(input)) {
    // Cache the negative result before returning
    if (severityCache) {
      evictOldest(severityCache);
      severityCache.set(input, []);
    }
    return EMPTY_FINDINGS;
  }

  const matches: PatternMatch[] = [];
  const patterns = PATTERNS_BY_MIN_SEVERITY[minSeverity] || [];

  // PERFORMANCE: Use simple for loop over pre-filtered array for maximum speed
  for (let i = 0; i < patterns.length; i++) {
    const { category, pattern, severity, description } = patterns[i];
    if (pattern.test(input)) {
      matches.push({
        category,
        pattern: description,
        severity,
      });

      // PERFORMANCE: Only reset lastIndex for global regexes
      if (pattern.global) {
        pattern.lastIndex = 0;
      }
    }
  }

  // Cache results if cacheable
  if (severityCache) {
    evictOldest(severityCache);
    severityCache.set(input, matches);
  }

  if (matches.length === 0) return EMPTY_FINDINGS;

  return matches.map((match) => ({
    ...match,
    location,
    field,
  }));
}

/**
 * Extract all string values from a JSON object recursively
 * Used for scanning JSON body content
 */
function extractJsonValues(obj: unknown, values: string[] = []): string[] {
  if (typeof obj === 'string') {
    values.push(obj);
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      extractJsonValues(item, values);
    }
  } else if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      extractJsonValues(value, values);
    }
  }
  return values;
}

/**
 * Detect suspicious patterns in an HTTP request
 *
 * @param request - The HTTP request to analyze
 * @param options - Detection options
 * @returns Detection result with details
 */
export async function detectSuspiciousPatterns(
  request: Request,
  options: {
    /** Scan request body (default: false for performance) */
    scanBody?: boolean;
    /** Minimum severity to report (default: 2) */
    minSeverity?: 0 | 1 | 2 | 3;
    /** Log detected patterns (default: true) */
    logDetected?: boolean;
    /** Request ID for tracing */
    requestId?: string;
  } = {}
): Promise<SuspiciousPatternResult> {
  const {
    scanBody = false,
    minSeverity = 2,
    logDetected = true,
    requestId: optionRequestId,
  } = options;

  const patterns: SuspiciousPatternDetail[] = [];

  // PERFORMANCE: Use pre-parsed nextUrl if available (from NextRequest)
  // nextUrl is 15-20x faster than new URL(request.url)
  const nextUrl = (request as NextRequestExtension).nextUrl;
  let pathname = nextUrl?.pathname;
  let searchParams = nextUrl?.searchParams;

  // Fallback to manual parsing only if nextUrl is missing
  if (!pathname && request.url) {
    try {
      const url = new URL(request.url);
      pathname = url.pathname;
      searchParams = url.searchParams;
    } catch {
      // Invalid URL - continue without path/query scanning
    }
  }

  if (pathname) {
    const pathFindings = scanString(pathname, 'path', minSeverity);
    patterns.push(...pathFindings);
  }

  // Scan query parameters
  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      // Scan BOTH key and value for injection patterns to prevent bypass via bracket notation
      const keyFindings = scanString(key, 'query', minSeverity, key);
      patterns.push(...keyFindings);

      const valueFindings = scanString(value, 'query', minSeverity, key);
      patterns.push(...valueFindings);
    }
  }

  // Scan request body if enabled
  if (scanBody) {
    try {
      // SECURITY & ARCHITECTURE: Clone the request to avoid premature stream consumption
      // In Edge/Workers environments, request body can only be read once
      const clonedRequest = request.clone();
      const contentType = clonedRequest.headers.get('content-type') || '';
      let body = '';

      // Parse body based on content type
      if (contentType.includes('application/json')) {
        body = await clonedRequest.text();
        // Also parse and scan individual JSON values
        try {
          const parsed = JSON.parse(body);
          const jsonValues = extractJsonValues(parsed);
          for (const value of jsonValues) {
            if (typeof value === 'string') {
              const bodyFindings = scanString(value, 'body', minSeverity, 'json-value');
              patterns.push(...bodyFindings);
            }
          }
        } catch {
          // If JSON parsing fails, scan raw body
          const bodyFindings = scanString(body, 'body', minSeverity);
          patterns.push(...bodyFindings);
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        body = await clonedRequest.text();
        const params = new URLSearchParams(body);
        for (const [key, value] of params.entries()) {
          const keyFindings = scanString(key, 'body', minSeverity, key);
          patterns.push(...keyFindings);
          const valueFindings = scanString(value, 'body', minSeverity, key);
          patterns.push(...valueFindings);
        }
      } else if (contentType.includes('multipart/form-data')) {
        // For multipart, we can only scan the raw body
        body = await clonedRequest.text();
        const bodyFindings = scanString(body, 'body', minSeverity);
        patterns.push(...bodyFindings);
      } else {
        // Default: scan raw body for text types
        body = await clonedRequest.text();
        if (body) {
          const bodyFindings = scanString(body, 'body', minSeverity);
          patterns.push(...bodyFindings);
        }
      }
    } catch (error) {
      logger.warn('Body scanning failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Scan headers safely - handle cases where headers.entries() might not exist (test mocks)
  try {
    if (typeof request.headers.entries === 'function') {
      for (const [key, value] of request.headers.entries()) {
        // PERFORMANCE: Check SKIP_HEADERS first with the raw key before allocating and computing
        // key.toLowerCase() for lowercase/standard keys. This avoids millions of string allocations
        // and garbage collection overhead under high request volumes.
        if (!SKIP_HEADERS.has(key) && !SKIP_HEADERS.has(key.toLowerCase())) {
          // Scan BOTH key and value for injection patterns
          const keyFindings = scanString(key, 'header', minSeverity, key);
          patterns.push(...keyFindings);

          const headerFindings = scanString(value, 'header', minSeverity, key);
          patterns.push(...headerFindings);
        }
      }
    }
  } catch {
    // Headers iteration failed - continue without header scanning
  }

  // PERFORMANCE: patterns are already pre-filtered by scanString.
  // We only need to calculate maxSeverity from the findings.

  // Calculate max severity
  let maxSeverity: 0 | 1 | 2 | 3 = 0;
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].severity > maxSeverity) {
      maxSeverity = patterns[i].severity as 0 | 1 | 2 | 3;
    }
  }

  const result: SuspiciousPatternResult = {
    detected: patterns.length > 0,
    patterns,
    maxSeverity,
  };

  // Log detected patterns via SecurityAuditLog
  if (result.detected && logDetected) {
    const clientIdentifier = getClientIdentifier(request);
    const categories = [...new Set(patterns.map((p) => p.category))].join(', ');
    const requestId =
      optionRequestId || request.headers.get('x-request-id') || undefined;

    SecurityAuditLog.logEvent({
      timestamp: new Date().toISOString(),
      category: 'input_validation',
      severity:
        maxSeverity === 3 ? 'critical' : maxSeverity === 2 ? 'high' : 'medium',
      message: `Suspicious request patterns detected: ${categories}`,
      clientIdentifier,
      requestId,
      metadata: {
        patternCount: patterns.length,
        categories,
        maxSeverity,
        patterns: patterns.map((p) => ({
          category: p.category,
          location: p.location,
          field: p.field,
          severity: p.severity,
        })),
        path: pathname || 'unknown',
      },
      environment: ENV_ACCESSORS.PLATFORM.NODE_ENV() || 'unknown',
    });

    logger.debug('Suspicious patterns detected', {
      patternCount: patterns.length,
      maxSeverity,
      categories,
    });
  }

  return result;
}

/**
 * Quick check if request has suspicious patterns
 *
 * @param request - The HTTP request to check
 * @param minSeverity - Minimum severity to consider (default: 2)
 * @returns True if suspicious patterns detected
 */
export async function hasSuspiciousPatterns(
  request: Request,
  minSeverity: 0 | 1 | 2 | 3 = 2
): Promise<boolean> {
  const result = await detectSuspiciousPatterns(request, {
    minSeverity,
    scanBody: false,
    logDetected: true,
  });
  return result.detected;
}

/**
 * Get pattern definitions for documentation/testing
 */
export function getPatternDefinitions(): typeof SUSPICIOUS_PATTERNS {
  return { ...SUSPICIOUS_PATTERNS };
}

/**
 * Clear the scan result cache.
 * Useful for testing and memory management.
 */
export function clearScanCache(): void {
  for (const severityMap of SCAN_RESULT_CACHE.values()) {
    severityMap.clear();
  }
}
