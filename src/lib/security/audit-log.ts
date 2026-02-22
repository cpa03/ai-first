/**
 * Security Audit Event Logging
 *
 * Provides structured logging for security-relevant events to enable
 * security monitoring, incident response, and compliance auditing.
 *
 * @module lib/security/audit-log
 *
 * @example
 * ```typescript
 * import { SecurityAuditLog } from '@/lib/security/audit-log';
 *
 * // Log authentication attempt
 * SecurityAuditLog.logAuthAttempt({
 *   success: false,
 *   reason: 'invalid_credentials',
 *   endpoint: '/api/metrics',
 *   clientIdentifier: 'cf:192.168.1.1'
 * });
 * ```
 */

import { createLogger } from '@/lib/logger';
import { redactPII } from '@/lib/pii-redaction';

const logger = createLogger('SecurityAudit');

/**
 * Security event severity levels
 * Used to classify events for alerting and filtering
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Security event categories for classification
 */
export type SecurityEventCategory =
  | 'authentication'
  | 'authorization'
  | 'rate_limiting'
  | 'input_validation'
  | 'csp_violation'
  | 'environment'
  | 'configuration'
  | 'data_access';

/**
 * Base security event structure
 */
export interface SecurityEventBase {
  /** ISO timestamp of the event */
  timestamp: string;
  /** Event category for classification */
  category: SecurityEventCategory;
  /** Event severity level */
  severity: SecurityEventSeverity;
  /** Human-readable event description */
  message: string;
  /** Unique request ID for tracing */
  requestId?: string;
  /** Client identifier (IP or fingerprint) */
  clientIdentifier?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Additional event metadata */
  metadata?: Record<string, unknown>;
  /** Environment where event occurred */
  environment: string;
}

/**
 * Authentication event details
 */
export interface AuthEventDetails {
  /** Whether authentication succeeded */
  success: boolean;
  /** Reason for failure if applicable */
  reason?:
    | 'invalid_credentials'
    | 'missing_credentials'
    | 'expired_token'
    | 'invalid_token'
    | 'account_locked'
    | 'rate_limited'
    | 'other';
  /** Endpoint that required authentication */
  endpoint?: string;
  /** Authentication method used */
  method?: 'bearer_token' | 'api_key' | 'session' | 'oauth';
  /** Client identifier */
  clientIdentifier?: string;
  /** Request ID for tracing */
  requestId?: string;
  /** User ID if available */
  userId?: string;
}

/**
 * Rate limit event details
 */
