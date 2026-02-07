import { TIMEOUT_CONFIG } from '../config/constants';
import {
  resilienceManager,
  defaultResilienceConfigs,
  ResilienceConfig,
  type ServiceResilienceConfig,
} from '../resilience';
import { createLogger } from '../logger';
import { Idea, Deliverable, Task } from '../db';

function toResilienceConfig(config: ServiceResilienceConfig): ResilienceConfig {
  return {
    timeoutMs: config.timeout.timeoutMs,
    maxRetries: config.retry.maxRetries,
    baseDelayMs: config.retry.baseDelayMs,
    maxDelayMs: config.retry.maxDelayMs,
    failureThreshold: config.circuitBreaker.failureThreshold,
    resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
  };
}

const logger = createLogger('ExportConnector');

export interface ExportData {
  idea: Omit<Idea, 'user_id'>;
  deliverables?: Deliverable[];
  tasks?: Task[];
  goals?: string[];
  target_audience?: string;
  roadmap?: Array<{
    phase: string;
    start: string;
    end: string;
    deliverables: string[];
  }>;
  metadata?: {
    exported_at: string;
    version: string;
  };
}

export interface ExportFormat {
  type:
    | 'markdown'
    | 'json'
    | 'notion'
    | 'trello'
    | 'google-tasks'
    | 'github-projects';
  data: ExportData;
  metadata?: Record<string, unknown>;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  id?: string;
  content?: string;
  error?: string;
}

export interface SyncStatus {
  lastSync?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export interface AuthConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
}

export abstract class ExportConnector {
  abstract readonly type: string;
  abstract readonly name: string;

  abstract export(
    data: ExportData,
    options?: Record<string, unknown>
  ): Promise<ExportResult>;
  abstract validateConfig(): Promise<boolean>;
  abstract getAuthUrl?(): Promise<string>;
  abstract handleAuthCallback?(code: string): Promise<void>;

  protected getResilienceConfig(): ResilienceConfig {
    const type = this.type;
    if (type === 'notion') {
      return toResilienceConfig(defaultResilienceConfigs.notion);
    }
    if (type === 'trello') {
      return toResilienceConfig(defaultResilienceConfigs.trello);
    }
    if (type === 'github-projects') {
      return toResilienceConfig(defaultResilienceConfigs.github);
    }
    if (type === 'google-tasks') {
      return toResilienceConfig(defaultResilienceConfigs.github);
    }
    return {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      timeoutMs: TIMEOUT_CONFIG.DEFAULT,
      failureThreshold: 5,
      resetTimeoutMs: 60000,
    };
  }

  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const config = this.getResilienceConfig();
    return resilienceManager.execute(
      operation,
      config,
      `${this.type}-${context || 'operation'}`
    );
  }

  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = TIMEOUT_CONFIG.DEFAULT
  ): Promise<T> {
    logger.warn(
      `[DEPRECATED] executeWithTimeout is deprecated. Use executeWithResilience instead.`
    );
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await operation();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
