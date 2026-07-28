import {
  PromptService,
  parseTemplate,
  clearTemplateChunksCache,
} from '@/lib/prompt-service';

// Previous regex-based implementation to verify correctness and compare performance
function previousInterpolate(
  template: string,
  variables: Record<string, string | number | boolean | object | null>
): string {
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const value = variables[key];
      return typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value);
    }
    return match;
  });
}

describe('PromptService Interpolation Performance and Correctness', () => {
  const service = new PromptService();

  beforeEach(() => {
    service.clearCache();
    clearTemplateChunksCache();
  });

  describe('Correctness Verification', () => {
    it('should correctly interpolate variables including all types', () => {
      const template =
        'User: {user}, Age: {age}, Active: {active}, Meta: {meta}';
      const variables = {
        user: 'John Doe',
        age: 30,
        active: String(true),
        meta: { role: 'admin', permissions: ['read', 'write'] },
      };

      const result = service.interpolate(template, variables);
      const expected = previousInterpolate(template, variables);

      expect(result).toBe(expected);
      expect(result).toContain('John Doe');
      expect(result).toContain('30');
      expect(result).toContain('true');
      expect(result).toContain('"role": "admin"');
    });

    it('should leave unmatched placeholders as is', () => {
      const template = 'Hello {name}, your code is {code}';
      const variables = { name: 'Alice' };

      const result = service.interpolate(template, variables);
      expect(result).toBe('Hello Alice, your code is {code}');
    });
  });

  describe('Performance Benchmark', () => {
    it('benchmarks pre-compiled chunk interpolation against regex-based replacement', () => {
      const template =
        'Prompt system check for {agent}. Run task {taskId} on resource {resourceId} with config {config}. Status: {status}.';
      const variables = {
        agent: 'ClarifierAgent-Ultimate-Superpowers',
        taskId: 'task_9876543210_abc',
        resourceId: 'res_edge_worker_cloudflare',
        config: { retries: 5, timeout: 5000, enabled: true },
        status: 'completed',
      };

      const iterations = 20000;

      // Cold run to ensure parse caching is populated
      service.interpolate(template, variables);

      // Measure legacy implementation
      const legacyStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        previousInterpolate(template, variables);
      }
      const legacyDuration = Date.now() - legacyStart;

      // Measure optimized implementation
      const optStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        service.interpolate(template, variables);
      }
      const optDuration = Date.now() - optStart;

      console.log(
        `[Benchmark] Legacy regex-based interpolate (${iterations} runs): ${legacyDuration}ms`
      );
      console.log(
        `[Benchmark] Optimized pre-compiled chunk interpolate (${iterations} runs): ${optDuration}ms`
      );

      const speedup = (legacyDuration / optDuration).toFixed(2);
      console.log(`[Benchmark] Performance gain: ${speedup}x speedup`);

      // Verify execution correctness is identical
      expect(service.interpolate(template, variables)).toBe(
        previousInterpolate(template, variables)
      );
    });
  });
});
