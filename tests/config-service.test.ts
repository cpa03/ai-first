import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  ConfigurationService,
  configurationService,
  AgentConfig,
} from '@/lib/config-service';
import { AIModelConfig } from '@/lib/ai';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  const testConfigDir = 'ai/agent-configs';

  beforeEach(() => {
    service = new ConfigurationService(testConfigDir);
    service.clearCache();
    service.setCacheEnabled(true);
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('loadAgentConfig', () => {
    it('should load valid clarifier configuration', async () => {
      const config = await service.loadAgentConfig('clarifier');

      expect(config).toBeTruthy();
      expect(config.name).toBe('clarifier');
      expect(config.model).toBe('gpt-4');
      expect(config.temperature).toBe(0.7);
      expect(config.max_tokens).toBe(2000);
    });

    it('should load valid breakdown-engine configuration', async () => {
      const config = await service.loadAgentConfig('breakdown-engine');

      expect(config).toBeTruthy();
      expect(config.name).toBe('Breakdown Engine');
      expect(config.model).toBe('gpt-4');
      expect(config.temperature).toBe(0.3);
      expect(config.max_tokens).toBe(4000);
    });

    it('should cache loaded configuration', async () => {
      const config1 = await service.loadAgentConfig('clarifier');
      const config2 = await service.loadAgentConfig('clarifier');

      expect(config1).toBe(config2);
    });

    it('should load from cache on subsequent calls', async () => {
      const firstLoad = await service.loadAgentConfig('breakdown-engine');
      const secondLoad = await service.loadAgentConfig('breakdown-engine');

      expect(firstLoad).toBe(secondLoad);
      expect(service.getCacheSize()).toBe(1);
    });

    it('should load multiple different configurations', async () => {
      const clarifierConfig = await service.loadAgentConfig('clarifier');
      const breakdownConfig = await service.loadAgentConfig('breakdown-engine');

      expect(clarifierConfig.name).toBe('clarifier');
      expect(breakdownConfig.name).toBe('Breakdown Engine');
      expect(clarifierConfig).not.toBe(breakdownConfig);
      expect(service.getCacheSize()).toBe(2);
    });

    it('should throw error for non-existent configuration', async () => {
      await expect(
        service.loadAgentConfig('nonexistent-agent')
      ).rejects.toThrow('Failed to load nonexistent-agent config');
    });

    it('should include agent name in error message', async () => {
      await expect(service.loadAgentConfig('fake-agent')).rejects.toThrow(
        /fake-agent/
      );
    });

    it('should throw error for invalid YAML syntax', async () => {
      const invalidConfigPath = path.join(
        process.cwd(),
        testConfigDir,
        'invalid.yml'
      );
      fs.writeFileSync(invalidConfigPath, 'invalid: yaml: content: [unclosed');

      try {
        await expect(service.loadAgentConfig('invalid')).rejects.toThrow(
          /Failed to load invalid config/
        );
      } finally {
        if (fs.existsSync(invalidConfigPath)) {
          fs.unlinkSync(invalidConfigPath);
        }
      }
    });

    it('should throw error for missing required fields', async () => {
      const incompleteConfigPath = path.join(
        process.cwd(),
        testConfigDir,
        'incomplete.yml'
      );
      fs.writeFileSync(incompleteConfigPath, 'description: Test config');

      try {
        await expect(service.loadAgentConfig('incomplete')).rejects.toThrow(
          /Invalid configuration structure/
        );
      } finally {
        if (fs.existsSync(incompleteConfigPath)) {
          fs.unlinkSync(incompleteConfigPath);
        }
      }
    });

    it('should load config with extended properties', async () => {
      const config = await service.loadAgentConfig('breakdown-engine');

      expect(config).toHaveProperty('estimation_model');
      expect(config).toHaveProperty('dependency_threshold');
      expect(config.estimation_model).toBe('gpt-3.5-turbo');
      expect(config.dependency_threshold).toBe(0.7);
    });

    it('should load config with nested objects', async () => {
      const config = await service.loadAgentConfig('breakdown-engine');

      expect(config).toHaveProperty('prompts');
      expect(config.prompts).toHaveProperty('idea_analysis');
      expect(config.prompts).toHaveProperty('task_decomposition');
    });

    it('should load config with arrays', async () => {
      const config = await service.loadAgentConfig('clarifier');

      expect(config).toHaveProperty('functions');
      const functions = config.functions as unknown[];
      expect(Array.isArray(functions)).toBe(true);
      expect(functions.length).toBeGreaterThan(0);
    });

    it('should support generic type parameter', async () => {
      interface ExtendedConfig extends AgentConfig {
        estimation_model: string;
        dependency_threshold: number;
      }

      const config =
        await service.loadAgentConfig<ExtendedConfig>('breakdown-engine');

      expect(config).toBeTruthy();
      expect(config.estimation_model).toBe('gpt-3.5-turbo');
      expect(config.dependency_threshold).toBe(0.7);
    });
  });

  describe('loadAIModelConfig', () => {
    it('should convert clarifier config to AIModelConfig', async () => {
      const aiConfig = await service.loadAIModelConfig('clarifier');

      expect(aiConfig).toBeTruthy();
      expect(aiConfig.provider).toBe('openai');
      expect(aiConfig.model).toBe('gpt-4');
      expect(aiConfig.maxTokens).toBe(2000);
      expect(aiConfig.temperature).toBe(0.7);
    });

    it('should convert breakdown-engine config to AIModelConfig', async () => {
      const aiConfig = await service.loadAIModelConfig('breakdown-engine');

      expect(aiConfig).toBeTruthy();
      expect(aiConfig.provider).toBe('openai');
      expect(aiConfig.model).toBe('gpt-4');
      expect(aiConfig.maxTokens).toBe(4000);
      expect(aiConfig.temperature).toBe(0.3);
    });

    it('should map max_tokens to maxTokens', async () => {
      const aiConfig = await service.loadAIModelConfig('clarifier');

      expect(aiConfig.maxTokens).toBe(2000);
    });

    it('should map temperature correctly', async () => {
      const clarifierConfig = await service.loadAIModelConfig('clarifier');
      const breakdownConfig =
        await service.loadAIModelConfig('breakdown-engine');

      expect(clarifierConfig.temperature).toBe(0.7);
      expect(breakdownConfig.temperature).toBe(0.3);
    });

    it('should always set provider to openai', async () => {
      const aiConfig1 = await service.loadAIModelConfig('clarifier');
      const aiConfig2 = await service.loadAIModelConfig('breakdown-engine');

      expect(aiConfig1.provider).toBe('openai');
      expect(aiConfig2.provider).toBe('openai');
    });
  });

  describe('reloadAgentConfig', () => {
    it('should reload configuration from disk', async () => {
      const config1 = await service.loadAgentConfig('clarifier');
      await service.reloadAgentConfig('clarifier');
      const config2 = await service.loadAgentConfig('clarifier');

      expect(config1).toEqual(config2);
    });

    it('should update cache after reload', async () => {
      await service.loadAgentConfig('breakdown-engine');
      const cacheSizeBefore = service.getCacheSize();

      await service.reloadAgentConfig('breakdown-engine');
      const cacheSizeAfter = service.getCacheSize();

      expect(cacheSizeBefore).toBe(cacheSizeAfter);
    });

    it('should throw error when reloading non-existent config', async () => {
      await expect(service.reloadAgentConfig('nonexistent')).rejects.toThrow(
        'Failed to load nonexistent config'
      );
    });

    it('should reload and update cached value', async () => {
      const config1 = await service.loadAgentConfig('clarifier');

      await service.reloadAgentConfig('clarifier');
      const config2 = await service.loadAgentConfig('clarifier');

      expect(config1).toEqual(config2);
    });
  });

  describe('configExists', () => {
    it('should return true for existing clarifier config', async () => {
      const exists = await service.configExists('clarifier');
      expect(exists).toBe(true);
    });

    it('should return true for existing breakdown-engine config', async () => {
      const exists = await service.configExists('breakdown-engine');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent config', async () => {
      const exists = await service.configExists('nonexistent');
      expect(exists).toBe(false);
    });

    it('should return false for empty string', async () => {
      const exists = await service.configExists('');
      expect(exists).toBe(false);
    });

    it('should work without loading config first', async () => {
      const exists1 = await service.configExists('clarifier');
      const exists2 = await service.configExists('nonexistent');

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
    });

    it('should check existence without affecting cache', async () => {
      const cacheSizeBefore = service.getCacheSize();
      await service.configExists('clarifier');
      const cacheSizeAfter = service.getCacheSize();

      expect(cacheSizeBefore).toBe(cacheSizeAfter);
    });
  });

  describe('cache management', () => {
    describe('setCacheEnabled', () => {
      it('should disable caching when set to false', async () => {
        service.setCacheEnabled(false);
        const config1 = await service.loadAgentConfig('clarifier');
        const config2 = await service.loadAgentConfig('clarifier');

        expect(config1).not.toBe(config2);
      });

      it('should clear cache when disabled', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');
        expect(service.getCacheSize()).toBeGreaterThan(0);

        service.setCacheEnabled(false);
        expect(service.getCacheSize()).toBe(0);
      });

      it('should re-enable caching when set to true', async () => {
        service.setCacheEnabled(false);
        service.setCacheEnabled(true);

        const config1 = await service.loadAgentConfig('clarifier');
        const config2 = await service.loadAgentConfig('clarifier');

        expect(config1).toBe(config2);
      });

      it('should not clear cache when disabling then enabling', async () => {
        await service.loadAgentConfig('clarifier');
        service.setCacheEnabled(false);
        service.setCacheEnabled(true);

        const config1 = await service.loadAgentConfig('clarifier');
        const config2 = await service.loadAgentConfig('clarifier');

        expect(config1).toBe(config2);
      });
    });

    describe('clearCache', () => {
      it('should clear all cached configurations', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');
        expect(service.getCacheSize()).toBe(2);

        service.clearCache();
        expect(service.getCacheSize()).toBe(0);
      });

      it('should allow reloading after cache clear', async () => {
        const config1 = await service.loadAgentConfig('clarifier');
        service.clearCache();
        const config2 = await service.loadAgentConfig('clarifier');

        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2);
      });

      it('should work when cache is empty', () => {
        expect(() => service.clearCache()).not.toThrow();
        expect(() => service.clearCache()).not.toThrow();
      });

      it('should clear all entries regardless of count', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');

        expect(service.getCacheSize()).toBeGreaterThan(0);

        service.clearCache();
        expect(service.getCacheSize()).toBe(0);
      });
    });

    describe('getCacheSize', () => {
      it('should return 0 when cache is empty', () => {
        expect(service.getCacheSize()).toBe(0);
      });

      it('should return 1 after loading one config', async () => {
        await service.loadAgentConfig('clarifier');
        expect(service.getCacheSize()).toBe(1);
      });

      it('should return 2 after loading two different configs', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');
        expect(service.getCacheSize()).toBe(2);
      });

      it('should not increase when loading same config', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('clarifier');
        expect(service.getCacheSize()).toBe(1);
      });

      it('should decrease after cache clear', async () => {
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');
        expect(service.getCacheSize()).toBe(2);

        service.clearCache();
        expect(service.getCacheSize()).toBe(0);
      });

      it('should work correctly with cache disabled', async () => {
        service.setCacheEnabled(false);
        await service.loadAgentConfig('clarifier');
        await service.loadAgentConfig('breakdown-engine');

        expect(service.getCacheSize()).toBe(0);
      });
    });
  });

  describe('configuration path handling', () => {
    it('should use default config directory', async () => {
      const defaultService = new ConfigurationService();
      const config = await defaultService.loadAgentConfig('clarifier');

      expect(config).toBeTruthy();
      expect(config.name).toBe('clarifier');
    });

    it('should accept custom config directory', async () => {
      const customService = new ConfigurationService(testConfigDir);
      const config = await customService.loadAgentConfig('clarifier');

      expect(config).toBeTruthy();
      expect(config.name).toBe('clarifier');
    });

    it('should throw error for invalid config directory', async () => {
      const invalidService = new ConfigurationService('invalid/directory/path');

      await expect(
        invalidService.loadAgentConfig('clarifier')
      ).rejects.toThrow();
    });
  });

  describe('exported configurationService instance', () => {
    it('should be a singleton instance', () => {
      expect(configurationService).toBeInstanceOf(ConfigurationService);
    });

    it('should work like regular ConfigurationService instance', async () => {
      const config = await configurationService.loadAgentConfig('clarifier');

      expect(config).toBeTruthy();
      expect(config.name).toBe('clarifier');
    });

    it('should support cache management', async () => {
      configurationService.clearCache();
      await configurationService.loadAgentConfig('breakdown-engine');

      expect(configurationService.getCacheSize()).toBe(1);
    });

    it('should support configExists', async () => {
      const exists = await configurationService.configExists('clarifier');
      expect(exists).toBe(true);
    });

    it('should support loadAIModelConfig', async () => {
      const aiConfig =
        await configurationService.loadAIModelConfig('clarifier');

      expect(aiConfig).toBeTruthy();
      expect(aiConfig.model).toBe('gpt-4');
    });
  });

  describe('integration tests', () => {
    it('should complete full workflow: load, cache, reload, clear', async () => {
      const config1 = await configurationService.loadAgentConfig('clarifier');
      const config2 = await configurationService.loadAgentConfig('clarifier');

      expect(config1).toBe(config2);

      await configurationService.reloadAgentConfig('clarifier');
      const config3 = await configurationService.loadAgentConfig('clarifier');

      expect(config3).toEqual(config1);

      configurationService.clearCache();
      expect(configurationService.getCacheSize()).toBe(0);
    });

    it('should handle multiple agents independently', async () => {
      const clarifierConfig =
        await configurationService.loadAgentConfig('clarifier');
      const breakdownConfig =
        await configurationService.loadAgentConfig('breakdown-engine');

      expect(clarifierConfig.name).toBe('clarifier');
      expect(breakdownConfig.name).toBe('Breakdown Engine');
      expect(configurationService.getCacheSize()).toBe(2);
    });

    it('should work with cache disabled throughout', async () => {
      configurationService.setCacheEnabled(false);

      const config1 = await configurationService.loadAgentConfig('clarifier');
      const config2 = await configurationService.loadAgentConfig('clarifier');

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
      expect(configurationService.getCacheSize()).toBe(0);
    });

    it('should maintain state between cache enable/disable cycles', async () => {
      await configurationService.loadAgentConfig('clarifier');
      const cacheSizeBefore = configurationService.getCacheSize();

      configurationService.setCacheEnabled(false);
      configurationService.setCacheEnabled(true);

      expect(configurationService.getCacheSize()).toBe(cacheSizeBefore);
    });
  });
});
