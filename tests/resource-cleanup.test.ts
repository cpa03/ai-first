/**
 * Unit tests for Resource Cleanup Manager
 *
 * Tests the utility functions for managing resource cleanup, preventing memory leaks,
 * and ensuring proper cleanup of async operations.
 */

import {
  ResourceCleanupManager,
  createAbortableTimeout,
  withCleanup,
  withTimeout,
  resourceCleanupManager,
} from '@/lib/resource-cleanup';

// Mock the logger to avoid console noise in tests
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('ResourceCleanupManager', () => {
  let manager: ResourceCleanupManager;

  beforeEach(() => {
    // Get a fresh instance for each test by resetting the singleton
    (ResourceCleanupManager as any).instance = undefined;
    manager = ResourceCleanupManager.getInstance();
  });

  afterEach(() => {
    // Clean up after each test
    manager.unregister('test-task');
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = ResourceCleanupManager.getInstance();
      const instance2 = ResourceCleanupManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register a cleanup task', () => {
      const cleanup = jest.fn();
      manager.register('test-task', cleanup);
      expect(manager.getTaskCount()).toBe(1);
    });

    it('should register multiple cleanup tasks', () => {
      manager.register('task-1', jest.fn());
      manager.register('task-2', jest.fn());
      expect(manager.getTaskCount()).toBe(2);
    });

    it('should not register task during cleanup', async () => {
      const cleanup = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      manager.register('blocking-task', cleanup);

      // Start cleanup (don't await yet)
      const cleanupPromise = manager.cleanup();

      // Try to register a new task during cleanup
      manager.register('new-task', jest.fn());

      await cleanupPromise;

      // New task should not be registered (still 0 after cleanup clears)
      expect(manager.getTaskCount()).toBe(0);
    });
  });

  describe('unregister', () => {
    it('should unregister a cleanup task', () => {
      manager.register('test-task', jest.fn());
      expect(manager.getTaskCount()).toBe(1);

      manager.unregister('test-task');
      expect(manager.getTaskCount()).toBe(0);
    });

    it('should handle unregistering non-existent task', () => {
      expect(() => manager.unregister('non-existent')).not.toThrow();
      expect(manager.getTaskCount()).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should execute cleanup tasks in priority order', async () => {
      const order: string[] = [];

      manager.register(
        'low-priority',
        () => {
          order.push('low');
        },
        1
      );
      manager.register(
        'high-priority',
        () => {
          order.push('high');
        },
        10
      );
      manager.register(
        'medium-priority',
        () => {
          order.push('medium');
        },
        5
      );

      await manager.cleanup();

      expect(order).toEqual(['high', 'medium', 'low']);
    });

    it('should execute async cleanup tasks', async () => {
      const cleanup = jest.fn().mockResolvedValue(undefined);
      manager.register('async-task', cleanup);

      await manager.cleanup();

      expect(cleanup).toHaveBeenCalled();
    });

    it('should clear tasks after cleanup', async () => {
      manager.register('task-1', jest.fn());
      manager.register('task-2', jest.fn());

      expect(manager.getTaskCount()).toBe(2);

      await manager.cleanup();

      expect(manager.getTaskCount()).toBe(0);
    });

    it('should handle cleanup errors gracefully', async () => {
      const failingCleanup = jest
        .fn()
        .mockRejectedValue(new Error('Cleanup failed'));
      manager.register('failing-task', failingCleanup);

      await expect(manager.cleanup()).rejects.toThrow(
        'Cleanup completed with 1 errors'
      );
    });

    it('should not run cleanup twice concurrently', async () => {
      const cleanup = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      manager.register('slow-task', cleanup);

      // Start two cleanups concurrently
      const cleanup1 = manager.cleanup();
      const cleanup2 = manager.cleanup();

      await Promise.all([cleanup1, cleanup2]);

      // Cleanup should only be called once (second call returns early)
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTaskCount', () => {
    it('should return 0 when no tasks registered', () => {
      expect(manager.getTaskCount()).toBe(0);
    });

    it('should return correct count after registration', () => {
      manager.register('task-1', jest.fn());
      manager.register('task-2', jest.fn());
      expect(manager.getTaskCount()).toBe(2);
    });
  });

  describe('isCleanupInProgress', () => {
    it('should return false when no cleanup is running', () => {
      expect(manager.isCleanupInProgress()).toBe(false);
    });

    it('should return true during cleanup', async () => {
      const cleanup = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      manager.register('slow-task', cleanup);

      const cleanupPromise = manager.cleanup();

      // During cleanup
      expect(manager.isCleanupInProgress()).toBe(true);

      await cleanupPromise;

      // After cleanup
      expect(manager.isCleanupInProgress()).toBe(false);
    });
  });
});

