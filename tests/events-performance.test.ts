import { eventBus } from '@/lib/agents/events/event-bus';
import { dbService } from '@/lib/db';
import type { AgentEvent } from '@/lib/agents/events/types';

// Mock the database service to simulate latency
jest.mock('@/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn(),
  },
}));

// Mock the logger to prevent console clutter
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('EventBus Performance', () => {
  beforeEach(() => {
    eventBus.clearHistory();
    jest.clearAllMocks();
  });

  it('measures emit latency with simulated database delay', async () => {
    const DB_LATENCY = 10;

    // Simulate database latency for logging
    (dbService.logAgentAction as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, DB_LATENCY))
    );

    const event: AgentEvent = {
      type: 'ClarificationStarted',
      payload: {
        ideaId: 'test-idea',
        ideaText: 'Benchmark idea',
        sessionId: 'session-1',
      },
      timestamp: new Date(),
      source: 'clarifier',
    };

    const iterations = 10;
    let totalDuration = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await eventBus.emit(event);
      const end = performance.now();
      totalDuration += (end - start);
    }

    const avgDuration = totalDuration / iterations;
    console.log(`Average EventBus.emit latency: ${avgDuration.toFixed(2)}ms (with ${DB_LATENCY}ms simulated DB delay)`);

    // The benchmark passes if it completes, we are using it for measurement
    expect(avgDuration).toBeDefined();
  });
});
