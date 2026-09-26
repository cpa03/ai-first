import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { SecurityAuditLog } from '@/lib/security/audit-log';

// Mock SecurityAuditLog to verify requestId propagation
jest.mock('@/lib/security/audit-log', () => ({
  SecurityAuditLog: {
    logEvent: jest.fn(),
  },
}));

describe('Suspicious Patterns Enhanced Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SSTI Detection', () => {
    it('should detect Jinja2/Twig style interpolation', async () => {
      const req = new Request('https://example.com/api/test?q={{7*7}}');
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
    });

    it('should detect SSTI sensitive object access', async () => {
      const req = new Request('https://example.com/api/test?q={{config}}');
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
    });

    it('should detect Python SSTI introspection', async () => {
      const req = new Request(
        'https://example.com/api/test?q={{self.__class__.__mro__[1].__subclasses__()}}'
      );
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
    });

    it('should detect Expression Language (EL) injection', async () => {
      const req = new Request('https://example.com/api/test?q=${1+1}');
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
    });
  });

  describe('Insecure Deserialization Detection', () => {
    it('should detect PHP serialized objects', async () => {
      const req = new Request(
        'https://example.com/api/test?data=O:8:"stdClass":0:{}'
      );
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'insecure_deserialization')
      ).toBe(true);
    });

    it('should detect Java serialization in Base64', async () => {
      const req = new Request(
        'https://example.com/api/test?data=rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcDs='
      );
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'insecure_deserialization')
      ).toBe(true);
    });

    it('should detect .NET serialization indicators', async () => {
      const req = new Request('https://example.com/api/test?data=y0A');
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'insecure_deserialization')
      ).toBe(true);
    });
  });

  describe('Enhanced NoSQL Injection Detection', () => {
    it('should detect $expr operator', async () => {
      const req = new Request(
        'https://example.com/api/test?q={"$expr":{"$gt":["$field",1]}}'
      );
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'nosql_injection')
      ).toBe(true);
    });

    it('should detect $jsonSchema operator', async () => {
      const req = new Request(
        'https://example.com/api/test?q={"$jsonSchema":{}}'
      );
      const result = await detectSuspiciousPatterns(req, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'nosql_injection')
      ).toBe(true);
    });
  });

  describe('RequestId Propagation', () => {
    it('should propagate requestId from options to SecurityAuditLog', async () => {
      const req = new Request('https://example.com/api/test?q={{7*7}}');
      const testRequestId = 'test-request-id-123';

      await detectSuspiciousPatterns(req, {
        minSeverity: 1,
        logDetected: true,
        requestId: testRequestId,
      });

      expect(SecurityAuditLog.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: testRequestId,
        })
      );
    });

    it('should propagate x-request-id header to SecurityAuditLog if not in options', async () => {
      const testRequestId = 'header-request-id-456';
      const req = new Request('https://example.com/api/test?q={{7*7}}', {
        headers: {
          'x-request-id': testRequestId,
        },
      });

      await detectSuspiciousPatterns(req, {
        minSeverity: 1,
        logDetected: true,
      });

      expect(SecurityAuditLog.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: testRequestId,
        })
      );
    });
  });
});
