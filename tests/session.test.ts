import { trackSessionStart, resetSession, flush } from '../src/lib/session-analytics';

describe('Session ID Generation', () => {
  beforeEach(() => {
    resetSession();
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  });

  afterEach(() => {
    flush();
  });

  it('should generate a UUID-based session ID when crypto.randomUUID is available', () => {
    // In Jest/Node environment, crypto.randomUUID should be available
    trackSessionStart();

    const sessionId = sessionStorage.getItem('ideaflow_session_id');
    expect(sessionId).toBeDefined();
    expect(sessionId).toMatch(/^session_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should persist the same session ID within a session', () => {
    trackSessionStart();
    const firstId = sessionStorage.getItem('ideaflow_session_id');

    trackSessionStart();
    const secondId = sessionStorage.getItem('ideaflow_session_id');

    expect(firstId).toBe(secondId);
  });
});
