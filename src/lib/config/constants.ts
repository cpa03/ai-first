// Re-export from domain-specific modules for backward compatibility
export { TIMEOUT_CONFIG, type TimeoutConfig } from './timeout-config';
export { RATE_LIMIT_CONFIG } from './rate-limit-config';
export { ANIMATION_CONFIG } from './animation';
export { CACHE_CONFIG } from './cache';
export { CSP_CONFIG, type CspConfig } from './csp-config';
export { PII_REDACTION_CONFIG } from './pii-redaction-config';
export {
  ERROR_CONFIG,
  REQUEST_ID_CONFIG,
  RATE_LIMIT_ERROR_CONFIG,
} from './error-config';
export { STATUS_CODES, HTTP_HEADERS, AUTH_CONFIG } from './http';
export {
  EXTERNAL_API_VERSIONS,
  type ExternalApiVersionInfo,
} from './external-api-versions';
export { USER_STORY_CONFIG } from './user-story-config';
export { PROXY_CONFIG } from './proxy-config';
export { HEALTH_CONFIG, MEMORY_CONFIG, MEMORY_UNITS } from './health';
export { IDEA_STATUS_CONFIG, type IdeaStatus } from './idea-status-config';
export {
  SESSION_TRACKING_CONFIG,
  type SessionTrackingConfig,
} from './session-tracking';

// Re-export from newly extracted domain-specific modules
export {
  RETRY_CONFIG,
  OPTIMISTIC_MUTATION_CONFIG,
  RETRY_DELAY_CONFIG,
  RETRY_VALUES,
} from './retry-config';

export {
  RATE_LIMIT_CLEANUP_CONFIG,
  RATE_LIMIT_STORE_CONFIG,
  RATE_LIMIT_STATS_CONFIG,
  RATE_LIMIT_VALUES,
} from './rate-limit-values';

export {
  VALIDATION_CONFIG,
  VALIDATION_LIMITS_CONFIG,
  AGENT_CONFIG,
  VALIDATION_LIMITS,
  CLARIFIER_VALUES,
  TASK_VALIDATION,
} from './validation-config';

export { AI_CONFIG, AI_SERVICE_LIMITS } from './ai-config';

export { SECURITY_CONFIG } from './security-config';
export { UI_CONFIG } from './ui-config';
export { RESILIENCE_CONFIG } from './resilience-config';
export { API_CACHE_CONFIG } from './api-cache-config';
export { PLATFORM_ENV_VARS } from './platform-env-vars';
export { SESSION_ANALYTICS_CONFIG } from './session-analytics-config';
