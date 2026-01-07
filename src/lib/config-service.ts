import { AIModelConfig } from './ai';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  [key: string]: any;
}

class ConfigurationService {
  private cache: Map<string, AgentConfig> = new Map();
  private cacheEnabled: boolean = true;
  private configDir: string;

  constructor(configDir: string = 'ai/agent-configs') {
    this.configDir = configDir;
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
    return path.join(process.cwd(), this.configDir, `${agentName}.yml`);
  }

  private loadFromDisk(agentName: string): AgentConfig {
    const configPath = this.getConfigPath(agentName);

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
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

  loadAgentConfig<T extends AgentConfig = AgentConfig>(agentName: string): T {
    if (this.cacheEnabled && this.cache.has(agentName)) {
      return this.cache.get(agentName) as T;
    }

    const config = this.loadFromDisk(agentName);

    if (this.cacheEnabled) {
      this.cache.set(agentName, config);
    }

    return config as T;
  }

  loadAIModelConfig(agentName: string): AIModelConfig {
    const agentConfig = this.loadAgentConfig(agentName);

    return {
      provider: 'openai',
      model: agentConfig.model,
      maxTokens: agentConfig.max_tokens,
      temperature: agentConfig.temperature,
    };
  }

  reloadAgentConfig(agentName: string): void {
    const config = this.loadFromDisk(agentName);
    if (this.cacheEnabled) {
      this.cache.set(agentName, config);
    }
  }

  configExists(agentName: string): boolean {
    const configPath = this.getConfigPath(agentName);
    return fs.existsSync(configPath);
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const configurationService = new ConfigurationService();
export { ConfigurationService };
export type { AgentConfig };
