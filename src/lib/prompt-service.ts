import { readFile } from 'fs/promises';
import path from 'path';
import { Cache } from './cache';
import { CACHE_CONFIG } from './config';

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

  private getTemplatePath(
    agent: string,
    templateName: string,
    role: 'system' | 'user'
  ): string {
    return path.join(
      process.cwd(),
      'src',
      'lib',
      'prompts',
      agent,
      `${templateName}-${role}.txt`
    );
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

    const templatePath = this.getTemplatePath(agent, templateName, role);

    try {
      const content = await readFile(templatePath, 'utf-8');
      this.promptsCache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(
        `Failed to load prompt template: ${templatePath}. ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
