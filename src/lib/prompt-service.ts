import { readFile } from 'fs/promises';
import path from 'path';
import { Cache } from './cache';

export interface PromptVariable {
  [key: string]: string | number | object;
}

export class PromptService {
  private promptsCache: Cache<string>;

  constructor() {
    this.promptsCache = new Cache<string>({
      ttl: 10 * 60 * 1000,
      maxSize: 200,
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
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      const valueStr =
        typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);
      result = result.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        valueStr
      );
    }

    return result;
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
