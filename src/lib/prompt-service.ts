import { Cache } from './cache';
import { CACHE_CONFIG } from './config';
import { STATIC_PROMPTS } from './prompts/index';

export interface PromptVariable {
  [key: string]: string | number | object;
}

export class PromptService {
  private promptsCache: Cache<string>;

  constructor() {
    this.promptsCache = new Cache<string>({
      ttl: CACHE_CONFIG.SERVICES.PROMPT.TTL_MS,
      maxSize: CACHE_CONFIG.SERVICES.PROMPT.MAX_SIZE,
    });
  }

  async loadTemplate(
    agent: string,
    templateName: string,
    role: 'system' | 'user'
  ): Promise<string> {
    const cacheKey = `${agent}:${templateName}:${role}`;

    const cached = this.promptsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // PERFORMANCE: Use bundled STATIC_PROMPTS instead of file system (node:fs)
    // for edge compatibility and faster cold starts.
    const content = STATIC_PROMPTS[cacheKey];

    if (!content) {
      throw new Error(`Failed to load prompt template: ${cacheKey}`);
    }

    this.promptsCache.set(cacheKey, content);
    return content;
  }

  interpolate(template: string, variables: PromptVariable): string {
    // Single-pass regex replacement to optimize from O(V * T) to O(T),
    // where V is the number of variables and T is the template length.
    // Using [^{}]+ to avoid matching across multiple placeholders or nested braces.
    return template.replace(/\{([^{}]+)\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        const value = variables[key];
        return typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);
      }
      return match;
    });
  }

  async getPrompt(
    agent: string,
    templateName: string,
    role: 'system' | 'user',
    variables?: PromptVariable
  ): Promise<string> {
    const template = await this.loadTemplate(agent, templateName, role);

    if (variables && Object.keys(variables).length > 0) {
      return this.interpolate(template, variables);
    }

    return template;
  }

  async getSystemPrompt(agent: string, templateName: string): Promise<string> {
    return this.getPrompt(agent, templateName, 'system');
  }

  async getUserPrompt(
    agent: string,
    templateName: string,
    variables: PromptVariable
  ): Promise<string> {
    return this.getPrompt(agent, templateName, 'user', variables);
  }

  clearCache(): void {
    this.promptsCache.clear();
  }

  getCacheStats(): ReturnType<Cache<string>['getStats']> {
    return this.promptsCache.getStats();
  }
}

export const promptService = new PromptService();
