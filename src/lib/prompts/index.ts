import { promises as fs } from 'fs';
import path from 'path';

interface PromptTemplate {
  id: string;
  content: string;
}

const TEMPLATE_CACHE = new Map<string, string>();

const TEMPLATES_DIR = path.join(__dirname, 'prompts');

export class PromptService {
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || TEMPLATES_DIR;
  }

  async loadTemplate(templatePath: string): Promise<string> {
    const cacheKey = templatePath;

    if (TEMPLATE_CACHE.has(cacheKey)) {
      return TEMPLATE_CACHE.get(cacheKey)!;
    }

    const fullPath = path.join(this.templatesDir, templatePath);
    const content = await fs.readFile(fullPath, 'utf-8');

    TEMPLATE_CACHE.set(cacheKey, content);
    return content;
  }

  interpolateTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return result;
  }

  async loadAndInterpolate(
    templatePath: string,
    variables: Record<string, any>
  ): Promise<string> {
    const template = await this.loadTemplate(templatePath);
    return this.interpolateTemplate(template, variables);
  }

  clearCache(): void {
    TEMPLATE_CACHE.clear();
  }

  getCachedTemplates(): string[] {
    return Array.from(TEMPLATE_CACHE.keys());
  }
}

export const promptService = new PromptService();
