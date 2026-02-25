import { eventBus, createEventEmitter } from '@/lib/agents/events/event-bus';
import type {
  ClarificationStartedEvent,
  ClarificationCompletedEvent,
  BreakdownStartedEvent,
  BreakdownCompletedEvent,
  BreakdownTaskGeneratedEvent,
  AgentErrorEvent,
  AgentEvent,
} from '@/lib/agents/events/types';

// Mock the database service
jest.mock('@/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the logger to prevent console output during tests
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('EventBus', () => {
  // Store original subscriptions to restore after tests
  let originalSubscriptions: Map<string, unknown[]>;

  beforeEach(() => {
    // Store original subscriptions before each test
    originalSubscriptions = new Map(
      eventBus.getHistory(0).length > 0 ? [] : []
    );
    // Clear subscriptions by getting all event types and unsubscribing
    eventBus.clearHistory();
    // Clear all subscriptions by creating a new event bus instance behavior
    // Note: We need to clear subscriptions manually since eventBus is a singleton
    const subs = eventBus.getSubscriptionCount();
    for (let i = 0; i < subs; i++) {
      eventBus.unsubscribe(`sub_test_${i}`);
    }
  });

  describe('subscribe', () => {
    it('should return a subscription id', () => {
      const handler = jest.fn();
      const subscriptionId = eventBus.subscribe(
        'ClarificationStarted',
        handler
      );
      expect(subscriptionId).toMatch(/^sub_/);
    });

    it('should allow multiple handlers for same event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('ClarificationStarted', handler1);
      eventBus.subscribe('ClarificationStarted', handler2);

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      await eventBus.emit(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should handle different event types separately', async () => {
      const clarificationHandler = jest.fn();
      const breakdownHandler = jest.fn();

      eventBus.subscribe('ClarificationStarted', clarificationHandler);
      eventBus.subscribe('BreakdownStarted', breakdownHandler);

      const clarificationEvent: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      const breakdownEvent: BreakdownStartedEvent = {
        type: 'BreakdownStarted',
        payload: {
          ideaId: 'idea-123',
          refinedIdea: 'Refined idea',
          userResponses: {},
          options: {},
        },
        timestamp: new Date(),
        source: 'breakdown-engine',
      };

      await eventBus.emit(clarificationEvent);
      await eventBus.emit(breakdownEvent);

      expect(clarificationHandler).toHaveBeenCalledTimes(1);
      expect(breakdownHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeAll', () => {
    it('should receive all events', async () => {
      const handler = jest.fn();
      eventBus.subscribeAll(handler);

      const clarificationEvent: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      const breakdownEvent: BreakdownStartedEvent = {
        type: 'BreakdownStarted',
        payload: {
          ideaId: 'idea-123',
          refinedIdea: 'Refined idea',
          userResponses: {},
          options: {},
        },
        timestamp: new Date(),
        source: 'breakdown-engine',
      };

      await eventBus.emit(clarificationEvent);
      await eventBus.emit(breakdownEvent);

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribe', () => {
    it('should remove subscription and stop receiving events', async () => {
      const handler = jest.fn();
      const subscriptionId = eventBus.subscribe(
        'ClarificationStarted',
        handler
      );

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      // Emit before unsubscribe - should be received
      await eventBus.emit(event);
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      const result = eventBus.unsubscribe(subscriptionId);
      expect(result).toBe(true);

      // Emit after unsubscribe - should not be received
      await eventBus.emit(event);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should return false for invalid subscription id', () => {
      const result = eventBus.unsubscribe('invalid-id');
      expect(result).toBe(false);
    });
  });

  describe('emit', () => {
    it('should call all handlers for the event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('ClarificationCompleted', handler1);
      eventBus.subscribe('ClarificationCompleted', handler2);

      const event: ClarificationCompletedEvent = {
        type: 'ClarificationCompleted',
        payload: {
          ideaId: 'idea-123',
          refinedIdea: 'Refined idea text',
          questionsAnswered: 3,
          confidence: 0.85,
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      await eventBus.emit(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should add event to history', async () => {
      const handler = jest.fn();
      eventBus.subscribe('ClarificationStarted', handler);

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      await eventBus.emit(event);

      const history = eventBus.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('ClarificationStarted');
    });

    it('should handle handler errors gracefully', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = jest.fn();

      eventBus.subscribe('ClarificationStarted', errorHandler);
      eventBus.subscribe('ClarificationStarted', normalHandler);

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      // Should not throw
      await expect(eventBus.emit(event)).resolves.not.toThrow();
      expect(normalHandler).toHaveBeenCalled();
    });

    it('should support async handlers', async () => {
      const asyncHandler = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      eventBus.subscribe('ClarificationStarted', asyncHandler);

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      await eventBus.emit(event);
      expect(asyncHandler).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return limited number of events', async () => {
      const handler = jest.fn();
      eventBus.subscribe('ClarificationStarted', handler);

      // Emit 5 events
      for (let i = 0; i < 5; i++) {
        const event: ClarificationStartedEvent = {
          type: 'ClarificationStarted',
          payload: {
            ideaId: `idea-${i}`,
            ideaText: 'Test idea',
            sessionId: 'session-123',
          },
          timestamp: new Date(),
          source: 'clarifier',
        };
        await eventBus.emit(event);
      }

      const history = eventBus.getHistory(3);
      expect(history).toHaveLength(3);
    });

    it('should filter by event type', async () => {
      const clarificationHandler = jest.fn();
      const breakdownHandler = jest.fn();

      eventBus.subscribe('ClarificationStarted', clarificationHandler);
      eventBus.subscribe('BreakdownStarted', breakdownHandler);

      // Emit events of different types
      const clarificationEvent: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-1',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      const breakdownEvent: BreakdownStartedEvent = {
        type: 'BreakdownStarted',
        payload: {
          ideaId: 'idea-2',
          refinedIdea: 'Refined idea',
          userResponses: {},
          options: {},
        },
        timestamp: new Date(),
        source: 'breakdown-engine',
      };

      await eventBus.emit(clarificationEvent);
      await eventBus.emit(breakdownEvent);

      const clarificationHistory = eventBus.getHistory(
        10,
        'ClarificationStarted'
      );
      expect(clarificationHistory).toHaveLength(1);
      expect(clarificationHistory[0].type).toBe('ClarificationStarted');
    });
  });

  describe('getEventsForIdea', () => {
    it('should return events for specific idea', async () => {
      const handler = jest.fn();
      eventBus.subscribe('ClarificationStarted', handler);
      eventBus.subscribe('BreakdownStarted', handler);
      eventBus.subscribe('BreakdownCompleted', handler);

      // Emit events for different ideas
      const events: AgentEvent[] = [
        {
          type: 'ClarificationStarted',
          payload: { ideaId: 'idea-1', ideaText: 'Test 1', sessionId: 's1' },
          timestamp: new Date(),
          source: 'clarifier',
        },
        {
          type: 'BreakdownStarted',
          payload: {
            ideaId: 'idea-1',
            refinedIdea: 'Refined',
            userResponses: {},
            options: {},
          },
          timestamp: new Date(),
          source: 'breakdown-engine',
        },
        {
          type: 'BreakdownCompleted',
          payload: {
            ideaId: 'idea-2',
            sessionId: 's2',
            taskCount: 5,
            confidence: 0.9,
            processingTime: 1000,
          },
          timestamp: new Date(),
          source: 'breakdown-engine',
        },
      ];

      for (const event of events) {
        await eventBus.emit(event);
      }

      const idea1Events = eventBus.getEventsForIdea('idea-1');
      expect(idea1Events).toHaveLength(2);
      expect(
        idea1Events.every(
          (e) => (e.payload as Record<string, unknown>).ideaId === 'idea-1'
        )
      ).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('should clear all events from history', async () => {
      const handler = jest.fn();
      eventBus.subscribe('ClarificationStarted', handler);

      const event: ClarificationStartedEvent = {
        type: 'ClarificationStarted',
        payload: {
          ideaId: 'idea-123',
          ideaText: 'Test idea',
          sessionId: 'session-123',
        },
        timestamp: new Date(),
        source: 'clarifier',
      };

      await eventBus.emit(event);
      expect(eventBus.getHistory()).toHaveLength(1);

      eventBus.clearHistory();
      expect(eventBus.getHistory()).toHaveLength(0);
    });
  });

  describe('getSubscriptionCount', () => {
    it('should return total subscription count', () => {
      const initialCount = eventBus.getSubscriptionCount();

      eventBus.subscribe('ClarificationStarted', jest.fn());
      eventBus.subscribe('ClarificationStarted', jest.fn());
      eventBus.subscribe('BreakdownStarted', jest.fn());

      expect(eventBus.getSubscriptionCount()).toBe(initialCount + 3);
    });
  });
});

describe('createEventEmitter', () => {
  beforeEach(() => {
    eventBus.clearHistory();
  });

  it('should create an emitter with correct source', async () => {
    const emitter = createEventEmitter('clarifier');

    const handler = jest.fn();
    eventBus.subscribe('ClarificationStarted', handler);

    await emitter.emit('ClarificationStarted', {
      ideaId: 'idea-123',
      ideaText: 'Test idea',
      sessionId: 'session-123',
    });

    expect(handler).toHaveBeenCalled();
  });

  it('should support correlation id', async () => {
    const emitter = createEventEmitter('clarifier');

    const handler = jest.fn();
    eventBus.subscribe('ClarificationStarted', handler);

    await emitter.emit(
      'ClarificationStarted',
      {
        ideaId: 'idea-123',
        ideaText: 'Test idea',
        sessionId: 'session-123',
      },
      'corr-123'
    );

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'corr-123',
      })
    );
  });
});
