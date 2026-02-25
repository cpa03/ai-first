/**
 * EventBus - Simple, type-safe event bus for agent coordination.
 *
 * Provides publish-subscribe pattern for agents to communicate
 * in a loosely coupled manner.
 */

import { createLogger } from '@/lib/logger';
import type {
  AgentEvent,
  EventType,
  EventHandler,
  EventSubscription,
  EventPayloadMap,
} from './types';

const _logger = createLogger('EventBus');

/**
 * EventBus configuration options.
 */
export interface EventBusConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum number of handlers per event type (default: 10) */
  maxHandlers?: number;
  /** Enable event history for debugging (default: false) */
  enableHistory?: boolean;
  /** Maximum history size (default: 100) */
  maxHistorySize?: number;
}

/**
 * Default configuration.
 */
const DEFAULT_CONFIG: Required<EventBusConfig> = {
  debug: false,
  maxHandlers: 10,
  enableHistory: false,
  maxHistorySize: 100,
};

/**
 * Simple, type-safe EventBus for agent coordination.
 *
 * @example
 * ```typescript
 * // Subscribe to events
 * const subscription = eventBus.subscribe<ClarificationStartedEvent>(
 *   'clarification.started',
 *   (event) => {
 *     console.log('Clarification started for idea:', event.ideaId);
 *   }
 * );
 *
 * // Emit events
 * eventBus.emit({
 *   eventId: 'evt_123',
 *   timestamp: new Date(),
 *   type: 'clarification.started',
 *   ideaId: 'idea_456',
 *   payload: { originalIdea: 'My idea', questionCount: 5 }
 * });
 *
 * // Unsubscribe
 * eventBus.unsubscribe(subscription.id);
 * ```
 */
class EventBus {
  private subscriptions: Map<EventType, Map<string, EventSubscription>> =
    new Map();
  private config: Required<EventBusConfig>;
  private eventHistory: AgentEvent[] = [];
  private subscriptionCounter = 0;

  constructor(config: EventBusConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Subscribe to an event type.
   *
   * @param eventType - The type of event to subscribe to
   * @param handler - Function to call when event is emitted
   * @param filter - Optional filter function
   * @returns Subscription object with unsubscribe method
   */
  subscribe<T extends EventType>(
    eventType: T,
    handler: EventHandler<EventPayloadMap[T]>,
    filter?: (event: AgentEvent) => boolean
  ): EventSubscription {
    // Ensure map exists for this event type
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }

    const typeSubscriptions = this.subscriptions.get(eventType)!;

    // Check max handlers limit
    if (typeSubscriptions.size >= this.config.maxHandlers) {
      _logger.warn(
        `Maximum handlers (${this.config.maxHandlers}) reached for event type: ${eventType}`
      );
      throw new Error(
        `Maximum handlers (${this.config.maxHandlers}) reached for event type: ${eventType}`
      );
    }

    const subscription: EventSubscription = {
      id: `sub_${++this.subscriptionCounter}_${Date.now()}`,
      eventType,
      handler: handler as EventHandler,
      filter,
    };

    typeSubscriptions.set(subscription.id, subscription);

    if (this.config.debug) {
      _logger.debug(
        `Subscribed to event: ${eventType}, subscriptionId: ${subscription.id}`
      );
    }

    return subscription;
  }

