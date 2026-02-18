import { EnvLoader } from './environment';

export const SECURITY_CONFIG = {
  AUTH: {
    CREDENTIALS_MAX_LENGTH: EnvLoader.number(
      'SECURITY_AUTH_CREDENTIALS_MAX_LENGTH',
      512,
      128,
      2048
    ),
    SCHEME_BEARER: 'bearer',
    SCHEME_BASIC: 'basic',
  },

  HASH_ALGORITHM: EnvLoader.string('SECURITY_HASH_ALGORITHM', 'SHA-256'),

  PII: {
    MAX_REDACTION_DEPTH: EnvLoader.number(
      'SECURITY_PII_MAX_REDACTION_DEPTH',
      100,
      10,
      1000
    ),

    LABEL_CACHE_MAX_SIZE: EnvLoader.number(
      'SECURITY_PII_LABEL_CACHE_MAX_SIZE',
      1000,
      100,
      10000
    ),

    REDACTION_LABELS: {
      JWT: '[REDACTED_TOKEN]',
      URL_WITH_CREDENTIALS: '[REDACTED_URL]',
      EMAIL: '[REDACTED_EMAIL]',
      PHONE: '[REDACTED_PHONE]',
      SSN: '[REDACTED_SSN]',
      CREDIT_CARD: '[REDACTED_CARD]',
      IP_ADDRESS: '[REDACTED_IP]',
      API_KEY: '[REDACTED_API_KEY]',
      PASSPORT: '[REDACTED_PASSPORT]',
      DRIVERS_LICENSE: '[REDACTED_LICENSE]',
    },

    PRIVATE_IP_RANGES: {
      LOOPBACK: ['127'] as string[],
      PRIVATE_CLASS_A: ['10'] as string[],
      PRIVATE_CLASS_B: ['172'] as string[],
      PRIVATE_CLASS_C: ['192', '168'] as string[],
    },

    API_KEY_PREFIXES: [
      'api[-_ ]?key',
      'apikey',
      'secret',
      'token',
      'credential',
      'auth',
      'authorization',
      'admin[-_ ]?key',
      'adminkey',
      'password',
      'passphrase',
      'bearer',
      'access[-_ ]?key',
    ],

    SAFE_FIELDS: [
      'id',
      'created_at',
      'updated_at',
      'status',
      'priority',
      'estimate_hours',
    ],
  },

  CSP: {
    DIRECTIVES: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'nonce-placeholder'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'data:'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
      'connect-src': ["'self'", 'https://*.supabase.co'],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"],
    },

    PERMISSIONS_POLICY: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'browsing-topics=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ],
  },

  HSTS: {
    MAX_AGE: EnvLoader.number('SECURITY_HSTS_MAX_AGE', 31536000, 0, 63072000),
    INCLUDE_SUBDOMAINS: EnvLoader.boolean(
      'SECURITY_HSTS_INCLUDE_SUBDOMAINS',
      true
    ),
    PRELOAD: EnvLoader.boolean('SECURITY_HSTS_PRELOAD', true),
  },

  RATE_LIMIT: {
    MAX_STORE_SIZE: EnvLoader.number(
      'SECURITY_RATE_LIMIT_MAX_STORE_SIZE',
      10000,
      100,
      100000
    ),

    CLEANUP_INTERVAL_MS: EnvLoader.number(
      'SECURITY_RATE_LIMIT_CLEANUP_INTERVAL',
      60000,
      5000,
      300000
    ),

    CLEANUP_WINDOW_MS: EnvLoader.number(
      'SECURITY_RATE_LIMIT_CLEANUP_WINDOW',
      60000,
      1000,
      3600000
    ),

    ENDPOINT_PRESETS: {
      STRICT: EnvLoader.number('SECURITY_RATE_LIMIT_STRICT', 10, 1, 100),
      MODERATE: EnvLoader.number('SECURITY_RATE_LIMIT_MODERATE', 30, 5, 200),
      LENIENT: EnvLoader.number('SECURITY_RATE_LIMIT_LENIENT', 60, 10, 500),
    },

    USER_TIER: {
      ANONYMOUS: EnvLoader.number('SECURITY_RATE_LIMIT_ANONYMOUS', 30, 5, 200),
      AUTHENTICATED: EnvLoader.number(
        'SECURITY_RATE_LIMIT_AUTHENTICATED',
        60,
        10,
        500
      ),
      PREMIUM: EnvLoader.number('SECURITY_RATE_LIMIT_PREMIUM', 120, 20, 1000),
      ENTERPRISE: EnvLoader.number(
        'SECURITY_RATE_LIMIT_ENTERPRISE',
        300,
        50,
        2000
      ),
    },
  },
} as const;

export type SecurityConfig = typeof SECURITY_CONFIG;
