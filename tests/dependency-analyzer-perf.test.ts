/**
 * DependencyAnalyzer Performance Benchmark
 *
 * Verifies that DependencyAnalyzer scales efficiently (O(V + E))
 * when handling large task graphs.
 */

import { DependencyAnalyzer } from '@/lib/agents/breakdown-engine/DependencyAnalyzer';
import { TaskDecomposition } from '@/lib/agents/breakdown-engine/types';

describe('DependencyAnalyzer Performance', () => {
  let analyzer: DependencyAnalyzer;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
  });

  function generateLinearTasks(count: number): TaskDecomposition {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: `t${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        estimatedHours: 1,
        complexity: 1,
        requiredSkills: [],
        dependencies: i > 0 ? [`t${i - 1}`] : [],
        deliverableId: 'd1',
      });
    }
    return {
      tasks,
      totalEstimatedHours: count,
      confidence: 0.9,
    };
  }

  it('handles 1,000 tasks in a linear chain efficiently', () => {
    const taskCount = 1000;
    const mockTasks = generateLinearTasks(taskCount);

    const start = performance.now();
    const result = analyzer.analyzeDependencies(mockTasks);
    const end = performance.now();

    const duration = end - start;
    console.log(`[PERF] Analysis of ${taskCount} tasks took ${duration.toFixed(4)}ms`);

    expect(result.nodes).toHaveLength(taskCount);
    expect(result.edges).toHaveLength(taskCount - 1);
    expect(result.criticalPath).toHaveLength(taskCount);

    // O(V + E) should be extremely fast (sub-millisecond or low single digits)
    // On most CI/CD runners, 1000 nodes should take < 2ms.
    expect(duration).toBeLessThan(10);
  });

  it('scales to 10,000 tasks without exponential growth', () => {
    // 1,000 tasks
    const smallCount = 1000;
    const smallTasks = generateLinearTasks(smallCount);
    const startSmall = performance.now();
    analyzer.analyzeDependencies(smallTasks);
    const durationSmall = performance.now() - startSmall;

    // 10,000 tasks (10x larger)
    const largeCount = 10000;
    const largeTasks = generateLinearTasks(largeCount);
    const startLarge = performance.now();
    analyzer.analyzeDependencies(largeTasks);
    const durationLarge = performance.now() - startLarge;

    console.log(`[PERF] 1k tasks: ${durationSmall.toFixed(4)}ms, 10k tasks: ${durationLarge.toFixed(4)}ms`);

    // In O(V*E), 10x size = 100x time.
    // In O(V+E), 10x size = ~10x time (ignoring constant factors and GC).
    // We allow a generous buffer for environment variability.
    expect(durationLarge).toBeLessThan(durationSmall * 30);
  });
});