describe('createAbortableTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve after timeout', async () => {
    const promise = createAbortableTimeout(1000);

    jest.advanceTimersByTime(1000);

    await expect(promise).resolves.toBeUndefined();
  });

  it('should reject when aborted', async () => {
    const controller = new AbortController();
    const promise = createAbortableTimeout(1000, controller.signal);

    controller.abort();

    await expect(promise).rejects.toThrow('Timeout aborted');
  });

  it('should clear timeout when aborted', async () => {
    const controller = new AbortController();
    const promise = createAbortableTimeout(1000, controller.signal);

    controller.abort();

    // Advance time past the timeout - should not resolve
    jest.advanceTimersByTime(2000);

    await expect(promise).rejects.toThrow('Timeout aborted');
  });
});

describe('withCleanup', () => {
  it('should acquire resource, execute operation, and cleanup', async () => {
    const resource = { id: 'test-resource' };
    const acquire = jest.fn().mockResolvedValue(resource);
    const cleanup = jest.fn();
    const operation = jest.fn().mockResolvedValue('result');

    const result = await withCleanup(acquire, cleanup, operation);

    expect(acquire).toHaveBeenCalled();
    expect(operation).toHaveBeenCalledWith(resource);
    expect(cleanup).toHaveBeenCalledWith(resource);
    expect(result).toBe('result');
  });

  it('should cleanup even if operation fails', async () => {
    const resource = { id: 'test-resource' };
    const acquire = jest.fn().mockResolvedValue(resource);
    const cleanup = jest.fn();
    const operation = jest
      .fn()
      .mockRejectedValue(new Error('Operation failed'));

    await expect(withCleanup(acquire, cleanup, operation)).rejects.toThrow(
      'Operation failed'
    );

    expect(cleanup).toHaveBeenCalledWith(resource);
  });

  it('should cleanup even if acquire fails', async () => {
    const acquire = jest.fn().mockRejectedValue(new Error('Acquire failed'));
    const cleanup = jest.fn();
    const operation = jest.fn();

    await expect(withCleanup(acquire, cleanup, operation)).rejects.toThrow(
      'Acquire failed'
    );

    // Cleanup should not be called if acquire failed (no resource to clean up)
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('should handle async cleanup', async () => {
    const resource = { id: 'test-resource' };
    const acquire = jest.fn().mockResolvedValue(resource);
    const cleanup = jest.fn().mockResolvedValue(undefined);
    const operation = jest.fn().mockResolvedValue('result');

    await withCleanup(acquire, cleanup, operation);

    expect(cleanup).toHaveBeenCalledWith(resource);
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve if promise completes before timeout', async () => {
    const promise = Promise.resolve('result');

    const result = await withTimeout(promise, 1000);

    expect(result).toBe('result');
  });

  it('should reject if timeout expires before promise completes', async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));

    const timeoutPromise = withTimeout(promise, 1000, 'Custom timeout message');

    jest.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('Custom timeout message');
  });

  it('should use default error message if not provided', async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));

    const timeoutPromise = withTimeout(promise, 1000);

    jest.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('Operation timed out');
  });

  it('should clear timeout when promise resolves', async () => {
    const promise = Promise.resolve('result');

    await withTimeout(promise, 1000);

    // Advance time past timeout - no error should occur
    jest.advanceTimersByTime(2000);

    // Test passes if no unhandled rejection occurs
  });

  it('should clear timeout when promise rejects', async () => {
    const promise = Promise.reject(new Error('Promise failed'));

    await expect(withTimeout(promise, 1000)).rejects.toThrow('Promise failed');

    // Advance time past timeout - no error should occur
    jest.advanceTimersByTime(2000);

    // Test passes if no unhandled rejection occurs
  });
});

describe('resourceCleanupManager singleton', () => {
  it('should export a singleton instance', () => {
    expect(resourceCleanupManager).toBeInstanceOf(ResourceCleanupManager);
  });

  it('should be the same instance when called multiple times', () => {
    const instance1 = ResourceCleanupManager.getInstance();
    const instance2 = ResourceCleanupManager.getInstance();
    expect(instance1).toBe(instance2);
  });
});
