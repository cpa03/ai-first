import { AIModelConfig } from './ai';
import yaml from 'js-yaml';
import { readFile, access } from 'fs/promises';
import path from 'path';
import { Cache } from './cache';
import { CACHE_CONFIG } from './config';

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  [key: string]: unknown;
}

class ConfigurationService {
  private cache: Cache<AgentConfig>;
  private cacheEnabled: boolean = true;
  private configDir: string;

  constructor(configDir: string = 'ai/agent-configs') {
    this.configDir = configDir;
    this.cache = new Cache<AgentConfig>({
      ttl: CACHE_CONFIG.SERVICES.CONFIG.TTL_MS,
      maxSize: CACHE_CONFIG.SERVICES.CONFIG.MAX_SIZE,
    });
  }

  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getConfigPath(agentName: string): string {
    // Sanitize agentName to prevent path traversal
    const sanitizedName = agentName.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedName) {
      throw new Error(`Invalid agent name: ${agentName}`);
    }
    return path.join(process.cwd(), this.configDir, `${sanitizedName}.yml`);
  }

  private async loadFromDisk(agentName: string): Promise<AgentConfig> {
    const configPath = this.getConfigPath(agentName);

    try {
      const configContent = await readFile(configPath, 'utf8');
      const config = yaml.load(configContent) as AgentConfig;

      if (!config || !config.name || !config.model) {
        throw new Error(`Invalid configuration structure for ${agentName}`);
      }

      return config;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load ${agentName} config: ${message}`);
    }
  }

  async loadAgentConfig<T extends AgentConfig = AgentConfig>(
    agentName: string
  ): Promise<T> {
    if (this.cacheEnabled) {
      const cached = this.cache.get(agentName);
      if (cached) {
        return cached as T;
      }
    }

    const config = await this.loadFromDisk(agentName);

    if (this.cacheEnabled) {
      this.cache.set(agentName, config);
    }

    return config as T;
  }

  async loadAIModelConfig(agentName: string): Promise<AIModelConfig> {
    const agentConfig = await this.loadAgentConfig(agentName);

    return {
      provider: 'openai',
      model: agentConfig.model,
      maxTokens: agentConfig.max_tokens,
      temperature: agentConfig.temperature,
    };
  }

  async reloadAgentConfig(agentName: string): Promise<void> {
    const config = await this.loadFromDisk(agentName);
    if (this.cacheEnabled) {
      this.cache.set(agentName, config);
    }
  }

  async configExists(agentName: string): Promise<boolean> {
    try {
      const configPath = this.getConfigPath(agentName);
      await access(configPath);
      return true;
    } catch {
      return false;
    }
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheStats(): ReturnType<Cache<AgentConfig>['getStats']> {
    return this.cache.getStats();
  }
}

export const configurationService = new ConfigurationService();
export { ConfigurationService };
export type { AgentConfig };
