import { eventBus } from '../src/lib/agents/events/event-bus';

// Mock dbService to simulate network/DB latency
jest.mock('../src/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)))
  }
}));

describe('EventBus Performance', () => {
  beforeEach(() => {
    eventBus.clearHistory();
    jest.clearAllMocks();
  });

  it('measures emit performance with simulated DB latency', async () => {
    const event = {
      type: 'ClarificationStarted' as any,
      payload: { ideaId: 'idea-123', ideaText: 'Test idea', sessionId: 'session-123' },
      timestamp: new Date(),
      source: 'clarifier' as any,
    };

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await eventBus.emit(event);
    }
    const end = performance.now();
    const duration = end - start;

    console.log(`Emitted ${iterations} events in ${duration.toFixed(2)}ms`);
    console.log(`Average time per emit: ${(duration / iterations).toFixed(4)}ms`);

    // After optimization, we expect it to be much faster than iterations * 10ms
    // Typically it should be < 1ms per emit (excluding overhead of benchmark itself)
    expect(duration).toBeLessThan(iterations * 5); // Conservative check
  });
});
