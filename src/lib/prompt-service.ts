import fs from 'fs';
import path from 'path';

export interface PromptVariable {
  [key: string]: string | number | object;
}

export class PromptService {
  private promptsCache: Map<string, string> = new Map();

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

  loadTemplate(
    agent: string,
    templateName: string,
    role: 'system' | 'user'
  ): string {
    const cacheKey = `${agent}:${templateName}:${role}`;

    if (this.promptsCache.has(cacheKey)) {
      return this.promptsCache.get(cacheKey)!;
    }

    const templatePath = this.getTemplatePath(agent, templateName, role);

    try {
      const content = fs.readFileSync(templatePath, 'utf-8');
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

  getPrompt(
    agent: string,
    templateName: string,
    role: 'system' | 'user',
    variables?: PromptVariable
  ): string {
    const template = this.loadTemplate(agent, templateName, role);

    if (variables && Object.keys(variables).length > 0) {
      return this.interpolate(template, variables);
    }

    return template;
  }

  getSystemPrompt(agent: string, templateName: string): string {
    return this.getPrompt(agent, templateName, 'system');
  }

  getUserPrompt(
    agent: string,
    templateName: string,
    variables: PromptVariable
  ): string {
    return this.getPrompt(agent, templateName, 'user', variables);
  }

  clearCache(): void {
    this.promptsCache.clear();
  }
}

export const promptService = new PromptService();