export interface RateLimitEventDetails {
  /** Whether the request was blocked */
  blocked: boolean;
  /** Rate limit configuration that was hit */
  config: 'strict' | 'moderate' | 'lenient';
  /** Current request count */
  requestCount: number;
  /** Rate limit threshold */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Client identifier */
  clientIdentifier: string;
  /** Endpoint that was rate limited */
  endpoint?: string;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * CSP violation event details
 */
export interface CSPViolationEventDetails {
  /** Directive that was violated */
  violatedDirective: string;
  /** URL that caused the violation */
  blockedUri?: string;
  /** Source file if available */
  sourceFile?: string;
  /** Line number if available */
  lineNumber?: number;
  /** Column number if available */
  columnNumber?: number;
  /** Original policy */
  originalPolicy?: string;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Environment security event details
 */
export interface EnvironmentEventDetails {
  /** Type of environment issue */
  issueType:
    | 'missing_required_var'
    | 'invalid_public_prefix'
    | 'weak_key'
    | 'placeholder_value';
  /** Variable name involved (sanitized) */
  variableName?: string;
  /** Whether this is a critical issue */
  critical: boolean;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Input validation event details
 */
export interface InputValidationEventDetails {
  /** Whether validation passed */
  passed: boolean;
  /** Field that was validated */
  field: string;
  /** Validation rule that failed */
  rule?: string;
  /** Whether this might be an attack attempt */
  suspicious: boolean;
  /** Request ID for tracing */
  requestId?: string;
  /** Client identifier */
  clientIdentifier?: string;
}

/**
 * Determine severity based on event category and success/failure
 */
function determineAuthSeverity(
  success: boolean,
  reason?: string
): SecurityEventSeverity {
  if (success) return 'low';

  // Critical failures that might indicate attacks
  const criticalReasons = ['account_locked', 'rate_limited'];
  const highReasons = ['invalid_token', 'expired_token'];

  if (reason && criticalReasons.includes(reason)) return 'critical';
  if (reason && highReasons.includes(reason)) return 'high';
  return 'medium';
}

/**
 * Get current environment string
 */
function getEnvironment(): string {
  return process.env.NODE_ENV || 'unknown';
}

/**
 * Security Audit Log
 *
 * Provides methods for logging security-relevant events with consistent
 * structure and severity classification.
 */
export const SecurityAuditLog = {
  /**
   * Log an authentication event
   *
   * @param details - Authentication event details
   *
   * @example
   * ```typescript
   * SecurityAuditLog.logAuthAttempt({
   *   success: false,
   *   reason: 'invalid_credentials',
   *   endpoint: '/api/admin/users',
   *   clientIdentifier: 'cf:192.168.1.1',
   *   requestId: 'req_abc123'
   * });
   * ```
   */
  logAuthAttempt(details: AuthEventDetails): void {
    const severity = determineAuthSeverity(details.success, details.reason);
    const message = details.success
      ? 'Authentication successful'
      : `Authentication failed: ${details.reason || 'unknown'}`;

    const event: SecurityEventBase = {
      timestamp: new Date().toISOString(),
      category: 'authentication',
      severity,
      message,
      requestId: details.requestId,
      clientIdentifier: details.clientIdentifier,
      userId: details.userId,
      metadata: {
        success: details.success,
        reason: details.reason,
        endpoint: details.endpoint,
        method: details.method,
      },
      environment: getEnvironment(),
    };

    this.logEvent(event);
  },

  /**
   * Log a rate limiting event
   *
   * @param details - Rate limit event details
   *
   * @example
   * ```typescript
   * SecurityAuditLog.logRateLimit({
   *   blocked: true,
   *   config: 'strict',
   *   requestCount: 15,
   *   limit: 10,
   *   windowMs: 60000,
   *   clientIdentifier: 'cf:192.168.1.1',
   *   endpoint: '/api/admin'
   * });
   * ```
   */
  logRateLimit(details: RateLimitEventDetails): void {
    const severity: SecurityEventSeverity = details.blocked ? 'high' : 'medium';
    const message = details.blocked
      ? `Rate limit exceeded: ${details.requestCount}/${details.limit} requests`
      : `Rate limit approaching: ${details.requestCount}/${details.limit} requests`;

    const event: SecurityEventBase = {
      timestamp: new Date().toISOString(),
      category: 'rate_limiting',
      severity,
      message,
      requestId: details.requestId,
      clientIdentifier: details.clientIdentifier,
      metadata: {
        blocked: details.blocked,
        config: details.config,
        requestCount: details.requestCount,
        limit: details.limit,
        windowMs: details.windowMs,
        endpoint: details.endpoint,
      },
      environment: getEnvironment(),
    };

    this.logEvent(event);
  },

  /**
   * Log a CSP violation event
   *
   * @param details - CSP violation event details
   *
   * @example
   * ```typescript
   * SecurityAuditLog.logCSPViolation({
   *   violatedDirective: 'script-src',
   *   blockedUri: 'https://evil.com/malicious.js',
   *   sourceFile: 'https://example.com/page.js',
   *   lineNumber: 42
   * });
   * ```
   */
  logCSPViolation(details: CSPViolationEventDetails): void {
    // Determine severity based on the type of violation
    let severity: SecurityEventSeverity = 'medium';
    const lowerDirective = details.violatedDirective.toLowerCase();

    // Script violations are more severe as they might indicate XSS attempts
    if (lowerDirective.includes('script')) {
      severity = 'high';
    }

    // External sources are more concerning than self
    if (
      details.blockedUri &&
      !details.blockedUri.startsWith('/') &&
      !details.blockedUri.startsWith('inline')
    ) {
      severity = severity === 'high' ? 'critical' : 'high';
    }

    const message = `CSP violation: ${details.violatedDirective}${
      details.blockedUri ? ` blocked ${details.blockedUri}` : ''
    }`;

    const event: SecurityEventBase = {
      timestamp: new Date().toISOString(),
      category: 'csp_violation',
      severity,
      message,
      requestId: details.requestId,
      metadata: {
        violatedDirective: details.violatedDirective,
        blockedUri: details.blockedUri,
        sourceFile: details.sourceFile,
        lineNumber: details.lineNumber,
        columnNumber: details.columnNumber,
      },
      environment: getEnvironment(),
    };

    this.logEvent(event);
  },

  /**
   * Log an environment security event
   *
   * @param details - Environment event details
   *
   * @example
   * ```typescript
   * SecurityAuditLog.logEnvironmentEvent({
   *   issueType: 'missing_required_var',
   *   variableName: 'SUPABASE_URL',
   *   critical: true
   * });
   * ```
   */
  logEnvironmentEvent(details: EnvironmentEventDetails): void {
    const severity: SecurityEventSeverity = details.critical
      ? 'critical'
      : 'medium';
    const message = `Environment security issue: ${details.issueType}${
      details.variableName ? ` (${details.variableName})` : ''
    }`;

    const event: SecurityEventBase = {
      timestamp: new Date().toISOString(),
      category: 'environment',
      severity,
      message,
      requestId: details.requestId,
      metadata: {
        issueType: details.issueType,
        critical: details.critical,
      },
      environment: getEnvironment(),
    };

    this.logEvent(event);
  },

  /**
   * Log an input validation event
   *
   * @param details - Input validation event details
   *
   * @example
   * ```typescript
   * SecurityAuditLog.logInputValidation({
   *   passed: false,
   *   field: 'email',
   *   rule: 'format',
   *   suspicious: true,
   *   clientIdentifier: 'cf:192.168.1.1'
   * });
   * ```
   */
  logInputValidation(details: InputValidationEventDetails): void {
    const severity: SecurityEventSeverity = details.suspicious
      ? 'high'
      : details.passed
        ? 'low'
        : 'medium';

    const message = details.passed
      ? `Input validation passed for ${details.field}`
      : `Input validation failed for ${details.field}${
          details.rule ? `: ${details.rule}` : ''
        }`;

    const event: SecurityEventBase = {
      timestamp: new Date().toISOString(),
      category: 'input_validation',
      severity,
      message,
      requestId: details.requestId,
      clientIdentifier: details.clientIdentifier,
      metadata: {
        passed: details.passed,
        field: details.field,
        rule: details.rule,
        suspicious: details.suspicious,
      },
      environment: getEnvironment(),
    };

    this.logEvent(event);
  },

  /**
   * Log a generic security event
   *
   * @param event - Security event to log
   */
  logEvent(event: SecurityEventBase): void {
    // Sanitize any sensitive data in metadata
    if (event.metadata) {
      event.metadata = Object.fromEntries(
        Object.entries(event.metadata).map(([key, value]) => [
          key,
          typeof value === 'string' ? redactPII(value) : value,
        ])
      );
    }

    // Log to appropriate level based on severity
    const logContext = {
      requestId: event.requestId,
      userId: event.userId,
      metadata: event.metadata,
    };

    switch (event.severity) {
      case 'critical':
        logger.errorWithContext(
          `[SECURITY_AUDIT] ${event.message}`,
          logContext,
          { category: event.category, clientIdentifier: event.clientIdentifier }
        );
        break;
      case 'high':
        logger.warnWithContext(
          `[SECURITY_AUDIT] ${event.message}`,
          logContext,
          { category: event.category, clientIdentifier: event.clientIdentifier }
        );
        break;
      default:
        logger.infoWithContext(
          `[SECURITY_AUDIT] ${event.message}`,
          logContext,
          {
            category: event.category,
            severity: event.severity,
            clientIdentifier: event.clientIdentifier,
          }
        );
    }
  },

  /**
   * Create a summary of recent security events (for monitoring)
   * This can be called periodically to get security metrics
   */
  getEventSummary(): {
    categories: SecurityEventCategory[];
    severities: SecurityEventSeverity[];
  } {
    return {
      categories: [
        'authentication',
        'authorization',
        'rate_limiting',
        'input_validation',
        'csp_violation',
        'environment',
        'configuration',
        'data_access',
      ],
      severities: ['low', 'medium', 'high', 'critical'],
    };
  },
};

export default SecurityAuditLog;
