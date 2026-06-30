import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

describe('API_ERROR_MESSAGES', () => {
  it('should have AI service error messages', () => {
    expect(API_ERROR_MESSAGES.AI.OPENAI_API_KEY_NOT_CONFIGURED).toBeDefined();
    expect(
      API_ERROR_MESSAGES.AI.ANTHROPIC_API_KEY_NOT_CONFIGURED
    ).toBeDefined();
  });

  it('should have database error messages', () => {
    expect(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED).toBeDefined();
  });

  it('should have validation error messages', () => {
    expect(API_ERROR_MESSAGES.VALIDATION.IDEA_ID_REQUIRED).toBeDefined();
  });
});
