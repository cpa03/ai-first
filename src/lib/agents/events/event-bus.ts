/**
 * Event Bus for Agent System
 *
 * Central pub/sub mechanism for agent communication.
 * Provides typed event emission and subscription with audit logging.
 */

import type { AgentEvent, EventPayloadMap, EventType } from './types';
import { EVENT_BUS_CONFIG } from '@/lib/config/agents';
import { dbService } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { generateId } from '@/lib/security/crypto';

const _logger = createLogger('EventBus');

type EventHandler<T extends AgentEvent = AgentEvent> = (
  event: T
) => void | Promise<void>;

interface Subscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  createdAt: Date;
}

/**
 * Event Bus class for pub/sub communication between agents
 */
class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private eventHistory: AgentEvent[] = [];
  private readonly maxHistorySize = EVENT_BUS_CONFIG.MAX_HISTORY_SIZE;

  /**
   * Subscribe to an event type
   * @param eventType - The event type to subscribe to
   * @param handler - Function to call when event is emitted
   * @returns Subscription ID for unsubscribing
   */
  subscribe<T extends EventType>(
    eventType: T,
    handler: EventHandler<Extract<AgentEvent, { type: T }>>
  ): string {
    const id = `sub_${Date.now()}_${generateId()}`;
    const subscription: Subscription = {
      id,
      eventType,
      handler: handler as EventHandler,
      createdAt: new Date(),
    };

    const existing = this.subscriptions.get(eventType) || [];
    existing.push(subscription);
    this.subscriptions.set(eventType, existing);

    _logger.debug(`Subscribed to event: ${eventType}, id: ${id}`);
    return id;
  }

  /**
   * Subscribe to all events
   * @param handler - Function to call when any event is emitted
   * @returns Subscription ID for unsubscribing
   */
  subscribeAll(handler: EventHandler): string {
    const id = `sub_${Date.now()}_${generateId()}`;
    const subscription: Subscription = {
      id,
      eventType: '*',
      handler,
      createdAt: new Date(),
    };

    const existing = this.subscriptions.get('*') || [];
    existing.push(subscription);
    this.subscriptions.set('*', existing);

    _logger.debug(`Subscribed to all events, id: ${id}`);
    return id;
  }

  /**
   * Unsubscribe from an event
   * @param subscriptionId - The subscription ID returned from subscribe()
   * @returns true if subscription was found and removed
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        _logger.debug(
          `Unsubscribed from event: ${eventType}, id: ${subscriptionId}`
        );
        return true;
      }
    }
    return false;
  }

  /**
   * Emit an event to all subscribers
   * @param event - The event to emit
   */
  async emit<T extends AgentEvent>(event: T): Promise<void> {
    // Add to history
    this.addToHistory(event);

    // PERFORMANCE: Non-blocking audit logging to eliminate DB latency from critical path.
    // We clone the event to ensure that even if a subscriber mutates it, the audit log
    // contains the original data.
    if (EVENT_BUS_CONFIG.AUDIT_LOGGING_ENABLED) {
      // Use structuredClone for deep integrity, with a safe fallback.
      // We prefer globalThis.structuredClone for explicit Edge compatibility.
      const eventToLog =
        typeof globalThis.structuredClone === 'function'
          ? globalThis.structuredClone(event)
          : {
              ...event,
              payload:
                typeof event.payload === 'object' && event.payload !== null
                  ? { ...event.payload }
                  : event.payload,
            };

      // Fire and forget logging - do not await
      this.logEvent(eventToLog as T).catch((err) =>
        _logger.warn('Failed to log event to database:', err)
      );
    }

    // PERFORMANCE: Efficient subscriber retrieval and deduplication using Set.
    const typeSubs = this.subscriptions.get(event.type);
    const wildcardSubs = this.subscriptions.get('*');

    if (!typeSubs && !wildcardSubs) {
      _logger.debug(`Emitted event: ${event.type}, no subscribers`);
      return;
    }

    // Use a Set for O(1) deduplication by handler reference or subscription ID
    const uniqueHandlers = new Set<EventHandler>();
    typeSubs?.forEach((s) => uniqueHandlers.add(s.handler));
    wildcardSubs?.forEach((s) => uniqueHandlers.add(s.handler));

    // PERFORMANCE: Avoid Promise.all overhead if there are no async handlers
    // and execute handlers sequentially for better CPU cache locality in common cases.
    const handlerPromises: Promise<void>[] = [];

    for (const handler of uniqueHandlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          handlerPromises.push(
            result.catch((error) => {
              _logger.error(`Async event handler error for ${event.type}:`, error);
            })
          );
        }
      } catch (error) {
        _logger.error(`Event handler error for ${event.type}:`, error);
      }
    }

    if (handlerPromises.length > 0) {
      await Promise.all(handlerPromises);
    }
    _logger.debug(
      `Emitted event: ${event.type}, subscribers: ${uniqueHandlers.size}`
    );
  }

  /**
   * Get event history
   * @param limit - Maximum number of events to return
   * @param eventType - Optional filter by event type
   */
  getHistory(
    limit = EVENT_BUS_CONFIG.DEFAULT_HISTORY_LIMIT,
    eventType?: EventType
  ): AgentEvent[] {
    let history = this.eventHistory;
    if (eventType) {
      history = history.filter((e) => e.type === eventType);
    }
    return history.slice(-limit);
  }

  /**
   * Get events for a specific idea
   * @param ideaId - The idea ID to filter by
   */
  getEventsForIdea(ideaId: string): AgentEvent[] {
    return this.eventHistory.filter((event) => {
      const payload = event.payload as Record<string, unknown>;
      return payload.ideaId === ideaId;
    });
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    _logger.debug('Event history cleared');
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    let count = 0;
    for (const subs of this.subscriptions.values()) {
      count += subs.length;
    }
    return count;
  }

  private addToHistory(event: AgentEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private async logEvent(event: AgentEvent): Promise<void> {
    try {
      await dbService.logAgentAction('event-bus', event.type, {
        payload: event.payload,
        source: event.source,
        correlationId: event.correlationId,
      });
    } catch (error) {
      // Don't throw - logging should not block event processing
      _logger.warn('Failed to log event to database:', error);
    }
  }
}

/** Singleton instance of the event bus */
export const eventBus = new EventBus();

/** Helper function to create typed event emitters */
export function createEventEmitter(source: AgentEvent['source']) {
  return {
    emit: <T extends EventType>(
      type: T,
      payload: EventPayloadMap[T],
      correlationId?: string
    ) => {
      return eventBus.emit({
        type,
        payload,
        timestamp: new Date(),
        source,
        correlationId,
      } as AgentEvent);
    },
  };
}

export type { EventHandler, Subscription };
