import { CircuitBreakerManager, CircuitBreaker } from '@/lib/resilience';
import { CircuitBreakerState } from '@/lib/resilience/types';

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    manager = new CircuitBreakerManager();
  });

  describe('getOrCreate', () => {
    it('should create a new circuit breaker', () => {
      const cb = manager.getOrCreate('test-service');
      expect(cb).toBeInstanceOf(CircuitBreaker);
      expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should return existing circuit breaker for same name', () => {
      const cb1 = manager.getOrCreate('test-service');
      const cb2 = manager.getOrCreate('test-service');
      expect(cb1).toBe(cb2);
    });

    it('should create different circuit breakers for different names', () => {
      const cb1 = manager.getOrCreate('service-1');
      const cb2 = manager.getOrCreate('service-2');
      expect(cb1).not.toBe(cb2);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent circuit breaker', () => {
      const cb = manager.get('non-existent');
      expect(cb).toBeUndefined();
    });

    it('should return existing circuit breaker', () => {
      const created = manager.getOrCreate('test-service');
      const retrieved = manager.get('test-service');
      expect(retrieved).toBe(created);
    });
  });

  describe('remove', () => {
    it('should remove an existing circuit breaker', () => {
      manager.getOrCreate('test-service');
      expect(manager.get('test-service')).toBeDefined();

      manager.remove('test-service');
      expect(manager.get('test-service')).toBeUndefined();
    });

    it('should not throw when removing non-existent circuit breaker', () => {
      expect(() => manager.remove('non-existent')).not.toThrow();
    });

    it('should allow recreating after removal', () => {
      const cb1 = manager.getOrCreate('test-service');
      manager.remove('test-service');
      const cb2 = manager.getOrCreate('test-service');

      expect(cb1).not.toBe(cb2);
      expect(cb2.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('getNames', () => {
    it('should return empty array when no circuit breakers exist', () => {
      const names = manager.getNames();
      expect(names).toEqual([]);
    });

    it('should return all circuit breaker names', () => {
      manager.getOrCreate('service-1');
      manager.getOrCreate('service-2');
      manager.getOrCreate('service-3');

      const names = manager.getNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('service-1');
      expect(names).toContain('service-2');
      expect(names).toContain('service-3');
    });

    it('should not include removed circuit breakers', () => {
      manager.getOrCreate('service-1');
      manager.getOrCreate('service-2');
      manager.remove('service-1');

      const names = manager.getNames();
      expect(names).toHaveLength(1);
      expect(names).toContain('service-2');
      expect(names).not.toContain('service-1');
    });
  });

  describe('getSize', () => {
    it('should return 0 when empty', () => {
      expect(manager.getSize()).toBe(0);
    });

    it('should return correct count of circuit breakers', () => {
      manager.getOrCreate('service-1');
      manager.getOrCreate('service-2');
      expect(manager.getSize()).toBe(2);
    });

    it('should decrease after removal', () => {
      manager.getOrCreate('service-1');
      manager.getOrCreate('service-2');
      expect(manager.getSize()).toBe(2);

      manager.remove('service-1');
      expect(manager.getSize()).toBe(1);
    });
  });

  describe('getAllStatuses', () => {
    it('should return empty object when no circuit breakers exist', () => {
      const statuses = manager.getAllStatuses();
      expect(statuses).toEqual({});
    });

    it('should return statuses for all circuit breakers', () => {
      manager.getOrCreate('service-1');
      manager.getOrCreate('service-2');

      const statuses = manager.getAllStatuses();
      expect(Object.keys(statuses)).toHaveLength(2);
      expect(statuses['service-1']).toBeDefined();
      expect(statuses['service-2']).toBeDefined();
      expect(statuses['service-1'].state).toBe(CircuitBreakerState.CLOSED);
      expect(statuses['service-2'].state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('reset', () => {
    it('should reset a specific circuit breaker', async () => {
      const cb = manager.getOrCreate('test-service', {
        failureThreshold: 1,
        resetTimeoutMs: 1000,
        monitoringPeriodMs: 60000,
      });

      // Force circuit open
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(cb.execute(operation)).rejects.toThrow();
      expect(cb.getState()).toBe(CircuitBreakerState.OPEN);

      // Reset via manager
      manager.reset('test-service');
      expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should not throw when resetting non-existent circuit breaker', () => {
      expect(() => manager.reset('non-existent')).not.toThrow();
    });
  });

  describe('resetAll', () => {
    it('should reset all circuit breakers', async () => {
      const cb1 = manager.getOrCreate('service-1', {
        failureThreshold: 1,
        resetTimeoutMs: 1000,
        monitoringPeriodMs: 60000,
      });
      const cb2 = manager.getOrCreate('service-2', {
        failureThreshold: 1,
        resetTimeoutMs: 1000,
        monitoringPeriodMs: 60000,
      });

      // Force circuits open
      const operation = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(cb1.execute(operation)).rejects.toThrow();
      await expect(cb2.execute(operation)).rejects.toThrow();

      expect(cb1.getState()).toBe(CircuitBreakerState.OPEN);
      expect(cb2.getState()).toBe(CircuitBreakerState.OPEN);

      // Reset all
      manager.resetAll();

      expect(cb1.getState()).toBe(CircuitBreakerState.CLOSED);
      expect(cb2.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('size limit enforcement', () => {
    it('should enforce maximum size limit and remove oldest entries', () => {
      // Create manager with max size of 3
      const limitedManager = new CircuitBreakerManager({ maxSize: 3 });

      limitedManager.getOrCreate('service-1');
      limitedManager.getOrCreate('service-2');
      limitedManager.getOrCreate('service-3');
      expect(limitedManager.getSize()).toBe(3);

      // Adding 4th should remove oldest (service-1)
      limitedManager.getOrCreate('service-4');
      expect(limitedManager.getSize()).toBe(3);
      expect(limitedManager.get('service-1')).toBeUndefined();
      expect(limitedManager.get('service-2')).toBeDefined();
      expect(limitedManager.get('service-3')).toBeDefined();
      expect(limitedManager.get('service-4')).toBeDefined();
    });

    it('should not remove entries when accessing existing circuit breaker', () => {
      const limitedManager = new CircuitBreakerManager({ maxSize: 3 });

      limitedManager.getOrCreate('service-1');
      limitedManager.getOrCreate('service-2');
      limitedManager.getOrCreate('service-3');

      // Access service-1 (should mark as recently used)
      limitedManager.getOrCreate('service-1');

      // Add service-4 - should remove service-2 (now oldest)
      limitedManager.getOrCreate('service-4');

      expect(limitedManager.get('service-1')).toBeDefined();
      expect(limitedManager.get('service-2')).toBeUndefined();
      expect(limitedManager.get('service-3')).toBeDefined();
      expect(limitedManager.get('service-4')).toBeDefined();
    });
  });

  describe('memory leak prevention', () => {
    it('should allow cleanup of old circuit breakers', () => {
      // Simulate creating many circuit breakers over time
      for (let i = 0; i < 100; i++) {
        manager.getOrCreate(`service-${i}`);
      }
      expect(manager.getSize()).toBe(100);

      // Remove half of them
      for (let i = 0; i < 50; i++) {
        manager.remove(`service-${i}`);
      }
      expect(manager.getSize()).toBe(50);

      // Verify remaining are still accessible
      for (let i = 50; i < 100; i++) {
        expect(manager.get(`service-${i}`)).toBeDefined();
      }
    });

    it('should handle rapid create/remove cycles', () => {
      for (let i = 0; i < 1000; i++) {
        manager.getOrCreate('temp-service');
        manager.remove('temp-service');
      }
      expect(manager.getSize()).toBe(0);
    });
  });
});
