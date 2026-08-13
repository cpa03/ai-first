/**
 * Tests for AI model config security validation
 * @module tests/security/ai-validation.test
 */

import {
  validateModelName,
  validateModelTemperature,
  validateModelMaxTokens,
  validateAIModelConfig,
} from '@/lib/validation';

describe('AI Config Security Validation', () => {
  describe('validateModelName', () => {
    it('should validate standard allowed models with correct prefixes', () => {
      const validModels = [
        'gpt-4',
        'gpt-3.5-turbo',
        'claude-3-5-sonnet-20241022',
        'o1-mini',
        'o3-mini',
      ];

      for (const model of validModels) {
        const result = validateModelName(model);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should fail on empty or non-string inputs', () => {
      expect(validateModelName('').valid).toBe(false);
      expect(validateModelName('   ').valid).toBe(false);
      expect(validateModelName(null).valid).toBe(false);
      expect(validateModelName(undefined).valid).toBe(false);
      expect(validateModelName(123).valid).toBe(false);
    });

    it('should fail on unauthorized prefixes to prevent shadow model usage', () => {
      const unauthorizedModels = [
        'llama-3',
        'deepseek-chat',
        'gemini-pro',
        'custom-model',
      ];

      for (const model of unauthorizedModels) {
        const result = validateModelName(model);
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.message.includes('must start with'))
        ).toBe(true);
      }
    });

    it('should fail on invalid character patterns (injection / path traversal)', () => {
      const maliciousModels = [
        'gpt-4/../traversal',
        'gpt-4; DROP TABLE users',
        'claude-3<script>',
        'o1-mini\x00',
      ];

      for (const model of maliciousModels) {
        const result = validateModelName(model);
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.message.includes('contain only'))
        ).toBe(true);
      }
    });

    it('should enforce a strict 100-character maximum length limit (Security DoS Prevention)', () => {
      // 101 character model name starting with valid prefix 'gpt-'
      const longModel = 'gpt-' + 'a'.repeat(97);
      expect(longModel.length).toBe(101);

      const result = validateModelName(longModel);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('must not exceed 100 characters'))
      ).toBe(true);
    });

    it('should allow model names up to exactly 100 characters', () => {
      // 100 character model name starting with valid prefix 'gpt-'
      const maxLengthModel = 'gpt-' + 'a'.repeat(96);
      expect(maxLengthModel.length).toBe(100);

      const result = validateModelName(maxLengthModel);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateModelTemperature', () => {
    it('should pass on valid temperature numbers within [0, 2.0]', () => {
      const validTemps = [0, 0.5, 1.0, 1.5, 2.0];
      for (const temp of validTemps) {
        const result = validateModelTemperature(temp);
        expect(result.valid).toBe(true);
      }
    });

    it('should fail on out of bounds temperatures', () => {
      expect(validateModelTemperature(-0.1).valid).toBe(false);
      expect(validateModelTemperature(2.1).valid).toBe(false);
    });

    it('should fail on invalid types', () => {
      expect(validateModelTemperature('0.7').valid).toBe(false);
      expect(validateModelTemperature(NaN).valid).toBe(false);
      expect(validateModelTemperature({}).valid).toBe(false);
    });

    it('should allow undefined or null to fallback to default', () => {
      expect(validateModelTemperature(undefined).valid).toBe(true);
      expect(validateModelTemperature(null).valid).toBe(true);
    });
  });

  describe('validateModelMaxTokens', () => {
    it('should pass on valid max token integers within [1, 32000]', () => {
      const validTokens = [1, 100, 4000, 16000, 32000];
      for (const token of validTokens) {
        const result = validateModelMaxTokens(token);
        expect(result.valid).toBe(true);
      }
    });

    it('should fail on out of bounds max tokens', () => {
      expect(validateModelMaxTokens(0).valid).toBe(false);
      expect(validateModelMaxTokens(32001).valid).toBe(false);
    });

    it('should fail on non-integers', () => {
      expect(validateModelMaxTokens(100.5).valid).toBe(false);
    });

    it('should fail on invalid types', () => {
      expect(validateModelMaxTokens('4000').valid).toBe(false);
      expect(validateModelMaxTokens(NaN).valid).toBe(false);
    });
  });

  describe('validateAIModelConfig', () => {
    it('should validate correct config configurations', () => {
      const config = {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
      };

      const result = validateAIModelConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail if parameter config is not an object', () => {
      const result = validateAIModelConfig('invalid-config');
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('must be an object'))
      ).toBe(true);
    });

    it('should aggregate errors from sub-validations', () => {
      const badConfig = {
        model: 'invalid-model',
        temperature: 2.5,
        maxTokens: -50,
      };

      const result = validateAIModelConfig(badConfig);
      expect(result.valid).toBe(false);
      // Should have errors for model, temperature, and maxTokens
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
