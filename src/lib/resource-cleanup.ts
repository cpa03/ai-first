/**
 * Resource Cleanup Manager
 *
 * Provides utilities for managing resource cleanup, preventing memory leaks,
 * and ensuring proper cleanup of async operations.
 */

import { CLEANUP_CONFIG } from './config';
import { createLogger } from './logger';

const logger = createLogger('ResourceCleanupManager');

export interface CleanupTask {
  id: string;
  cleanup: () => void | Promise<void>;
  priority: number;
}

export class ResourceCleanupManager {
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private isCleaningUp = false;

  private static instance: ResourceCleanupManager;

  static getInstance(): ResourceCleanupManager {
    if (!ResourceCleanupManager.instance) {
      ResourceCleanupManager.instance = new ResourceCleanupManager();
    }
    return ResourceCleanupManager.instance;
  }

  /**
   * Register a cleanup task to be executed on shutdown
   */
  register(
    id: string,
    cleanup: () => void | Promise<void>,
    priority: number = CLEANUP_CONFIG.RESOURCE_MANAGER.DEFAULT_PRIORITY
  ): void {
    if (this.isCleaningUp) {
      logger.warn(`Cannot register task '${id}' during cleanup`);
      return;
    }

    this.cleanupTasks.set(id, { id, cleanup, priority });
  }

  /**
   * Unregister a cleanup task
   */
  unregister(id: string): void {
    this.cleanupTasks.delete(id);
  }

  /**
   * Execute all cleanup tasks in priority order
   */
  async cleanup(): Promise<void> {
    if (this.isCleaningUp) {
      logger.warn('Cleanup already in progress');
      return;
    }

    this.isCleaningUp = true;

    // Sort by priority (higher priority first)
    const tasks = Array.from(this.cleanupTasks.values()).sort(
      (a, b) => b.priority - a.priority
    );

    const errors: { id: string; error: Error }[] = [];

    for (const task of tasks) {
      try {
        await Promise.race([
          task.cleanup(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Cleanup timeout for ${task.id}`)),
              CLEANUP_CONFIG.RESOURCE_MANAGER.TASK_TIMEOUT_MS
            )
          ),
        ]);
      } catch (error) {
        errors.push({
          id: task.id,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    this.cleanupTasks.clear();
    this.isCleaningUp = false;

    if (errors.length > 0) {
      logger.error(`Cleanup completed with ${errors.length} errors`, errors);
      throw new Error(`Cleanup completed with ${errors.length} errors`);
    }
  }

  /**
   * Get the number of registered cleanup tasks
   */
  getTaskCount(): number {
    return this.cleanupTasks.size;
  }

  /**
   * Check if cleanup is in progress
   */
  isCleanupInProgress(): boolean {
    return this.isCleaningUp;
  }
}

/**
 * Abortable timeout utility
 */
export function createAbortableTimeout(
  ms: number,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          reject(new Error('Timeout aborted'));
        },
        { once: true }
      );
    }
  });
}

/**
 * Cleanup function type
 */
export type CleanupFunction = () => void | Promise<void>;

/**
 * Async resource wrapper with automatic cleanup
 */
export async function withCleanup<T>(
  acquire: () => Promise<T>,
  cleanup: (resource: T) => void | Promise<void>,
  operation: (resource: T) => Promise<T>
): Promise<T> {
  let resource: T | undefined;

  try {
    resource = await acquire();
    return await operation(resource);
  } finally {
    if (resource !== undefined) {
      await cleanup(resource);
    }
  }
}

/**
 * Timeout wrapper with cleanup
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }),
    timeoutPromise,
  ]);
}

// Export singleton instance
export const resourceCleanupManager = ResourceCleanupManager.getInstance();
