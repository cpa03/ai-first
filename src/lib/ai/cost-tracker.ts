import { Cache } from '../cache';
import { AI_CONFIG, AI_SERVICE_LIMITS, API_ERROR_MESSAGES, AI_ENV_KEYS } from '../config';
import { createLogger } from '../logger';

const logger = createLogger('AICostTracker');

/**
 * Cost tracking entry
 */
export interface CostTracker {
  tokensUsed: number;
  cost: number;
  model: string;
  timestamp: Date;
}

/**
 * AI Cost Tracker - handles cost tracking, daily limits, and memory leak prevention.
 * Extracted from AIService to follow Single Responsibility Principle.
 */
export class AICostTracker {
  private costTrackers: CostTracker[] = [];
  private todayCostCache: Cache<number>;
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(costCache?: Cache<number>) {
    this.todayCostCache = costCache || new Cache<number>({
      ttl: AI_CONFIG.COST_CACHE_TTL_MS,
      maxSize: AI_CONFIG.COST_CACHE_MAX_SIZE,
    });

    // Start cleanup interval in production only
    this.startCleanupInterval();
  }

  /**
   * Track token usage and cost for a model call
   */
  async trackCost(tokens: number, model: string): Promise<void> {
    // Memory leak prevention: Clean up old cost trackers before adding new ones
    this.cleanupOldCostTrackers();

    const costPerToken = this.getCostPerToken(model);
    const cost = tokens * costPerToken;

    // PERFORMANCE: Get current today's cost. This is O(1) if cached, O(n) if not.
    // We call it before pushing the new tracker to ensure it only includes previous costs.
    const previousTodayCost = this.getTodayCost();
    const totalTodayCost = previousTodayCost + cost;

    const tracker: CostTracker = {
      tokensUsed: tokens,
      cost,
      model,
      timestamp: new Date(),
    };

    this.costTrackers.push(tracker);

    // Memory leak prevention: If array exceeds max size, remove oldest 20% of entries
    if (this.costTrackers.length > AI_SERVICE_LIMITS.MAX_COST_TRACKERS) {
      const entriesToRemove = Math.floor(
        AI_SERVICE_LIMITS.MAX_COST_TRACKERS * AI_SERVICE_LIMITS.CLEANUP_PERCENTAGE
      );
      this.costTrackers.splice(0, entriesToRemove);
    }

    // PERFORMANCE: Update cache with the new total instead of clearing it.
    // This keeps subsequent calls to getTodayCost() as O(1).
    // We use the day-start numeric timestamp as the key to match getTodayCost.
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dayStart = todayDate.getTime();
    const cacheKey = `today:${dayStart}`;
    this.todayCostCache.set(cacheKey, totalTodayCost);

    const dailyLimit = parseFloat(
      process.env[AI_ENV_KEYS.COST_LIMIT_DAILY] ||
        String(AI_CONFIG.DEFAULT_DAILY_COST_LIMIT)
    );

    if (totalTodayCost > dailyLimit) {
      throw new Error(
        `${API_ERROR_MESSAGES.AI.COST_LIMIT_EXCEEDED}. Today's cost: $${totalTodayCost}, Limit: $${dailyLimit}`
      );
    }
  }

  /**
   * Get cost per token for a model
   */
  private getCostPerToken(model: string): number {
    return (
      AI_CONFIG.PRICING[model as keyof typeof AI_CONFIG.PRICING] ??
      AI_CONFIG.DEFAULT_PRICING_PER_TOKEN
    );
  }

  /**
   * Binary search to find the first index where costTracker.timestamp >= cutoffTime
   * PERFORMANCE: O(log N) complexity compared to O(N) linear scan.
   */
  private findFirstValidIndex(cutoffTime: number): number {
    let low = 0;
    let high = this.costTrackers.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = (low + high) >>> 1;
      if (this.costTrackers[mid].timestamp.getTime() >= cutoffTime) {
        result = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return result;
  }

  /**
   * Memory leak prevention: Clean up old cost tracker entries
   * Removes entries older than MAX_COST_TRACKER_AGE_MS (24 hours)
   */
  private cleanupOldCostTrackers(): void {
    const cutoffTime = Date.now() - AI_SERVICE_LIMITS.MAX_COST_TRACKER_AGE_MS;

    // PERFORMANCE: Use O(log N) binary search instead of O(N) linear scan.
    const firstValidIndex = this.findFirstValidIndex(cutoffTime);

    if (firstValidIndex === -1) {
      // All entries are expired
      this.costTrackers = [];
    } else if (firstValidIndex > 0) {
      // Some entries are expired, remove them
      this.costTrackers = this.costTrackers.slice(firstValidIndex);
    }
    // If firstValidIndex is 0, all entries are still valid; no action needed.
  }

  /**
   * Start the periodic cleanup interval (production only)
   */
  private startCleanupInterval(): void {
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'production' &&
      !process.env.JEST_WORKER_ID &&
      !process.env.VITEST_WORKER_ID
    ) {
      this.cleanupIntervalId = setInterval(() => {
        this.cleanupOldCostTrackers();
      }, AI_CONFIG.COST_TRACKER_CLEANUP_INTERVAL_MS);

      // Prevent interval from keeping process alive
      if (
        this.cleanupIntervalId &&
        typeof (this.cleanupIntervalId as NodeJS.Timeout).unref === 'function'
      ) {
        (this.cleanupIntervalId as NodeJS.Timeout).unref();
      }
    }
  }

  /**
   * Cleanup method to stop the interval and prevent memory leaks
   * Should be called on service shutdown
   */
  cleanup(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * Get today's cost with O(log N) binary search
   */
  getTodayCost(): number {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dayStart = todayDate.getTime();
    const cacheKey = `today:${dayStart}`;

    const cachedCost = this.todayCostCache.get(cacheKey);
    if (cachedCost !== null) {
      return cachedCost;
    }

    // PERFORMANCE: Use O(log N) binary search to find the start of today's entries.
    // This avoids O(N) traversal and expensive toDateString() formatting in a loop.
    const firstTodayIndex = this.findFirstValidIndex(dayStart);

    let cost = 0;
    if (firstTodayIndex !== -1) {
      for (let i = firstTodayIndex; i < this.costTrackers.length; i++) {
        cost += this.costTrackers[i].cost;
      }
    }

    this.todayCostCache.set(cacheKey, cost);
    return cost;
  }

  /**
   * Get all cost tracking data
   */
  getCostTracking(): CostTracker[] {
    return [...this.costTrackers];
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): ReturnType<Cache<number>['getStats']> {
    return this.todayCostCache.getStats();
  }

  /**
   * Clear cost cache
   */
  clearCostCache(): void {
    this.todayCostCache.clear();
  }

  /**
   * Factory function for creating AICostTracker instances.
   * Enables dependency injection for testing.
   */
  static create(costCache?: Cache<number>): AICostTracker {
    return new AICostTracker(costCache);
  }
}