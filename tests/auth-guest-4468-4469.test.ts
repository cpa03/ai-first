/**
 * Regression tests for #4468 (predictable guest ID) + #4469 (unvalidated
 * guest header). Locks: crypto-random IDs, UUIDv4 + max-length validation,
 * 401 on malformed values.
 */
import {
  generateGuestSessionId,
  isValidGuestSessionId,
  normalizeGuestSessionId,
  GUEST_SESSION_ID_MAX_LENGTH,
} from '@/lib/auth/guest';
import { getUserIdOrGuest } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config/http';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function guestRequest(sessionId?: string): Request {
  const headers: Record<string, string> = { 'x-guest-mode': 'true' };
  if (sessionId !== undefined) headers['x-guest-session-id'] = sessionId;
  return new Request('http://localhost/api/ideas', { headers });
}

describe('#4468 guest IDs are unpredictable UUIDv4', () => {
  it('generates guest_<uuidv4> IDs', () => {
    const id = generateGuestSessionId();
    expect(id.startsWith('guest_')).toBe(true);
    expect(UUID_V4.test(id.slice('guest_'.length))).toBe(true);
  });

  it('generates unique IDs (no Date.now/Math.random collisions)', () => {
    const ids = new Set(
      Array.from({ length: 100 }, () => generateGuestSessionId())
    );
    expect(ids.size).toBe(100);
  });

  it('validates well-formed IDs and rejects junk', () => {
    const good = generateGuestSessionId();
    expect(isValidGuestSessionId(good)).toBe(true);
    expect(isValidGuestSessionId(good.slice('guest_'.length))).toBe(true);
    expect(normalizeGuestSessionId(good)).toBe(good.slice('guest_'.length));
    for (const bad of [
      '',
      'guest_',
      'guest_not-a-uuid',
      'guest_123',
      `guest_${'a'.repeat(200)}`,
      'x'.repeat(GUEST_SESSION_ID_MAX_LENGTH + 1),
      'guest_<script>alert(1)</script>',
      123,
      null,
      undefined,
    ]) {
      expect(isValidGuestSessionId(bad)).toBe(false);
      if (typeof bad === 'string') {
        expect(normalizeGuestSessionId(bad)).toBeNull();
      }
    }
  });
});

describe('#4469 guest header is validated (401 on malformed)', () => {
  it('accepts a valid guest session header', async () => {
    const bare = generateGuestSessionId().slice('guest_'.length);
    const res = await getUserIdOrGuest(guestRequest(`guest_${bare}`));
    expect(res).toEqual({ userId: `guest_${bare}`, isGuest: true });
  });

  it('rejects malformed / overlong / injection values with 401', async () => {
    // Note: header values containing CR/LF cannot even be constructed
    // (fetch/Headers rejects them), so they never reach the validator.
    for (const bad of [
      'not-a-uuid',
      'guest_../../admin',
      'guest_<script>',
      'a'.repeat(GUEST_SESSION_ID_MAX_LENGTH + 1),
    ]) {
      await expect(getUserIdOrGuest(guestRequest(bad))).rejects.toMatchObject(
        {
          statusCode: STATUS_CODES.UNAUTHORIZED,
        }
      );
    }
  });

  it('rejects missing credentials with 401', async () => {
    const req = new Request('http://localhost/api/ideas');
    await expect(getUserIdOrGuest(req)).rejects.toBeInstanceOf(AppError);
  });
});