  /**
   * Unsubscribe from an event.
   *
   * @param subscriptionId - The subscription ID to remove
   * @returns true if subscription was found and removed
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      if (subscriptions.has(subscriptionId)) {
        subscriptions.delete(subscriptionId);

        if (this.config.debug) {
          _logger.debug(
            `Unsubscribed from event: ${eventType}, subscriptionId: ${subscriptionId}`
          );
        }

        return true;
      }
    }

    _logger.warn(`Subscription not found: ${subscriptionId}`);
    return false;
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param event - The event to emit
   */
  async emit<T extends AgentEvent>(event: T): Promise<void> {
    // Add to history if enabled
    if (this.config.enableHistory) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.config.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    const eventType = event.type;
    const typeSubscriptions = this.subscriptions.get(eventType);

    if (!typeSubscriptions || typeSubscriptions.size === 0) {
      if (this.config.debug) {
        _logger.debug(`No subscribers for event: ${eventType}`);
      }
      return;
    }

    if (this.config.debug) {
      _logger.debug(
        `Emitting event: ${eventType}, ideaId: ${event.ideaId}, subscribers: ${typeSubscriptions.size}`
      );
    }

    // Collect handlers to call (avoid issues with subscriptions changing during iteration)
    const handlers: Array<{
      handler: EventHandler;
      filter?: (event: AgentEvent) => boolean;
    }> = [];

    for (const subscription of typeSubscriptions.values()) {
      handlers.push({
        handler: subscription.handler,
        filter: subscription.filter,
      });
    }

    // Call all handlers
    const promises = handlers.map(async ({ handler, filter }) => {
      try {
        // Apply filter if present
        if (filter && !filter(event)) {
          return;
        }

        await handler(event);
      } catch (error) {
        _logger.error(
          `Error in event handler for ${eventType}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    });

    await Promise.all(promises);
  }

  /**
   * Emit an event synchronously (for simpler use cases).
   *
   * @param event - The event to emit
   */
  emitSync<T extends AgentEvent>(event: T): void {
    // Add to history if enabled
    if (this.config.enableHistory) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.config.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    const eventType = event.type;
    const typeSubscriptions = this.subscriptions.get(eventType);

    if (!typeSubscriptions || typeSubscriptions.size === 0) {
      return;
    }

    // Call all handlers synchronously
    for (const subscription of typeSubscriptions.values()) {
      try {
        // Apply filter if present
        if (subscription.filter && !subscription.filter(event)) {
          continue;
        }

        const result = subscription.handler(event);
        // Handle async handlers (but don't await - fire and forget)
        if (result instanceof Promise) {
          result.catch((error) => {
            _logger.error(
              `Async error in event handler for ${eventType}:`,
              error instanceof Error ? error.message : 'Unknown error'
            );
          });
        }
      } catch (error) {
        _logger.error(
          `Error in event handler for ${eventType}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * Get all active subscriptions.
   *
   * @param eventType - Optional filter by event type
   * @returns Array of subscriptions
   */
  getSubscriptions(eventType?: EventType): EventSubscription[] {
    if (eventType) {
      const subscriptions = this.subscriptions.get(eventType);
      return subscriptions ? Array.from(subscriptions.values()) : [];
    }

    const all: EventSubscription[] = [];
    for (const subscriptions of this.subscriptions.values()) {
      all.push(...subscriptions.values());
    }
    return all;
  }

  /**
   * Get event history (if enabled).
   *
   * @returns Array of historical events
   */
  getHistory(): AgentEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history.
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Clear all subscriptions.
   */
  clear(): void {
    this.subscriptions.clear();
  }

  /**
   * Get the number of subscribers for an event type.
   *
   * @param eventType - The event type to check
   * @returns Number of subscribers
   */
  getSubscriberCount(eventType: EventType): number {
    const subscriptions = this.subscriptions.get(eventType);
    return subscriptions ? subscriptions.size : 0;
  }

  /**
   * Check if an event type has subscribers.
   *
   * @param eventType - The event type to check
   * @returns true if there are subscribers
   */
  hasSubscribers(eventType: EventType): boolean {
    return this.getSubscriberCount(eventType) > 0;
  }
}

/**
 * Generate a unique event ID.
 *
 * @returns Unique event ID string
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Singleton instance for global access
let eventBusInstance: EventBus | null = null;

/**
 * Get the global EventBus instance.
 *
 * @param config - Optional configuration
 * @returns The EventBus singleton
 */
export function getEventBus(config?: EventBusConfig): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus(config);
  }
  return eventBusInstance;
}

/**
 * Reset the EventBus singleton (useful for testing).
 */
export function resetEventBus(): void {
  if (eventBusInstance) {
    eventBusInstance.clear();
    eventBusInstance.clearHistory();
    eventBusInstance = null;
  }
}

/**
 * Create a new EventBus instance (for testing or isolation).
 *
 * @param config - Configuration options
 * @returns New EventBus instance
 */
export function createEventBus(config?: EventBusConfig): EventBus {
  return new EventBus(config);
}

// Export the EventBus class and types
export { EventBus };
