import { PromptService } from '@/lib/prompts/prompt-service';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock('path');
const mockPath = path as jest.Mocked<typeof path>;

describe('PromptService', () => {
  let promptService: PromptService;

  beforeEach(() => {
    promptService = new PromptService();
    jest.clearAllMocks();

    // Setup default path mocking
    mockPath.join.mockImplementation((dir: string, ...parts: string[]) => {
      if (parts.length > 0) {
        return [dir, ...parts].join('/');
      }
      return dir;
    });
  });

  describe('constructor', () => {
    it('should initialize with default prompts directory', () => {
      const service = new PromptService();
      expect(service).toBeInstanceOf(PromptService);
    });

    it('should accept custom prompts directory', () => {
      const service = new PromptService('custom/prompts');
      expect(service).toBeInstanceOf(PromptService);
    });
  });

  describe('cache management', () => {
    it('should enable caching by default', () => {
      const service = new PromptService();
      expect(service.getCacheSize()).toBe(0);
    });

    it('should disable cache when requested', () => {
      mockFs.readFileSync.mockReturnValue('test prompt');

      promptService.setCacheEnabled(false);

      promptService.loadPrompt('clarifier', 'system.txt');
      expect(promptService.getCacheSize()).toBe(0);
    });

    it('should clear cache on disable', () => {
      mockFs.readFileSync.mockReturnValue('test prompt');

      promptService.loadPrompt('clarifier', 'system.txt');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.setCacheEnabled(false);
      expect(promptService.getCacheSize()).toBe(0);
    });

    it('should clear cache manually', () => {
      mockFs.readFileSync.mockReturnValue('test prompt');

      promptService.loadPrompt('clarifier', 'system.txt');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.clearCache();
      expect(promptService.getCacheSize()).toBe(0);
    });

    it('should cache prompts when enabled', () => {
      mockFs.readFileSync.mockReturnValue('test prompt');

      promptService.loadPrompt('clarifier', 'system.txt');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.loadPrompt('clarifier', 'system.txt');
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadPrompt', () => {
    it('should load prompt from disk', () => {
      const testPrompt = 'You are a helpful assistant.';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'system.txt');

      expect(result).toBe(testPrompt);
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should load prompt with variables', () => {
      const testPrompt = 'Hello {{name}}, welcome to {{place}}!';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'greeting.txt', {
        name: 'John',
        place: 'Paris',
      });

      expect(result).toBe('Hello John, welcome to Paris!');
    });

    it('should handle variable interpolation with objects', () => {
      const testPrompt = 'Data: {{data}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'data.txt', {
        data: { key: 'value', number: 42 },
      });

      expect(result).toContain('key');
      expect(result).toContain('value');
      expect(result).toContain('42');
    });

    it('should handle variable interpolation with arrays', () => {
      const testPrompt = 'Items: {{items}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'list.txt', {
        items: ['item1', 'item2', 'item3'],
      });

      expect(result).toContain('item1');
      expect(result).toContain('item2');
      expect(result).toContain('item3');
    });

    it('should handle variable interpolation with numbers', () => {
      const testPrompt = 'Count: {{count}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'count.txt', {
        count: 42,
      });

      expect(result).toBe('Count: 42');
    });

    it('should handle variable interpolation with booleans', () => {
      const testPrompt = 'Enabled: {{enabled}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'flag.txt', {
        enabled: true,
      });

      expect(result).toBe('Enabled: true');
    });

    it('should handle multiple variables', () => {
      const testPrompt =
        'User: {{name}} ({{email}}) - Age: {{age}}, Active: {{active}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'user.txt', {
        name: 'John',
        email: 'john@example.com',
        age: 30,
        active: true,
      });

      expect(result).toBe(
        'User: John (john@example.com) - Age: 30, Active: true'
      );
    });

    it('should handle repeated variables', () => {
      const testPrompt = 'Name: {{name}}, Welcome {{name}}!';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'repeat.txt', {
        name: 'Alice',
      });

      expect(result).toBe('Name: Alice, Welcome Alice!');
    });

    it('should load without variables', () => {
      const testPrompt = 'You are a helpful assistant.';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'system.txt');

      expect(result).toBe(testPrompt);
    });

    it('should handle missing variables gracefully', () => {
      const testPrompt = 'Hello {{name}}!';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'greeting.txt');

      expect(result).toBe('Hello {{name}}!');
    });
  });

  describe('loadSystemPrompt', () => {
    it('should load system.txt for given agent', () => {
      const systemPrompt = 'You are a clarifier agent.';
      mockFs.readFileSync.mockReturnValue(systemPrompt);

      const result = promptService.loadSystemPrompt('clarifier');

      expect(result).toBe(systemPrompt);
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should cache system prompt', () => {
      mockFs.readFileSync.mockReturnValue('System prompt');

      promptService.loadSystemPrompt('clarifier');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.loadSystemPrompt('clarifier');
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('reloadPrompt', () => {
    it('should reload prompt from disk', () => {
      mockFs.readFileSync.mockReturnValue('Old prompt');

      promptService.loadPrompt('clarifier', 'test.txt');

      mockFs.readFileSync.mockReturnValue('New prompt');

      promptService.reloadPrompt('clarifier', 'test.txt');

      const result = promptService.loadPrompt('clarifier', 'test.txt');

      expect(result).toBe('New prompt');
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
    });

    it('should cache reloaded prompt', () => {
      mockFs.readFileSync.mockReturnValue('Updated prompt');

      promptService.reloadPrompt('clarifier', 'test.txt');
      expect(promptService.getCacheSize()).toBe(1);
    });
  });

  describe('promptExists', () => {
    it('should return true when prompt file exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const exists = promptService.promptExists('clarifier', 'system.txt');

      expect(exists).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalled();
    });

    it('should return false when prompt file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const exists = promptService.promptExists('clarifier', 'missing.txt');

      expect(exists).toBe(false);
      expect(mockFs.existsSync).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when file not found', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => {
        promptService.loadPrompt('clarifier', 'missing.txt');
      }).toThrow('Failed to load prompt');
    });

    it('should throw error with message from fs error', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        promptService.loadPrompt('clarifier', 'test.txt');
      }).toThrow('Failed to load prompt');
    });

    it('should handle non-Error objects', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw 'String error';
      });

      expect(() => {
        promptService.loadPrompt('clarifier', 'test.txt');
      }).toThrow('Failed to load prompt clarifier/test.txt: Unknown error');
    });
  });

  describe('cache behavior', () => {
    it('should use cached prompt when available', () => {
      mockFs.readFileSync.mockReturnValue('First load');

      const result1 = promptService.loadPrompt('clarifier', 'test.txt');
      mockFs.readFileSync.mockReturnValue('Second load');
      const result2 = promptService.loadPrompt('clarifier', 'test.txt');

      expect(result1).toBe('First load');
      expect(result2).toBe('First load');
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should cache different prompts separately', () => {
      let callCount = 0;
      mockFs.readFileSync.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 'Prompt 1';
        if (callCount === 2) return 'Prompt 2';
        return 'Default';
      });

      promptService.loadPrompt('clarifier', 'prompt1.txt');
      promptService.loadPrompt('clarifier', 'prompt2.txt');

      expect(promptService.getCacheSize()).toBe(2);
    });

    it('should cache same prompt for different agents separately', () => {
      mockFs.readFileSync.mockReturnValue('System prompt');

      promptService.loadSystemPrompt('clarifier');
      promptService.loadSystemPrompt('breakdown');

      expect(promptService.getCacheSize()).toBe(2);
    });
  });

  describe('variable interpolation edge cases', () => {
    it('should handle empty variables object', () => {
      const testPrompt = 'Hello World!';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'test.txt', {});

      expect(result).toBe('Hello World!');
    });

    it('should handle undefined variable values', () => {
      const testPrompt = 'Value: {{value}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'test.txt', {
        value: undefined,
      });

      expect(result).toBe('Value: undefined');
    });

    it('should handle null variable values', () => {
      const testPrompt = 'Value: {{value}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'test.txt', {
        value: null,
      });

      expect(result).toBe('Value: null');
    });

    it('should handle special characters in variable values', () => {
      const testPrompt = 'Message: {{msg}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'test.txt', {
        msg: 'Hello <script>alert("xss")</script>',
      });

      expect(result).toContain('<script>');
    });

    it('should handle nested objects', () => {
      const testPrompt = 'User: {{user}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const result = promptService.loadPrompt('clarifier', 'test.txt', {
        user: {
          name: 'John',
          address: { city: 'Paris', country: 'France' },
        },
      });

      expect(result).toContain('John');
      expect(result).toContain('Paris');
    });

    it('should handle circular reference error gracefully', () => {
      const testPrompt = 'Data: {{data}}';
      mockFs.readFileSync.mockReturnValue(testPrompt);

      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        promptService.loadPrompt('clarifier', 'test.txt', {
          data: circularObj,
        });
      }).toThrow();
    });
  });

  describe('getCacheSize', () => {
    it('should return zero for new service', () => {
      expect(promptService.getCacheSize()).toBe(0);
    });

    it('should return correct cache size after loading prompts', () => {
      mockFs.readFileSync.mockReturnValue('Prompt content');

      promptService.loadPrompt('agent1', 'prompt1.txt');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.loadPrompt('agent1', 'prompt2.txt');
      expect(promptService.getCacheSize()).toBe(2);

      promptService.loadPrompt('agent2', 'prompt1.txt');
      expect(promptService.getCacheSize()).toBe(3);
    });

    it('should reflect cleared cache', () => {
      mockFs.readFileSync.mockReturnValue('Prompt content');

      promptService.loadPrompt('agent', 'prompt.txt');
      expect(promptService.getCacheSize()).toBe(1);

      promptService.clearCache();
      expect(promptService.getCacheSize()).toBe(0);
    });
  });
});
