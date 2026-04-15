/**
 * Event Bus for Agent System
 *
 * Central pub/sub mechanism for agent communication.
 * Provides typed event emission and subscription with audit logging.
 */

import type { AgentEvent, EventPayloadMap, EventType } from './types';
import { dbService } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { generateSecureId } from '@/lib/id-generator';

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
  private readonly maxHistorySize = 1000;

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
    const id = generateSecureId('sub_');
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
    const id = generateSecureId('sub_');
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

    // Log to database for audit trail
    await this.logEvent(event);

    // Get subscribers for this event type
    const typeSubs = this.subscriptions.get(event.type) || [];
    // Get wildcard subscribers
    const wildcardSubs = this.subscriptions.get('*') || [];

    // Combine and deduplicate
    const allSubs = [...typeSubs];
    for (const sub of wildcardSubs) {
      if (!allSubs.find((s) => s.id === sub.id)) {
        allSubs.push(sub);
      }
    }

    // Execute handlers
    const promises = allSubs.map(async (sub) => {
      try {
        await sub.handler(event);
      } catch (error) {
        _logger.error(`Event handler error for ${event.type}:`, error);
      }
    });

    await Promise.all(promises);
    _logger.debug(
      `Emitted event: ${event.type}, subscribers: ${allSubs.length}`
    );
  }

  /**
   * Get event history
   * @param limit - Maximum number of events to return
   * @param eventType - Optional filter by event type
   */
  getHistory(limit = 100, eventType?: EventType): AgentEvent[] {
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
