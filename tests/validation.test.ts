import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
  validateRequestSize,
  sanitizeString,
  buildErrorResponse,
  MAX_IDEA_LENGTH,
  MIN_IDEA_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_IDEA_ID_LENGTH,
} from '@/lib/validation';

describe('validateIdea', () => {
  describe('valid ideas', () => {
    it('should accept valid idea with minimum length', () => {
      const idea = 'a'.repeat(MIN_IDEA_LENGTH);
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid idea with maximum length', () => {
      const idea = 'a'.repeat(MAX_IDEA_LENGTH);
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid idea with typical content', () => {
      const idea = 'I want to build a landing page for my new SaaS product';
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should trim whitespace', () => {
      const idea = '  ' + 'a'.repeat(MIN_IDEA_LENGTH) + '  ';
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ideas with newlines', () => {
      const idea = 'Idea line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ideas with special characters', () => {
      const idea = 'Build a $100/month SaaS for AI-powered analytics 🚀';
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('invalid ideas', () => {
    it('should reject null or undefined', () => {
      const result1 = validateIdea(null as any);
      const result2 = validateIdea(undefined as any);

      expect(result1.valid).toBe(false);
      expect(result1.errors).toHaveLength(1);
      expect(result1.errors[0].field).toBe('idea');
      expect(result1.errors[0].message).toContain('required');

      expect(result2.valid).toBe(false);
      expect(result2.errors).toHaveLength(1);
    });

    it('should reject non-string types', () => {
      const result1 = validateIdea(123 as any);
      const result2 = validateIdea({ idea: 'test' } as any);
      const result3 = validateIdea(['idea'] as any);

      expect(result1.valid).toBe(false);
      expect(result1.errors[0].message).toContain('must be a string');

      expect(result2.valid).toBe(false);
      expect(result2.errors[0].message).toContain('must be a string');

      expect(result3.valid).toBe(false);
      expect(result3.errors[0].message).toContain('must be a string');
    });

    it('should reject idea shorter than minimum length', () => {
      const idea = 'a'.repeat(MIN_IDEA_LENGTH - 1);
      const result = validateIdea(idea);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('idea');
      expect(result.errors[0].message).toContain(
        `at least ${MIN_IDEA_LENGTH} characters`
      );
    });

    it('should reject empty string', () => {
      const result = validateIdea('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const errorMessages = result.errors.map((e) => e.message);
      expect(errorMessages.some((msg) => msg.includes('required'))).toBe(true);
    });

    it('should reject whitespace-only string', () => {
      const result = validateIdea('     ');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const errorMessages = result.errors.map((e) => e.message);
      expect(
        errorMessages.some(
          (msg) => msg.includes('required') || msg.includes('at least')
        )
      ).toBe(true);
    });

    it('should reject idea longer than maximum length', () => {
      const idea = 'a'.repeat(MAX_IDEA_LENGTH + 1);
      const result = validateIdea(idea);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('idea');
      expect(result.errors[0].message).toContain(
        `not exceed ${MAX_IDEA_LENGTH} characters`
      );
    });

    it('should return multiple errors for idea below minimum and above maximum (edge case)', () => {
      const idea = '';
      const result = validateIdea(idea);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('boundary conditions', () => {
    it('should handle exactly MIN_IDEA_LENGTH', () => {
      const idea = 'a'.repeat(MIN_IDEA_LENGTH);
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
    });

    it('should handle exactly MAX_IDEA_LENGTH', () => {
      const idea = 'a'.repeat(MAX_IDEA_LENGTH);
      const result = validateIdea(idea);

      expect(result.valid).toBe(true);
    });

    it('should handle MIN_IDEA_LENGTH - 1', () => {
      const idea = 'a'.repeat(MIN_IDEA_LENGTH - 1);
      const result = validateIdea(idea);

      expect(result.valid).toBe(false);
    });

    it('should handle MAX_IDEA_LENGTH + 1', () => {
      const idea = 'a'.repeat(MAX_IDEA_LENGTH + 1);
      const result = validateIdea(idea);

      expect(result.valid).toBe(false);
    });
  });
});

describe('validateIdeaId', () => {
  describe('valid idea IDs', () => {
    it('should accept alphanumeric ID', () => {
      const ideaId = 'idea123';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ID with underscores', () => {
      const ideaId = 'idea_123_test';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ID with hyphens', () => {
      const ideaId = 'idea-123-test';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ID with mixed alphanumeric, underscores, and hyphens', () => {
      const ideaId = 'idea_123-abc_XYZ-456';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept ID at maximum length', () => {
      const ideaId = 'a'.repeat(MAX_IDEA_ID_LENGTH);
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should trim whitespace', () => {
      const ideaId = '  idea123  ';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept UUID-like format', () => {
      const ideaId = 'abc123-xyz789-test-123';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid idea IDs', () => {
    it('should reject null or undefined', () => {
      const result1 = validateIdeaId(null as any);
      const result2 = validateIdeaId(undefined as any);

      expect(result1.valid).toBe(false);
      expect(result1.errors[0].field).toBe('ideaId');
      expect(result1.errors[0].message).toContain('required');

      expect(result2.valid).toBe(false);
      expect(result2.errors[0].message).toContain('required');
    });

    it('should reject non-string types', () => {
      const result1 = validateIdeaId(123 as any);
      const result2 = validateIdeaId({ id: 'test' } as any);

      expect(result1.valid).toBe(false);
      expect(result1.errors[0].message).toContain('must be a string');

      expect(result2.valid).toBe(false);
      expect(result2.errors[0].message).toContain('must be a string');
    });

    it('should reject empty string', () => {
      const result = validateIdeaId('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject whitespace-only string', () => {
      const result = validateIdeaId('   ');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const errorMessages = result.errors.map((e) => e.message);
      expect(errorMessages.some((msg) => msg.includes('cannot be empty'))).toBe(
        true
      );
    });

    it('should reject ID with spaces', () => {
      const ideaId = 'idea 123';
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('alphanumeric characters');
    });

    it('should reject ID with special characters', () => {
      const invalidIds = [
        'idea@123',
        'idea#123',
        'idea$123',
        'idea!123',
        'idea.123',
      ];

      invalidIds.forEach((id) => {
        const result = validateIdeaId(id);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('alphanumeric characters');
      });
    });

    it('should reject ID with punctuation', () => {
      const invalidIds = [
        'idea,123',
        'idea;123',
        'idea:123',
        'idea(123)',
        'idea[123]',
      ];

      invalidIds.forEach((id) => {
        const result = validateIdeaId(id);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('alphanumeric characters');
      });
    });

    it('should reject ID exceeding maximum length', () => {
      const ideaId = 'a'.repeat(MAX_IDEA_ID_LENGTH + 1);
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('ideaId');
      expect(result.errors[0].message).toContain(
        `not exceed ${MAX_IDEA_ID_LENGTH} characters`
      );
    });
  });

  describe('boundary conditions', () => {
    it('should handle single character ID', () => {
      const result = validateIdeaId('a');

      expect(result.valid).toBe(true);
    });

    it('should handle exactly MAX_IDEA_ID_LENGTH', () => {
      const ideaId = 'a'.repeat(MAX_IDEA_ID_LENGTH);
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(true);
    });

    it('should handle MAX_IDEA_ID_LENGTH + 1', () => {
      const ideaId = 'a'.repeat(MAX_IDEA_ID_LENGTH + 1);
      const result = validateIdeaId(ideaId);

      expect(result.valid).toBe(false);
    });
  });
});

describe('validateUserResponses', () => {
  describe('valid responses', () => {
    it('should accept null responses', () => {
      const result = validateUserResponses(null);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept undefined responses', () => {
      const result = validateUserResponses(undefined);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid responses object', () => {
      const responses = {
        '1': 'First answer',
        '2': 'Second answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept responses with null values', () => {
      const responses = {
        '1': null,
        '2': 'Answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept responses with undefined values', () => {
      const responses = {
        '1': undefined,
        '2': 'Answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept empty object', () => {
      const result = validateUserResponses({});

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept responses at maximum size', () => {
      const responses = {
        '1': 'a'.repeat(1000),
        '2': 'b'.repeat(1000),
        '3': 'c'.repeat(1000),
        '4': 'd'.repeat(1000),
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
    });

    it('should accept long valid keys', () => {
      const longKey = 'a'.repeat(100);
      const responses = {
        [longKey]: 'Answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid responses', () => {
    it('should reject array', () => {
      const responses = ['answer1', 'answer2'] as any;
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('userResponses');
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should reject string', () => {
      const responses = 'not an object' as any;
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should reject number', () => {
      const responses = 123 as any;
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should reject boolean', () => {
      const responses = true as any;
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should reject responses exceeding maximum size', () => {
      const responses = {
        '1': 'a'.repeat(5000),
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('userResponses');
      expect(result.errors[0].message).toContain('too large');
    });

    it('should reject responses with keys longer than 100 characters', () => {
      const responses = {
        ['a'.repeat(101)]: 'Answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Invalid key format');
    });

    it('should accept numeric keys (converted to strings)', () => {
      const responses = {
        123: 'Answer' as any,
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-string, non-null, non-undefined values', () => {
      const responses = {
        '1': 123 as any,
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('userResponses');
      expect(result.errors[0].message).toContain('must be a string');
    });

    it('should reject array values', () => {
      const responses = {
        '1': ['answer'] as any,
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a string');
    });

    it('should reject object values', () => {
      const responses = {
        '1': { answer: 'test' } as any,
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a string');
    });

    it('should reject values longer than 1000 characters', () => {
      const responses = {
        '1': 'a'.repeat(1001),
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('is too long');
    });
  });

  describe('multiple errors', () => {
    it('should collect multiple validation errors', () => {
      const responses = {
        ['a'.repeat(101)]: 'b'.repeat(1001),
        123: 'c' as any,
        '2': 456 as any,
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle mixed valid and invalid responses', () => {
      const responses = {
        '1': 'Valid answer',
        '2': 'a'.repeat(1001),
        '3': 'Another valid answer',
      };
      const result = validateUserResponses(responses);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});

describe('validateRequestSize', () => {
  let mockRequest: Request;

  beforeEach(() => {
    mockRequest = {
      headers: new Headers(),
    } as any;
  });

  describe('valid requests', () => {
    it('should accept request within size limit', () => {
      mockRequest.headers.set('content-length', '1024');
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept request exactly at size limit', () => {
      mockRequest.headers.set('content-length', '1048576');
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept request with no content-length header', () => {
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept small requests', () => {
      mockRequest.headers.set('content-length', '100');
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(true);
    });

    it('should use default max size of 1MB', () => {
      mockRequest.headers.set('content-length', '1048576');
      const result = validateRequestSize(mockRequest);

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it('should reject request exceeding size limit', () => {
      mockRequest.headers.set('content-length', '1048577');
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('request');
      expect(result.errors[0].message).toContain('too large');
    });

    it('should reject request much larger than limit', () => {
      mockRequest.headers.set('content-length', '10485760');
      const result = validateRequestSize(mockRequest, 1024 * 1024);

      expect(result.valid).toBe(false);
    });

    it('should reject request with zero size limit', () => {
      mockRequest.headers.set('content-length', '1');
      const result = validateRequestSize(mockRequest, 0);

      expect(result.valid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle content-length of 0', () => {
      mockRequest.headers.set('content-length', '0');
      const result = validateRequestSize(mockRequest);

      expect(result.valid).toBe(true);
    });

    it('should handle non-numeric content-length', () => {
      mockRequest.headers.set('content-length', 'invalid');
      const result = validateRequestSize(mockRequest);

      expect(result.valid).toBe(true);
    });

    it('should handle negative content-length', () => {
      mockRequest.headers.set('content-length', '-100');
      const result = validateRequestSize(mockRequest);

      expect(result.valid).toBe(true);
    });

    it('should handle custom max size', () => {
      mockRequest.headers.set('content-length', '512');
      const result = validateRequestSize(mockRequest, 512);

      expect(result.valid).toBe(true);
    });

    it('should handle very large max size', () => {
      mockRequest.headers.set('content-length', '104857600');
      const result = validateRequestSize(mockRequest, 100 * 1024 * 1024);

      expect(result.valid).toBe(true);
    });
  });
});

describe('sanitizeString', () => {
  describe('basic sanitization', () => {
    it('should trim whitespace from string', () => {
      const result = sanitizeString('  test string  ');

      expect(result).toBe('test string');
    });

    it('should trim leading whitespace', () => {
      const result = sanitizeString('   test');

      expect(result).toBe('test');
    });

    it('should trim trailing whitespace', () => {
      const result = sanitizeString('test   ');

      expect(result).toBe('test');
    });

    it('should handle strings with only whitespace', () => {
      const result = sanitizeString('     ');

      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');

      expect(result).toBe('');
    });
  });

  describe('length limiting', () => {
    it('should truncate string at default max length', () => {
      const input = 'a'.repeat(MAX_IDEA_LENGTH + 100);
      const result = sanitizeString(input);

      expect(result.length).toBe(MAX_IDEA_LENGTH);
      expect(result).toBe('a'.repeat(MAX_IDEA_LENGTH));
    });

    it('should not truncate string below max length', () => {
      const input = 'test string';
      const result = sanitizeString(input);

      expect(result).toBe('test string');
    });

    it('should handle string exactly at max length', () => {
      const input = 'a'.repeat(MAX_IDEA_LENGTH);
      const result = sanitizeString(input);

      expect(result).toBe(input);
    });

    it('should truncate then trim', () => {
      const input = '  ' + 'a'.repeat(MAX_IDEA_LENGTH + 100) + '  ';
      const result = sanitizeString(input);

      expect(result.length).toBe(MAX_IDEA_LENGTH);
      expect(result).toBe('a'.repeat(MAX_IDEA_LENGTH));
    });
  });

  describe('custom max length', () => {
    it('should truncate at custom max length', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeString(input, 50);

      expect(result.length).toBe(50);
      expect(result).toBe('a'.repeat(50));
    });

    it('should handle zero custom max length', () => {
      const result = sanitizeString('test', 0);

      expect(result).toBe('');
    });

    it('should handle negative custom max length', () => {
      const result = sanitizeString('test', -10);

      expect(result).toBe('');
    });

    it('should handle custom max length larger than input', () => {
      const input = 'test';
      const result = sanitizeString(input, 100);

      expect(result).toBe('test');
    });
  });

  describe('edge cases', () => {
    it('should preserve internal whitespace', () => {
      const input = 'test   string   with   spaces';
      const result = sanitizeString(input);

      expect(result).toBe(input);
    });

    it('should preserve newlines', () => {
      const input = 'line1\nline2\nline3';
      const result = sanitizeString(input);

      expect(result).toBe(input);
    });

    it('should preserve tabs', () => {
      const input = 'test\tstring';
      const result = sanitizeString(input);

      expect(result).toBe(input);
    });
  });
});

describe('buildErrorResponse', () => {
  describe('response construction', () => {
    it('should build response with correct status code', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const response = buildErrorResponse(errors);

      expect(response.status).toBe(400);
    });

    it('should build response with correct content type', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const response = buildErrorResponse(errors);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should build response with error message', async () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.error).toBe('Validation failed');
    });

    it('should build response with details', async () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'name', message: 'Name is required' },
      ];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details).toEqual(errors);
    });
  });

  describe('multiple errors', () => {
    it('should handle single validation error', async () => {
      const errors = [{ field: 'age', message: 'Must be positive' }];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details).toHaveLength(1);
      expect(body.details[0]).toEqual(errors[0]);
    });

    it('should handle multiple validation errors', async () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'age', message: 'Must be positive' },
        { field: 'name', message: 'Name is required' },
      ];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details).toHaveLength(3);
      expect(body.details).toEqual(errors);
    });

    it('should handle empty errors array', async () => {
      const errors: any[] = [];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details).toEqual([]);
    });
  });

  describe('error detail variations', () => {
    it('should handle errors with field', async () => {
      const errors = [{ field: 'test', message: 'Test error' }];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details[0].field).toBe('test');
      expect(body.details[0].message).toBe('Test error');
    });

    it('should handle errors with code', async () => {
      const errors = [
        { field: 'test', message: 'Test error', code: 'TEST_ERROR' },
      ];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details[0].code).toBe('TEST_ERROR');
    });

    it('should handle errors with empty field', async () => {
      const errors = [{ field: '', message: 'General error' }];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details[0].field).toBe('');
      expect(body.details[0].message).toBe('General error');
    });
  });

  describe('edge cases', () => {
    it('should handle large error arrays', async () => {
      const errors = Array.from({ length: 100 }, (_, i) => ({
        field: `field${i}`,
        message: `Error message ${i}`,
      }));
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details).toHaveLength(100);
    });

    it('should handle special characters in messages', async () => {
      const errors = [
        { field: 'test', message: 'Error with <script> and "quotes"' },
      ];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details[0].message).toContain('<script>');
      expect(body.details[0].message).toContain('"quotes"');
    });

    it('should handle unicode characters', async () => {
      const errors = [
        { field: 'test', message: 'Error with 🚀 emoji and 中文' },
      ];
      const response = buildErrorResponse(errors);
      const body = await response.json();

      expect(body.details[0].message).toContain('🚀');
      expect(body.details[0].message).toContain('中文');
    });
  });
});
