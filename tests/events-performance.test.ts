import { eventBus } from '@/lib/agents/events/event-bus';
import { dbService } from '@/lib/db';

// Mock the database service with simulated latency
jest.mock('@/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn(),
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

describe('EventBus Performance', () => {
  const DB_LATENCY_MS = 10;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clearHistory();

    // Simulate DB latency
    (dbService.logAgentAction as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, DB_LATENCY_MS));
    });
  });

  it('measures emit latency with simulated database delay', async () => {
    const event = {
      type: 'ClarificationStarted' as const,
      payload: {
        ideaId: 'idea-123',
        ideaText: 'Test idea',
        sessionId: 'session-123',
      },
      timestamp: new Date(),
      source: 'clarifier' as const,
    };

    const start = performance.now();
    await eventBus.emit(event);
    const end = performance.now();

    const duration = end - start;
    console.log(`EventBus.emit took ${duration.toFixed(2)}ms with ${DB_LATENCY_MS}ms simulated DB latency`);

    // In the new non-blocking implementation, duration should be significantly LESS than DB_LATENCY_MS
    expect(duration).toBeLessThan(DB_LATENCY_MS);
  });

  it('measures multiple emits sequentially', async () => {
    const iterations = 10;
    const event = {
      type: 'ClarificationStarted' as const,
      payload: {
        ideaId: 'idea-123',
        ideaText: 'Test idea',
        sessionId: 'session-123',
      },
      timestamp: new Date(),
      source: 'clarifier' as const,
    };

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await eventBus.emit(event);
    }
    const end = performance.now();

    const duration = end - start;
    console.log(`${iterations} sequential emits took ${duration.toFixed(2)}ms (avg: ${(duration / iterations).toFixed(2)}ms)`);

    // Even 10 sequential emits should be faster than a single DB call latency
    expect(duration).toBeLessThan(DB_LATENCY_MS);
  });
});
