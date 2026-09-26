import { EnvLoader } from '@/lib/config/env-loader';
import { BASE_URL } from '../config/test-config';

/**
 * Regression tests for #680 — rate limiting fingerprint fallback bypass.
 *
 * The hardening (PR #3822 + commit 3773e325) added:
 *  - trusted-proxy/platform header precedence (CF-Connecting-IP,
 *    x-vercel-forwarded-for, x-forwarded-for, x-real-ip, ...) before the
 *    client-controlled request fingerprint is ever used, and
 *  - the `RATE_LIMIT_REJECT_UNTRUSTED` switch that removes the fingerprint
 *    fallback entirely for deployments that always sit behind a proxy.
 *
 * `RATE_LIMIT_VALUES.REJECT_UNTRUSTED` is resolved once at module load time,
 * so each scenario below reloads the module with the env var set (or unset).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEFAULT-VALUE RECOMMENDATION (documented, deliberately NOT changed here):
 *
 *   Keep RATE_LIMIT_REJECT_UNTRUSTED default = false (fail-open).
 *
 *   Rationale:
 *   1. Flipping the default would immediately reject every request that lacks
 *      platform/proxy headers in deployments that do not terminate TLS at a
 *      proxy (bare `next start`, self-hosted, local dev, integration tests) —
 *      a hard availability regression in exchange for a hardening flag.
 *   2. Node/edge runtimes do not populate CF-Connecting-IP or
 *      x-vercel-forwarded-for unless the request actually came through that
 *      edge, so the flag cannot distinguish "spoofed" from "no proxy".
 *   3. The mitigation is one environment variable, and the fail-open
 *      behaviour is already loud (a production console.warn is emitted on
 *      every fingerprint fallback).
 *
 *   Recommended operational posture: set RATE_LIMIT_REJECT_UNTRUSTED=true for
 *   every production deployment that terminates requests at Cloudflare,
 *   Vercel, or any reverse proxy. The characterization test below pins the
 *   current default so that flipping it later is an intentional, reviewable
 *   change rather than an accidental one.
 * ─────────────────────────────────────────────────────────────────────────────
 */
type RateLimitModule = typeof import('@/lib/rate-limit');

const REJECT_ENV_KEY = 'RATE_LIMIT_REJECT_UNTRUSTED';

function loadRateLimitWithRejectUntrusted(
  value: string | undefined
): RateLimitModule {
  const previous = process.env[REJECT_ENV_KEY];
  try {
    if (value === undefined) {
      delete process.env[REJECT_ENV_KEY];
    } else {
      process.env[REJECT_ENV_KEY] = value;
    }
    jest.resetModules();
    return require('@/lib/rate-limit') as RateLimitModule;
  } finally {
    if (previous === undefined) {
      delete process.env[REJECT_ENV_KEY];
    } else {
      process.env[REJECT_ENV_KEY] = previous;
    }
  }
}

function loadRejectUntrustedValue(value: string | undefined): boolean {
  const previous = process.env[REJECT_ENV_KEY];
  try {
    if (value === undefined) {
      delete process.env[REJECT_ENV_KEY];
    } else {
      process.env[REJECT_ENV_KEY] = value;
    }
    jest.resetModules();
    const config = require('@/lib/config/rate-limit-values') as {
      RATE_LIMIT_VALUES: { REJECT_UNTRUSTED: boolean };
    };
    return config.RATE_LIMIT_VALUES.REJECT_UNTRUSTED;
  } finally {
    if (previous === undefined) {
      delete process.env[REJECT_ENV_KEY];
    } else {
      process.env[REJECT_ENV_KEY] = previous;
    }
  }
}

describe('RATE_LIMIT_REJECT_UNTRUSTED configuration (#680)', () => {
  describe('env parsing', () => {
    it('defaults to false when the env var is unset (fail-open)', () => {
      expect(loadRejectUntrustedValue(undefined)).toBe(false);
    });

    it.each(['true', '1', 'yes', 'on'])('treats %s as enabled', (value) => {
      expect(loadRejectUntrustedValue(value)).toBe(true);
    });

    it.each(['false', '0', 'no', 'off'])('treats %s as disabled', (value) => {
      expect(loadRejectUntrustedValue(value)).toBe(false);
    });

    it('falls back to the default and warns on unrecognized values', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(loadRejectUntrustedValue('maybe')).toBe(false);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_REJECT_UNTRUSTED')
      );
      warn.mockRestore();
    });

    it('EnvLoader.boolean honours the documented default', () => {
      const previous = process.env[REJECT_ENV_KEY];
      delete process.env[REJECT_ENV_KEY];
      try {
        expect(EnvLoader.boolean(REJECT_ENV_KEY, false)).toBe(false);
        expect(EnvLoader.boolean(REJECT_ENV_KEY, true)).toBe(true);
      } finally {
        if (previous === undefined) {
          delete process.env[REJECT_ENV_KEY];
        } else {
          process.env[REJECT_ENV_KEY] = previous;
        }
      }
    });
  });
});

