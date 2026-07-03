import type { TaskDecomposition, DependencyGraph } from './types';

export class DependencyAnalyzer {
  /**
   * Analyzes dependencies between tasks and identifies the critical path.
   * PERFORMANCE: O(V + E) complexity where V is number of tasks and E is number of dependencies.
   */
  analyzeDependencies(taskDecomposition: TaskDecomposition): DependencyGraph {
    const nodes = taskDecomposition.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      estimatedHours: task.estimatedHours,
    }));

    const edges: Array<{
      from: string;
      to: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
      lag: number;
    }> = [];

    // PERFORMANCE: Use for-loop instead of forEach for better performance in V8
    for (let i = 0; i < taskDecomposition.tasks.length; i++) {
      const task = taskDecomposition.tasks[i];
      const deps = task.dependencies;
      for (let j = 0; j < deps.length; j++) {
        edges.push({
          from: deps[j],
          to: task.id,
          type: 'finish_to_start' as const,
          lag: 0,
        });
      }
    }

    const criticalPath = this.calculateCriticalPath(nodes, edges);

    return {
      nodes,
      edges,
      criticalPath,
    };
  }

  /**
   * Calculates the critical path (linear chain of dependencies).
   * PERFORMANCE: O(V + E) using adjacency Map and incoming edge Set.
   * Replaces O(V * E) implementation that used nested scans.
   */
  private calculateCriticalPath(
    nodes: Array<{ id: string; title: string; estimatedHours?: number }>,
    edges: Array<{
      from: string;
      to: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
      lag: number;
    }>
  ): string[] {
    if (nodes.length === 0) return [];

    const hasIncoming = new Set<string>();
    const adjacency = new Map<string, string>(); // Simplified: one-path logic matches original

    // PERFORMANCE: Single pass O(E) to build lookup structures
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      hasIncoming.add(edge.to);
      // We only care about the first outgoing edge per node for the current simple path logic
      if (!adjacency.has(edge.from)) {
        adjacency.set(edge.from, edge.to);
      }
    }

    // PERFORMANCE: Identification of start tasks in O(V)
    const startTasks: string[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i].id;
      if (!hasIncoming.has(nodeId)) {
        startTasks.push(nodeId);
      }
    }

    const path: string[] = [];
    if (startTasks.length > 0) {
      const visited = new Set<string>();
      let current: string | undefined = startTasks[0];

      // PERFORMANCE: Path traversal in O(V) via Map lookup
      while (current && !visited.has(current)) {
        path.push(current);
        visited.add(current);
        current = adjacency.get(current);
      }
    }

    return path.length > 0 ? path : nodes.map((n) => n.id);
  }
}
