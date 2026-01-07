import fs from 'fs';
import path from 'path';

class PromptService {
  private cache: Map<string, string> = new Map();
  private cacheEnabled: boolean = true;
  private promptsDir: string;

  constructor(promptsDir: string = 'src/lib/prompts') {
    this.promptsDir = promptsDir;
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

  private getPromptPath(agentName: string, promptName: string): string {
    return path.join(process.cwd(), this.promptsDir, agentName, promptName);
  }

  private loadFromDisk(agentName: string, promptName: string): string {
    const promptPath = this.getPromptPath(agentName, promptName);

    try {
      const promptContent = fs.readFileSync(promptPath, 'utf8');
      return promptContent;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to load prompt ${agentName}/${promptName}: ${message}`
      );
    }
  }

  private interpolateVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const valueString =
        typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);
      result = result.replace(new RegExp(placeholder, 'g'), valueString);
    }

    return result;
  }

  loadPrompt(
    agentName: string,
    promptName: string,
    variables?: Record<string, any>
  ): string {
    const cacheKey = `${agentName}/${promptName}`;

    let template: string;

    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      template = this.cache.get(cacheKey)!;
    } else {
      template = this.loadFromDisk(agentName, promptName);

      if (this.cacheEnabled) {
        this.cache.set(cacheKey, template);
      }
    }

    if (variables) {
      return this.interpolateVariables(template, variables);
    }

    return template;
  }

  loadSystemPrompt(agentName: string): string {
    return this.loadPrompt(agentName, 'system.txt');
  }

  reloadPrompt(agentName: string, promptName: string): void {
    const template = this.loadFromDisk(agentName, promptName);
    const cacheKey = `${agentName}/${promptName}`;

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, template);
    }
  }

  promptExists(agentName: string, promptName: string): boolean {
    const promptPath = this.getPromptPath(agentName, promptName);
    return fs.existsSync(promptPath);
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const promptService = new PromptService();
export { PromptService };
