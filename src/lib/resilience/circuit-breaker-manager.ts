import { CircuitBreaker } from './circuit-breaker';
import { CircuitBreakerOptions, CircuitBreakerState } from './types';
import { RESILIENCE_CONFIG } from '../config/constants';

export interface CircuitBreakerManagerOptions {
  maxSize?: number;
}

/**
 * CircuitBreakerManager handles the lifecycle and management of circuit breakers.
 * Implements a Least Recently Used (LRU) eviction policy to prevent memory leaks.
 */
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private maxSize: number;

  constructor(options?: CircuitBreakerManagerOptions) {
    this.maxSize =
      options?.maxSize ?? RESILIENCE_CONFIG.MANAGER.DEFAULT_MAX_SIZE;
  }

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  /**
   * Get an existing circuit breaker or create a new one.
   * PERFORMANCE: Implements O(1) LRU by using Map's insertion order.
   */
  getOrCreate(name: string, config?: CircuitBreakerOptions): CircuitBreaker {
    const existing = this.circuitBreakers.get(name);
    if (existing) {
      // PERFORMANCE: Move to end of Map to mark as most recently used
      this.circuitBreakers.delete(name);
      this.circuitBreakers.set(name, existing);
      return existing;
    }

    this.enforceSizeLimit();
    const newBreaker = new CircuitBreaker(name, config);
    this.circuitBreakers.set(name, newBreaker);
    return newBreaker;
  }

  /**
   * Enforces the maximum number of circuit breakers to prevent memory leaks.
   * PERFORMANCE: Uses O(1) eviction of the oldest entry (first in Map).
   */
  private enforceSizeLimit(): void {
    if (this.circuitBreakers.size >= this.maxSize) {
      // PERFORMANCE: Map preserves insertion order. The first entry is the
      // Least Recently Used (LRU) because we move entries to the end on every access.
      const firstEntry = this.circuitBreakers.keys().next();
      if (!firstEntry.done) {
        this.remove(firstEntry.value);
      }
    }
  }

  /**
   * Get a circuit breaker by name.
   * PERFORMANCE: Moves the accessed breaker to the end of the Map (O(1) MRU update).
   */
  get(name: string): CircuitBreaker | undefined {
    const breaker = this.circuitBreakers.get(name);
    if (breaker) {
      // PERFORMANCE: Move to end of Map to mark as most recently used
      this.circuitBreakers.delete(name);
      this.circuitBreakers.set(name, breaker);
    }
    return breaker;
  }

  /**
   * Remove a circuit breaker by name.
   * PERFORMANCE: O(1) deletion from Map.
   */
  remove(name: string): void {
    this.circuitBreakers.delete(name);
  }

  getNames(): string[] {
    return Array.from(this.circuitBreakers.keys());
  }

  getSize(): number {
    return this.circuitBreakers.size;
  }

  getAllStatuses(): Record<
    string,
    {
      state: CircuitBreakerState;
      failures: number;
      nextAttemptTime?: string;
    }
  > {
    const statuses: Record<
      string,
      {
        state: CircuitBreakerState;
        failures: number;
        nextAttemptTime?: string;
      }
    > = {};
    this.circuitBreakers.forEach((cb, name) => {
      statuses[name] = cb.getStatus();
    });
    return statuses;
  }

  reset(name: string): void {
    const cb = this.circuitBreakers.get(name);
    if (cb) {
      cb.reset();
    }
  }

  resetAll(): void {
    this.circuitBreakers.forEach((cb) => cb.reset());
  }
}

export const circuitBreakerManager = CircuitBreakerManager.getInstance();
