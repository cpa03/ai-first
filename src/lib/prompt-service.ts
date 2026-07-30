import fs from 'node:fs';
import path from 'node:path';
import { Cache } from './cache';
import { CACHE_CONFIG, API_ERROR_MESSAGES } from './config';

export interface PromptVariable {
  [key: string]: string | number | object;
}

export type TemplateChunk = string | { key: string; raw: string };

/**
 * PERFORMANCE: O(1) Map-based cache for pre-compiled template chunks to completely
 * eliminate regex-based scanning and matching overhead for frequently used prompts.
 * Uses a fixed-size cache (capped at 500 entries) to prevent memory leaks.
 */
const templateChunksCache = new Map<string, TemplateChunk[]>();

/**
 * High-performance template parser that compiles a template string into
 * literal text chunks and variable key placeholders.
 */
export function parseTemplate(template: string): TemplateChunk[] {
  const cached = templateChunksCache.get(template);
  if (cached) {
    return cached;
  }

  const chunks: TemplateChunk[] = [];
  const regex = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      chunks.push(template.substring(lastIndex, matchIndex));
    }
    chunks.push({ key: match[1], raw: match[0] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    chunks.push(template.substring(lastIndex));
  }

  if (
    templateChunksCache.size >=
    CACHE_CONFIG.SERVICES.PROMPT.CHUNK_CACHE_MAX_SIZE
  ) {
    const firstKey = templateChunksCache.keys().next().value;
    if (firstKey !== undefined) {
      templateChunksCache.delete(firstKey);
    }
  }
  templateChunksCache.set(template, chunks);

  return chunks;
}

/**
 * Clears the pre-compiled template chunks cache.
 */
export function clearTemplateChunksCache(): void {
  templateChunksCache.clear();
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
      const content = await fs.promises.readFile(templatePath, 'utf-8');
      this.promptsCache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(
        `Failed to load prompt template: ${templatePath}. ${error instanceof Error ? error.message : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR}`
      );
    }
  }

  interpolate(template: string, variables: PromptVariable): string {
    // PERFORMANCE: Optimized template interpolation using pre-compiled chunks.
    // Bypasses the overhead of String.prototype.replace(RegExp, Function) and
    // associated callback function creation/invocation.
    const chunks = parseTemplate(template);
    let result = '';

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (typeof chunk === 'string') {
        result += chunk;
      } else {
        const key = chunk.key;
        if (Object.prototype.hasOwnProperty.call(variables, key)) {
          const value = variables[key];
          result +=
            typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value);
        } else {
          result += chunk.raw;
        }
      }
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
    clearTemplateChunksCache();
  }

  getCacheStats(): ReturnType<Cache<string>['getStats']> {
    return this.promptsCache.getStats();
  }
}

export const promptService = new PromptService();
