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

const logger = createLogger('SuspiciousPatterns');

/**
 * Categories of suspicious patterns
 */
export type SuspiciousPatternCategory =
  | 'sql_injection'
  | 'xss'
  | 'path_traversal'
  | 'command_injection'
  | 'ssrf'
  | 'header_injection'
  | 'encoding_attack'
  | 'nosql_injection'
  | 'prototype_pollution'
  | 'log_injection';








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

/**
 * Suspicious pattern definitions
 * Organized by category with severity levels
 *
 * Severity levels:
 * 1 = Low (could be false positive)
 * 2 = Medium (likely malicious intent)
 * 3 = High (clearly malicious)
 */
const SUSPICIOUS_PATTERNS: Record<
  SuspiciousPatternCategory,
  Array<{ pattern: RegExp; severity: 1 | 2 | 3; description: string }>
> = {
  sql_injection: [
    // High severity - clear SQL injection attempts
    {
      pattern:
        /(\b(union|select|insert|update|delete|drop|create|alter|truncate)\b.{1,100}\b(from|into|table|database|set|where)\b)/is,
      severity: 3,
      description: 'SQL keyword combination',
    },
    {
      pattern: /(--\s*$|;\s*--|\/\*.{1,100}\*\/)/s,
      severity: 3,
      description: 'SQL comment injection',
    },
    {
      pattern: /(\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/is,
      severity: 3,
      description: 'SQL OR tautology',
    },
    {
      pattern: /(\band\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/is,
      severity: 2,
      description: 'SQL AND tautology',
    },
    // Medium severity
    {
      pattern: /('\s*(or|and)\s+')/is,
      severity: 2,
      description: 'SQL string injection',
    },
    {
      pattern: /(exec\s*\(|execute\s+)/is,
      severity: 2,
      description: 'SQL execution attempt',
    },
    {
      pattern: /(waitfor\s+delay|benchmark\s*\()/is,
      severity: 2,
      description: 'SQL time-based injection',
    },
    // Low severity - common in legitimate queries but worth monitoring
    {
      pattern: /(\b(select|union|insert|update|delete|drop)\b)/is,
      severity: 1,
      description: 'SQL keyword present',
    },
  ],

  xss: [
    // High severity - script injection
    {
      pattern: /<script[^>]*>[\s\S]*?<\/script>/gis,
      severity: 3,
      description: 'Script tag injection',
    },
    {
      pattern: /javascript\s*:/gi,
      severity: 3,
      description: 'JavaScript protocol',
    },
    {
      pattern: /on(load|error|click|mouse|focus|blur|key|submit|change)\s*=/gi,
      severity: 3,
      description: 'Event handler injection',
    },
    {
      pattern: /<iframe[^>]*>/gi,
      severity: 3,
      description: 'Iframe injection',
    },
    {
      pattern: /<object[^>]*>/gi,
      severity: 3,
      description: 'Object tag injection',
    },
    {
      pattern: /<embed[^>]*>/gi,
      severity: 3,
      description: 'Embed tag injection',
    },
    // Medium severity
    {
      pattern: /<img[^>]+onerror\s*=/gi,
      severity: 2,
      description: 'Image onerror injection',
    },
    {
      pattern: /<svg[^>]*onload\s*=/gi,
      severity: 2,
      description: 'SVG onload injection',
    },
    {
      pattern: /expression\s*\(/gi,
      severity: 2,
      description: 'CSS expression injection',
    },
    // Low severity - encoded patterns
    {
      pattern: /&#x?\d+;/gi,
      severity: 1,
      description: 'HTML entity encoding',
    },
  ],

  path_traversal: [
    // High severity
    {
      pattern: /(\.\.\/|\.\.\\){2,}/,
      severity: 3,
      description: 'Multiple path traversal sequences',
    },
    {
      pattern: /\/etc\/(passwd|shadow|hosts)/i,
      severity: 3,
      description: 'Sensitive file access attempt',
    },
    {
      pattern: /\/(proc|sys)\//i,
      severity: 3,
      description: 'System file access attempt',
    },
    // Medium severity
    {
      pattern: /\.\.[\/\\]/,
      severity: 2,
      description: 'Path traversal sequence',
    },
    {
      pattern: /%2e%2e[%\/\\]/i,
      severity: 2,
      description: 'URL-encoded path traversal',
    },
    {
      pattern: /\.\.%2f/i,
      severity: 2,
      description: 'Mixed encoding path traversal',
    },
  ],

  command_injection: [
    // High severity
    {
      pattern: /[;&|`]\s*(rm|del|format|fdisk|shutdown|reboot|halt|init)/i,
      severity: 3,
      description: 'Destructive command injection',
    },
    {
      pattern: /\$\([^)]+\)/,
      severity: 3,
      description: 'Command substitution',
    },
    {
      pattern: /`[^`]+`/,
      severity: 3,
      description: 'Backtick command execution',
    },
    // Medium severity
    {
      pattern: /[;&|`]\s*(cat|ls|dir|type|more|less|head|tail)\s/i,
      severity: 2,
      description: 'File reading command',
    },
    {
      pattern: /[;&|`]\s*(wget|curl|fetch|lynx|links)\s/i,
      severity: 2,
      description: 'Download command',
    },
    {
      pattern: /\|\s*(bash|sh|cmd|powershell|python|perl|ruby|php)/i,
      severity: 2,
      description: 'Shell pipe injection',
    },
    // Low severity
    {
      pattern: /[;&|`]/,
      severity: 1,
      description: 'Shell metacharacter present',
    },
  ],

  ssrf: [
    // High severity
    {
      pattern: /(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
      severity: 2,
      description: 'Localhost SSRF attempt',
    },
    {
      pattern: /(169\.254\.169\.254|metadata\.google)/i,
      severity: 3,
      description: 'Cloud metadata access attempt',
    },
    {
      pattern: /internal\.(service|api|host)/i,
      severity: 2,
      description: 'Internal service access attempt',
    },
    // Medium severity
    {
      pattern: /file:\/\//i,
      severity: 2,
      description: 'File protocol SSRF',
    },
    {
      pattern: /gopher:\/\//i,
      severity: 2,
      description: 'Gopher protocol SSRF',
    },
    {
      pattern: /dict:\/\//i,
      severity: 2,
      description: 'Dict protocol SSRF',
    },
    // Low severity - private IP ranges
    {
      pattern: /(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/,
      severity: 1,
      description: 'Private IP address',
    },
  ],

  header_injection: [
    // High severity
    {
      pattern: /[\r\n]\s*(content-type|content-length|location|set-cookie):/i,
      severity: 3,
      description: 'HTTP response splitting',
    },
    {
      pattern: /[\r\n]\s*\r\n/,
      severity: 3,
      description: 'Header terminator injection',
    },
    // Medium severity
    {
      pattern: /[\r\n]/,
      severity: 2,
      description: 'CRLF sequence',
    },
    {
      pattern: /%0[dDaAeE]/,
      severity: 2,
      description: 'URL-encoded CRLF',
    },
  ],

  encoding_attack: [
    // High severity - double encoding attacks
    {
      pattern: /%25[0-9a-fA-F]{2}/,
      severity: 2,
      description: 'Double URL encoding',
    },
    {
      pattern: /%u[0-9a-fA-F]{4}/,
      severity: 2,
      description: 'Unicode encoding',
    },
    {
      pattern: /\\x[0-9a-fA-F]{2}/,
      severity: 2,
      description: 'Hex encoding',
    },
    // Medium severity - unusual encoding
    {
      pattern: /&#x?[0-9a-fA-F]+;/,
      severity: 1,
      description: 'HTML numeric entity',
    },
  ],

  // NoSQL Injection patterns (MongoDB, Redis, etc.)
  nosql_injection: [
    // High severity - NoSQL operator injection
    {
      pattern: /\$where\s*:/i,
      severity: 3,
      description: 'MongoDB $where injection',
    },
    {
      pattern: /\$(gt|gte|lt|lte|ne|eq|in|nin|exists|type|mod|regex|text|all|elemMatch|size)\s*:/i,
      severity: 2,
      description: 'MongoDB operator injection',
    },
    {
      pattern: /\$javascript/i,
      severity: 3,
      description: 'MongoDB JavaScript injection',
    },
    // Medium severity
    {
      pattern: /{\s*\$.*?:/i,
      severity: 2,
      description: 'NoSQL query operator pattern',
    },
    {
      pattern: /\$or\s*:\s*\[/i,
      severity: 2,
      description: 'MongoDB $or array injection',
    },
    // Low severity
    {
      pattern: /ObjectId\s*\(/i,
      severity: 1,
      description: 'MongoDB ObjectId reference',
    },
  ],

  // Prototype Pollution patterns
  prototype_pollution: [
    // High severity - direct prototype manipulation
    {
      pattern: /__proto__\s*[\[.]/i,
      severity: 3,
      description: 'Prototype pollution via __proto__',
    },
    {
      pattern: /constructor\s*[\[.]\s*prototype/i,
      severity: 3,
      description: 'Prototype pollution via constructor',
    },
    {
      pattern: /prototype\s*[\[.]\s*\w+\s*=/i,
      severity: 3,
      description: 'Direct prototype modification',
    },
    // Medium severity
    {
      pattern: /Object\s*\.\s*assign\s*\(\s*\w+\s*,/i,
      severity: 2,
      description: 'Object.assign potential pollution',
    },
    {
      pattern: /Object\s*\.\s*defineProperty/i,
      severity: 2,
      description: 'Object.defineProperty usage',
    },
    // Low severity
    {
      pattern: /\[\s*['"]__proto__['"]\s*\]/i,
      severity: 2,
      description: 'Bracket notation __proto__ access',
    },
  ],

  // Log Injection patterns (Log4j-style attacks)
  log_injection: [
    // High severity - JNDI/LDAP injection (Log4j style)
    {
      pattern: /\$\{\s*(jndi|ldap|dns|rmi)\s*:/gi,
      severity: 3,
      description: 'JNDI/LDAP injection attempt',
    },
    {
      pattern: /\$\{\s*(lower|upper)\s*:/gi,
      severity: 2,
      description: 'Log4j variable manipulation',
    },
    // Medium severity
    {
      pattern: /\$\{[^}]+\}/,
      severity: 2,
      description: 'Variable interpolation pattern',
    },
    {
      pattern: /%(\d+\$)?[sdif]/,
      severity: 1,
      description: 'Format string pattern',
    },
    // Low severity
    {
      pattern: /\n\s*(ERROR|WARN|INFO|DEBUG|FATAL)\s*[:\[]/i,
      severity: 2,
      description: 'Log level injection',
    },
  ],
};

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
    PATTERNS_BY_MIN_SEVERITY[severity] = allPatterns.filter(
      (p) => p.severity >= severity
    );
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
]);

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
  if (!input) return [];

  const findings: SuspiciousPatternDetail[] = [];
  const patterns = PATTERNS_BY_MIN_SEVERITY[minSeverity] || [];

  // PERFORMANCE: Use simple for loop over pre-filtered array for maximum speed
  for (let i = 0; i < patterns.length; i++) {
    const { category, pattern, severity, description } = patterns[i];
    if (pattern.test(input)) {
      findings.push({
        category,
        pattern: description,
        location,
        field,
        severity,
      });

      // PERFORMANCE: Only reset lastIndex for global regexes to avoid unnecessary property access
      if (pattern.global) {
        pattern.lastIndex = 0;
      }
    }
  }

  return findings;
}

/**
 * Detect suspicious patterns in an HTTP request
 *
 * @param request - The HTTP request to analyze
 * @param options - Detection options
 * @returns Detection result with details
 */
export function detectSuspiciousPatterns(
  request: Request,
  options: {
    /** Scan request body (default: false for performance) */
    scanBody?: boolean;
    /** Minimum severity to report (default: 2) */
    minSeverity?: 0 | 1 | 2 | 3;
    /** Log detected patterns (default: true) */
    logDetected?: boolean;
    /** Pre-parsed URL object (optional, for performance optimization) */
    parsedUrl?: URL;
  } = {}
): SuspiciousPatternResult {
  const {
    scanBody = false,
    minSeverity = 2,
    logDetected = true,
    parsedUrl: providedUrl,
  } = options;

  const patterns: SuspiciousPatternDetail[] = [];
  // Safety check: Handle undefined/invalid URL gracefully
  let parsedUrl: URL | null = providedUrl || null;
  if (!parsedUrl) {
    try {
      if (request.url) {
        parsedUrl = new URL(request.url);
      }
    } catch {
      // Invalid URL - continue without path/query scanning
    }
  }

  if (parsedUrl) {
    // Scan request path
    const pathFindings = scanString(parsedUrl.pathname, 'path', minSeverity);
    patterns.push(...pathFindings);

    // Scan query parameters
    for (const [key, value] of parsedUrl.searchParams.entries()) {
      const queryFindings = scanString(value, 'query', minSeverity, key);
      patterns.push(...queryFindings);
    }
  }

  // NOTE: Body scanning is currently not implemented to avoid consuming the stream
  // which can only be read once in many environments (like Cloudflare Workers).
  if (scanBody) {
    logger.warn('Body scanning requested but not yet implemented');
  }














  // Scan headers safely - handle cases where headers.entries() might not exist (test mocks)
  try {
    if (typeof request.headers.entries === 'function') {
      for (const [key, value] of request.headers.entries()) {
        if (!SKIP_HEADERS.has(key.toLowerCase())) {
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

    SecurityAuditLog.logEvent({
      timestamp: new Date().toISOString(),
      category: 'input_validation',
      severity:
        maxSeverity === 3 ? 'critical' : maxSeverity === 2 ? 'high' : 'medium',
      message: `Suspicious request patterns detected: ${categories}`,
      clientIdentifier,
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
        path: parsedUrl?.pathname || 'unknown',
      },
      environment: process.env.NODE_ENV || 'unknown',
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
export function hasSuspiciousPatterns(
  request: Request,
  minSeverity: 0 | 1 | 2 | 3 = 2
): boolean {
  return detectSuspiciousPatterns(request, {
    minSeverity,
    scanBody: false,
    logDetected: true,
  }).detected;
}

/**
 * Get pattern definitions for documentation/testing
 */
export function getPatternDefinitions(): typeof SUSPICIOUS_PATTERNS {
  return { ...SUSPICIOUS_PATTERNS };
}
