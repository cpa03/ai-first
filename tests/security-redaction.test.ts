import { Logger, LogLevel, setLogLevel } from '@/lib/logger';
import { toErrorResponse } from '@/lib/errors';
import { redactPII } from '@/lib/pii-redaction';

describe('Security Redaction Integration', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.INFO);
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger PII Redaction', () => {
    it('should redact PII in log messages', () => {
      const logger = new Logger('TestLogger');
      const sensitiveMessage = 'User email is test@example.com and key is sk-1234567890abcdef1234567890abcdef';

      logger.info(sensitiveMessage);

      const logCall = (console.info as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('[REDACTED_EMAIL]');
      expect(logCall).toContain('[REDACTED_API_KEY]');
      expect(logCall).not.toContain('test@example.com');
      expect(logCall).not.toContain('sk-1234567890abcdef');
    });

    it('should redact PII in log arguments', () => {
      const logger = new Logger('TestLogger');
      const metadata = {
        apiKey: 'sk-1234567890abcdef1234567890abcdef',
        userEmail: 'test@example.com',
        safeField: 'safe'
      };

      logger.info('User action', metadata);

      const logArgs = (console.info as jest.Mock).mock.calls[0];
      expect(logArgs[1].apiKey).toBe('[REDACTED_API_KEY]');
      expect(logArgs[1].userEmail).toBe('[REDACTED_USER_EMAIL]');
      expect(logArgs[1].safeField).toBe('safe');
    });

    it('should redact new sensitive fields like cookie and connection_string', () => {
        const logger = new Logger('TestLogger');
        const metadata = {
            cookie: 'session_id=12345',
            connection_string: 'postgres://user:password@host:5432/db'
        };

        logger.info('Connection info', metadata);

        const logArgs = (console.info as jest.Mock).mock.calls[0];
        expect(logArgs[1].cookie).toBe('[REDACTED_COOKIE]');
        expect(logArgs[1].connection_string).toBe('[REDACTED_CONNECTION_STRING]');
    });
  });

  describe('Error Response PII Redaction', () => {
    it('should redact PII in generic error messages', async () => {
      const sensitiveError = new Error('Failed to connect to database at postgres://admin:password123@localhost:5432/mydb');
      const response = toErrorResponse(sensitiveError, 'req_123');
      const body = await response.json();

      expect(body.error).toContain('[REDACTED_URL]');
      expect(body.error).not.toContain('password123');
    });
  });
});
