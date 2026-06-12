import { eventBus } from '@/lib/agents/events/event-bus';
import { dbService } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  dbService: {
    logAgentAction: jest.fn(),
  },
}));

describe('EventBus Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clearHistory();
  });

  it('measures emit latency with simulated DB delay', async () => {
    // Simulate 10ms DB latency
    (dbService.logAgentAction as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 10))
    );

    const iterations = 50;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await eventBus.emit({
        type: 'ClarificationStarted',
        payload: { ideaId: `idea-${i}`, ideaText: 'Test', sessionId: 's1' },
        timestamp: new Date(),
        source: 'clarifier',
      } as any);
    }

    const end = performance.now();
    const duration = end - start;
    const avgLatency = duration / iterations;

    console.log(`EventBus.emit iterations: ${iterations}`);
    console.log(`Total duration: ${duration.toFixed(2)}ms`);
    console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);

    // After optimization, it should be much less than 10ms as logging is non-blocking
    expect(avgLatency).toBeLessThan(1);
  });
});
