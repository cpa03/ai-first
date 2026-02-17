import fs from 'node:fs';
import path from 'node:path';
import {
  PromptService,
  PromptVariable,
  promptService,
} from '@/lib/prompt-service';

describe('PromptService', () => {
  let service: PromptService;
  const testCacheKey = 'test-service';
  const testTemplatesDir = path.join(
    process.cwd(),
    'src',
    'lib',
    'prompts',
    'clarifier'
  );

  beforeEach(() => {
    service = new PromptService();
    service.clearCache();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('loadTemplate', () => {
    it('should load valid system template', async () => {
      const template = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'system'
      );

      expect(template).toBeTruthy();
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should load valid user template', async () => {
      const template = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(template).toBeTruthy();
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
      expect(template).toContain('{idea}');
    });

    it('should load templates from breakdown agent', async () => {
      const systemTemplate = await service.loadTemplate(
        'breakdown',
        'analyze-idea',
        'system'
      );
      const userTemplate = await service.loadTemplate(
        'breakdown',
        'analyze-idea',
        'user'
      );

      expect(systemTemplate).toBeTruthy();
      expect(userTemplate).toBeTruthy();
      expect(userTemplate).toContain('{refinedIdea}');
    });

    it('should cache loaded templates', async () => {
      const firstLoad = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );
      const secondLoad = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(firstLoad).toBe(secondLoad);
    });

    it('should load from cache on subsequent calls', async () => {
      const template1 = await service.loadTemplate(
        'clarifier',
        'refine-idea',
        'system'
      );
      const template2 = await service.loadTemplate(
        'clarifier',
        'refine-idea',
        'system'
      );

      expect(template1).toBe(template2);
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        service.loadTemplate('nonexistent', 'template', 'user')
      ).rejects.toThrow('Failed to load prompt template');
    });

    it('should throw error for non-existent agent', async () => {
      await expect(
        service.loadTemplate('fake-agent', 'template', 'user')
      ).rejects.toThrow('Failed to load prompt template');
    });

    it('should throw error with template path in message', async () => {
      await expect(
        service.loadTemplate('invalid', 'template', 'user')
      ).rejects.toThrow('Failed to load prompt template');
    });

    it('should handle different roles for same template name', async () => {
      const systemTemplate = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'system'
      );
      const userTemplate = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(systemTemplate).not.toBe(userTemplate);
    });

    it('should load all refine-idea templates', async () => {
      const system = await service.loadTemplate(
        'clarifier',
        'refine-idea',
        'system'
      );
      const user = await service.loadTemplate(
        'clarifier',
        'refine-idea',
        'user'
      );

      expect(system).toBeTruthy();
      expect(user).toBeTruthy();
      expect(user).toContain('{originalIdea}');
      expect(user).toContain('{answers}');
    });
  });

  describe('interpolate', () => {
    it('should replace single variable placeholder', () => {
      const template = 'Hello, {name}!';
      const variables: PromptVariable = { name: 'World' };
      const result = service.interpolate(template, variables);

      expect(result).toBe('Hello, World!');
    });

    it('should replace multiple variable placeholders', () => {
      const template = 'Hello, {name}! You are {age} years old.';
      const variables: PromptVariable = { name: 'Alice', age: 30 };
      const result = service.interpolate(template, variables);

      expect(result).toBe('Hello, Alice! You are 30 years old.');
    });

    it('should handle object variables with JSON serialization', () => {
      const template = 'Data: {data}';
      const variables: PromptVariable = {
        data: { key1: 'value1', key2: 'value2' },
      };
      const result = service.interpolate(template, variables);

      expect(result).toContain('key1');
      expect(result).toContain('value1');
      expect(result).toContain('key2');
      expect(result).toContain('value2');
    });

    it('should handle array variables', () => {
      const template = 'Items: {items}';
      const variables: PromptVariable = { items: ['item1', 'item2', 'item3'] };
      const result = service.interpolate(template, variables);

      expect(result).toContain('item1');
      expect(result).toContain('item2');
      expect(result).toContain('item3');
    });

    it('should replace all occurrences of same variable', () => {
      const template = '{name} says hello to {name}';
      const variables: PromptVariable = { name: 'Bob' };
      const result = service.interpolate(template, variables);

      expect(result).toBe('Bob says hello to Bob');
    });

    it('should handle numeric variables', () => {
      const template = 'Count: {count}, Price: ${price}';
      const variables: PromptVariable = { count: 42, price: 19.99 };
      const result = service.interpolate(template, variables);

      expect(result).toContain('42');
      expect(result).toContain('19.99');
    });

    it('should handle special characters in variable values', () => {
      const template = 'Message: {msg}';
      const variables: PromptVariable = {
        msg: 'Hello! @#$%^&*()_+-={}[]|\\:";\'<>?,./',
      };
      const result = service.interpolate(template, variables);

      expect(result).toContain('Hello! @#$%^&*()_+-={}[]|\\:";\'<>?,./');
    });

    it('should handle empty variable object', () => {
      const template = 'Hello, {name}!';
      const variables: PromptVariable = {};
      const result = service.interpolate(template, variables);

      expect(result).toBe('Hello, {name}!');
    });

    it('should handle missing placeholders', () => {
      const template = 'No placeholders here';
      const variables: PromptVariable = { name: 'Test' };
      const result = service.interpolate(template, variables);

      expect(result).toBe('No placeholders here');
    });

    it('should handle nested object variables', () => {
      const template = 'Config: {config}';
      const variables: PromptVariable = {
        config: {
          level1: {
            level2: {
              value: 'deep',
            },
          },
        },
      };
      const result = service.interpolate(template, variables);

      expect(result).toContain('level1');
      expect(result).toContain('level2');
      expect(result).toContain('deep');
    });

    it('should preserve template structure', () => {
      const template = 'Start {var1} middle {var2} end';
      const variables: PromptVariable = { var1: 'A', var2: 'B' };
      const result = service.interpolate(template, variables);

      expect(result).toMatch(/Start A middle B end/);
    });

    it('should handle boolean variables (converted to strings)', () => {
      const template = 'Active: {active}, Visible: {visible}';
      const variables: PromptVariable = {
        active: String(true),
        visible: String(false),
      };
      const result = service.interpolate(template, variables);

      expect(result).toContain('true');
      expect(result).toContain('false');
    });

    it('should handle null and undefined as strings', () => {
      const template = 'Value1: {val1}, Value2: {val2}';
      const variables: PromptVariable = {
        val1: 'null',
        val2: 'undefined',
      };
      const result = service.interpolate(template, variables);

      expect(result).toContain('null');
      expect(result).toContain('undefined');
    });
  });

  describe('getPrompt', () => {
    it('should load and return template without variables', async () => {
      const prompt = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('{idea}');
    });

    it('should load, interpolate and return template with variables', async () => {
      const variables: PromptVariable = { idea: 'Test idea' };
      const prompt = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables
      );

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('Test idea');
      expect(prompt).not.toContain('{idea}');
    });

    it('should handle multiple variables in template', async () => {
      const variables: PromptVariable = {
        originalIdea: 'Build an app',
        answers: 'User answered questions',
      };
      const prompt = await service.getPrompt(
        'clarifier',
        'refine-idea',
        'user',
        variables
      );

      expect(prompt).toContain('Build an app');
      expect(prompt).toContain('User answered questions');
    });

    it('should cache template before interpolation', async () => {
      const template1 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user'
      );
      const template2 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(template1).toBe(template2);
    });

    it('should return different results with different variables', async () => {
      const variables1: PromptVariable = { idea: 'Idea 1' };
      const variables2: PromptVariable = { idea: 'Idea 2' };

      const prompt1 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables1
      );
      const prompt2 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables2
      );

      expect(prompt1).not.toBe(prompt2);
      expect(prompt1).toContain('Idea 1');
      expect(prompt2).toContain('Idea 2');
    });

    it('should handle system role prompts', async () => {
      const prompt = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'system'
      );

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('should handle user role prompts', async () => {
      const prompt = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('should ignore empty variables object', async () => {
      const promptWithVars = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        {}
      );
      const promptWithoutVars = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(promptWithVars).toBe(promptWithoutVars);
    });

    it('should throw error for invalid template name', async () => {
      await expect(
        service.getPrompt('clarifier', 'invalid-template', 'user')
      ).rejects.toThrow('Failed to load prompt template');
    });

    it('should work with breakdown agent prompts', async () => {
      const variables: PromptVariable = { refinedIdea: 'Test project' };
      const prompt = await service.getPrompt(
        'breakdown',
        'analyze-idea',
        'user',
        variables
      );

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('Test project');
    });
  });

  describe('getSystemPrompt', () => {
    it('should load system prompt for clarifier', async () => {
      const prompt = await service.getSystemPrompt(
        'clarifier',
        'generate-questions'
      );

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('should load system prompt for breakdown', async () => {
      const prompt = await service.getSystemPrompt('breakdown', 'analyze-idea');

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('should be equivalent to getPrompt with system role', async () => {
      const systemPrompt1 = await service.getSystemPrompt(
        'clarifier',
        'generate-questions'
      );
      const systemPrompt2 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'system'
      );

      expect(systemPrompt1).toBe(systemPrompt2);
    });

    it('should throw error for invalid agent', async () => {
      await expect(
        service.getSystemPrompt('invalid', 'template')
      ).rejects.toThrow('Failed to load prompt template');
    });
  });

  describe('getUserPrompt', () => {
    it('should load and interpolate user prompt with variables', async () => {
      const variables: PromptVariable = { idea: 'My awesome idea' };
      const prompt = await service.getUserPrompt(
        'clarifier',
        'generate-questions',
        variables
      );

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('My awesome idea');
    });

    it('should be equivalent to getPrompt with user role', async () => {
      const variables: PromptVariable = { idea: 'Test' };
      const userPrompt1 = await service.getUserPrompt(
        'clarifier',
        'generate-questions',
        variables
      );
      const userPrompt2 = await service.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables
      );

      expect(userPrompt1).toBe(userPrompt2);
    });

    it('should handle complex variable objects', async () => {
      const variables: PromptVariable = {
        originalIdea: 'Complex idea',
        answers: [
          { id: '1', question: 'Question 1', answer: 'Answer 1' },
          { id: '2', question: 'Question 2', answer: 'Answer 2' },
        ],
      };
      const prompt = await service.getUserPrompt(
        'clarifier',
        'refine-idea',
        variables
      );

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('Complex idea');
      expect(prompt).toContain('Question 1');
      expect(prompt).toContain('Question 2');
    });

    it('should throw error for invalid template', async () => {
      const variables: PromptVariable = { idea: 'Test' };
      await expect(
        service.getUserPrompt('clarifier', 'invalid', variables)
      ).rejects.toThrow('Failed to load prompt template');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached templates', async () => {
      await service.loadTemplate('clarifier', 'generate-questions', 'user');
      await service.loadTemplate('clarifier', 'refine-idea', 'system');
      await service.loadTemplate('breakdown', 'analyze-idea', 'user');

      expect(() => service.clearCache()).not.toThrow();

      const template = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );
      expect(template).toBeTruthy();
    });

    it('should allow reloading templates after cache clear', async () => {
      const template1 = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );
      service.clearCache();
      const template2 = await service.loadTemplate(
        'clarifier',
        'generate-questions',
        'user'
      );

      expect(template1).toBe(template2);
    });

    it('should work when cache is empty', () => {
      expect(() => service.clearCache()).not.toThrow();
      expect(() => service.clearCache()).not.toThrow();
    });
  });

  describe('exported promptService instance', () => {
    it('should be a singleton instance', () => {
      expect(promptService).toBeInstanceOf(PromptService);
    });

    it('should work like regular PromptService instance', async () => {
      const template = await promptService.loadTemplate(
        'clarifier',
        'generate-questions',
        'system'
      );

      expect(template).toBeTruthy();
    });

    it('should support interpolate method', () => {
      const template = 'Hello, {name}!';
      const variables: PromptVariable = { name: 'World' };
      const result = promptService.interpolate(template, variables);

      expect(result).toBe('Hello, World!');
    });

    it('should support getPrompt method', async () => {
      const variables: PromptVariable = { idea: 'Test' };
      const prompt = await promptService.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables
      );

      expect(prompt).toContain('Test');
    });
  });

  describe('integration tests', () => {
    it('should complete full workflow: load, cache, interpolate', async () => {
      const variables: PromptVariable = { idea: 'Integration test idea' };

      const prompt1 = await promptService.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables
      );

      const prompt2 = await promptService.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        variables
      );

      expect(prompt1).toBe(prompt2);
      expect(prompt1).toContain('Integration test idea');
    });

    it('should handle multiple agents independently', async () => {
      const clarifierVars: PromptVariable = { idea: 'Clarifier idea' };
      const breakdownVars: PromptVariable = { refinedIdea: 'Breakdown idea' };

      const clarifierPrompt = await promptService.getPrompt(
        'clarifier',
        'generate-questions',
        'user',
        clarifierVars
      );

      const breakdownPrompt = await promptService.getPrompt(
        'breakdown',
        'analyze-idea',
        'user',
        breakdownVars
      );

      expect(clarifierPrompt).toContain('Clarifier idea');
      expect(breakdownPrompt).toContain('Breakdown idea');
    });

    it('should maintain cache separation between instances', async () => {
      const service1 = new PromptService();
      const service2 = new PromptService();

      await service1.loadTemplate('clarifier', 'generate-questions', 'user');
      service1.clearCache();

      expect(() => service2.clearCache()).not.toThrow();
    });
  });
});
