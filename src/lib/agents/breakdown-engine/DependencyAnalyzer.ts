import { createLogger } from '@/lib/logger';
import { TaskDecomposition, DependencyGraph } from '../breakdown-engine';

const _logger = createLogger('DependencyAnalyzer');

export class DependencyAnalyzer {
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
    const dependencyMap = new Map<string, string[]>();

    taskDecomposition.tasks.forEach((task) => {
      if (task.dependencies.length > 0) {
        dependencyMap.set(task.id, task.dependencies);
        task.dependencies.forEach((depId) => {
          edges.push({
            from: depId,
            to: task.id,
            type: 'finish_to_start' as const,
            lag: 0,
          });
        });
      }
    });

    const criticalPath = this.calculateCriticalPath(nodes, edges);

    return {
      nodes,
      edges,
      criticalPath,
    };
  }

  private calculateCriticalPath(
    nodes: Array<{ id: string; title: string; estimatedHours?: number }>,
    edges: Array<{
      from: string;
      to: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
      lag: number;
    }>
  ): string[] {
    const visited = new Set<string>();
    const path: string[] = [];

    const startTasks = nodes.filter(
      (node) => !edges.some((edge) => edge.to === node.id)
    );

    if (startTasks.length > 0) {
      let current = startTasks[0].id;
      path.push(current);

      while (current) {
        const nextEdge = edges.find((edge) => edge.from === current);
        if (nextEdge && !visited.has(nextEdge.to)) {
          current = nextEdge.to;
          path.push(current);
          visited.add(current);
        } else {
          break;
        }
      }
    }

    return path.length > 0 ? path : nodes.map((n) => n.id);
  }
}
