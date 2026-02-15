import { CircuitBreaker } from './circuit-breaker';
import { CircuitBreakerOptions, CircuitBreakerState } from './types';

export interface CircuitBreakerManagerOptions {
  maxSize?: number;
}

export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private accessOrder: string[] = [];
  private maxSize: number;

  constructor(options?: CircuitBreakerManagerOptions) {
    this.maxSize = options?.maxSize ?? Number.MAX_SAFE_INTEGER;
  }

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  getOrCreate(name: string, config?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.enforceSizeLimit();
      this.circuitBreakers.set(name, new CircuitBreaker(name, config));
    }
    this.updateAccessOrder(name);
    return this.circuitBreakers.get(name)!;
  }

  private enforceSizeLimit(): void {
    if (
      this.circuitBreakers.size >= this.maxSize &&
      this.accessOrder.length > 0
    ) {
      const oldestName = this.accessOrder[0];
      this.remove(oldestName);
    }
  }

  private updateAccessOrder(name: string): void {
    const index = this.accessOrder.indexOf(name);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(name);
  }

  get(name: string): CircuitBreaker | undefined {
    const breaker = this.circuitBreakers.get(name);
    if (breaker) {
      this.updateAccessOrder(name);
    }
    return breaker;
  }

  remove(name: string): void {
    this.circuitBreakers.delete(name);
    const index = this.accessOrder.indexOf(name);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
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