describe('getClientIdentifier trusted-header behaviour (#680)', () => {
  const platformEnvKeys = [
    'VERCEL',
    'NEXT_PUBLIC_VERCEL_URL',
    'CLOUDFLARE',
    'CF_WORKER',
    'CF_PAGES',
  ];
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of platformEnvKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of platformEnvKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
    jest.restoreAllMocks();
  });

  describe('when disabled (default)', () => {
    it('falls back to a request fingerprint instead of throwing', () => {
      const rl = loadRateLimitWithRejectUntrusted(undefined);
      const request = new Request(BASE_URL, {
        headers: { 'user-agent': 'agent-680' },
      });

      const identifier = rl.getClientIdentifier(request);
      expect(identifier).toMatch(/^fp:/);
    });

    it('does not reject when explicitly set to false', () => {
      const rl = loadRateLimitWithRejectUntrusted('false');
      const request = new Request(BASE_URL, {
        headers: { 'user-agent': 'agent-680' },
      });

      expect(rl.getClientIdentifier(request)).toMatch(/^fp:/);
    });

    it('documents the residual header-rotation bypass that motivates enabling it in production', () => {
      const rl = loadRateLimitWithRejectUntrusted(undefined);

      const first = rl.getClientIdentifier(
        new Request(BASE_URL, { headers: { 'user-agent': 'agent-A' } })
      );
      const second = rl.getClientIdentifier(
        new Request(BASE_URL, { headers: { 'user-agent': 'agent-B' } })
      );

      // Client-controlled headers produce a fresh identity — the exact bypass
      // described in #680. Deployments behind a proxy must enable
      // RATE_LIMIT_REJECT_UNTRUSTED (or rely on proxy headers below).
      expect(first).toMatch(/^fp:/);
      expect(second).toMatch(/^fp:/);
      expect(first).not.toBe(second);
    });
  });

  describe('when enabled', () => {
    it('rejects requests that carry no trusted header', () => {
      const rl = loadRateLimitWithRejectUntrusted('true');
      const request = new Request(BASE_URL, {
        headers: { 'user-agent': 'attacker' },
      });

      expect(() => rl.getClientIdentifier(request)).toThrow(
        /trusted platform headers/i
      );
    });

    it('mentions the env var so operators can disable it outside production', () => {
      const rl = loadRateLimitWithRejectUntrusted('1');
      const request = new Request(BASE_URL);

      expect(() => rl.getClientIdentifier(request)).toThrow(
        /RATE_LIMIT_REJECT_UNTRUSTED/
      );
    });

    it('still accepts the standard reverse-proxy headers', () => {
      const rl = loadRateLimitWithRejectUntrusted('true');

      expect(
        rl.getClientIdentifier(
          new Request(BASE_URL, {
            headers: { 'x-forwarded-for': '203.0.113.7' },
          })
        )
      ).toBe('proxy:203.0.113.7');

      expect(
        rl.getClientIdentifier(
          new Request(BASE_URL, { headers: { 'x-real-ip': '203.0.113.8' } })
        )
      ).toBe('proxy:203.0.113.8');
    });

    it('still accepts the Cloudflare platform header', () => {
      process.env.CLOUDFLARE = '1';
      const rl = loadRateLimitWithRejectUntrusted('on');

      expect(
        rl.getClientIdentifier(
          new Request(BASE_URL, {
            headers: { 'cf-connecting-ip': '198.51.100.4' },
          })
        )
      ).toBe('cf:198.51.100.4');
    });

    it('still accepts the Vercel platform header', () => {
      process.env.VERCEL = '1';
      const rl = loadRateLimitWithRejectUntrusted('yes');

      expect(
        rl.getClientIdentifier(
          new Request(BASE_URL, {
            headers: { 'x-vercel-forwarded-for': '198.51.100.5' },
          })
        )
      ).toBe('vercel:198.51.100.5');
    });
  });

  describe('trusted proxy neutralises header rotation', () => {
    it('keeps the identifier stable when user-agent/accept-language rotate', () => {
      const rl = loadRateLimitWithRejectUntrusted(undefined);

      const first = rl.getClientIdentifier(
        new Request(BASE_URL, {
          headers: {
            'x-forwarded-for': '192.0.2.10',
            'user-agent': 'agent-A',
            'accept-language': 'en-US',
          },
        })
      );
      const second = rl.getClientIdentifier(
        new Request(BASE_URL, {
          headers: {
            'x-forwarded-for': '192.0.2.10',
            'user-agent': 'agent-B',
            'accept-language': 'fr-FR',
          },
        })
      );

      expect(first).toBe('proxy:192.0.2.10');
      expect(second).toBe(first);
    });
  });
});
