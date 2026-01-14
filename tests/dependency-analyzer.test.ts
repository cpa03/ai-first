/**
 * DependencyAnalyzer Module Unit Tests
 *
 * Tests DependencyAnalyzer module which builds dependency graphs
 * and identifies critical paths.
 */

import { DependencyAnalyzer } from '@/lib/agents/breakdown-engine/DependencyAnalyzer';
import { TaskDecomposition } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
  });

  describe('analyzeDependencies', () => {
    it('should analyze task dependencies correctly', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            description: 'Description 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            description: 'Description 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: ['t1'],
            deliverableId: 'd1',
          },
          {
            id: 't3',
            title: 'Task 3',
            description: 'Description 3',
            estimatedHours: 6,
            complexity: 4,
            requiredSkills: [],
            dependencies: ['t2'],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 18,
        confidence: 0.8,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.nodes).toHaveLength(3);
      expect(dependencies.edges).toHaveLength(2);
      expect(dependencies.edges[0]).toEqual({
        from: 't1',
        to: 't2',
        type: 'finish_to_start',
        lag: 0,
      });
      expect(dependencies.edges[1]).toEqual({
        from: 't2',
        to: 't3',
        type: 'finish_to_start',
        lag: 0,
      });
      expect(dependencies.criticalPath).toBeDefined();
      expect(dependencies.criticalPath.length).toBeGreaterThan(0);
    });

    it('should handle tasks without dependencies', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            description: 'Description 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            description: 'Description 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 12,
        confidence: 0.8,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.edges).toHaveLength(0);
      expect(dependencies.criticalPath).toBeDefined();
      expect(dependencies.criticalPath.length).toBeGreaterThan(0);
    });

    it('should create nodes with correct properties', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Test Task',
            description: 'Test description',
            estimatedHours: 10,
            complexity: 5,
            requiredSkills: ['JavaScript'],
            dependencies: [],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 10,
        confidence: 0.8,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.nodes[0]).toEqual({
        id: 't1',
        title: 'Test Task',
        type: 'task',
        estimatedHours: 10,
      });
    });

    it('should handle tasks with multiple dependencies', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            description: 'Description 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            description: 'Description 2',
            estimatedHours: 6,
            complexity: 4,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't3',
            title: 'Task 3',
            description: 'Description 3',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: ['t1', 't2'],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 18,
        confidence: 0.8,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.edges).toHaveLength(2);
      expect(dependencies.edges[0].from).toBe('t1');
      expect(dependencies.edges[0].to).toBe('t3');
      expect(dependencies.edges[1].from).toBe('t2');
      expect(dependencies.edges[1].to).toBe('t3');
    });

    it('should handle empty task list', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [],
        totalEstimatedHours: 0,
        confidence: 0,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.nodes).toHaveLength(0);
      expect(dependencies.edges).toHaveLength(0);
      expect(dependencies.criticalPath).toHaveLength(0);
    });

    it('should calculate critical path for linear dependencies', () => {
      const mockTasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            description: 'Description 1',
            estimatedHours: 4,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'd1',
          },
          {
            id: 't2',
            title: 'Task 2',
            description: 'Description 2',
            estimatedHours: 8,
            complexity: 5,
            requiredSkills: [],
            dependencies: ['t1'],
            deliverableId: 'd1',
          },
          {
            id: 't3',
            title: 'Task 3',
            description: 'Description 3',
            estimatedHours: 6,
            complexity: 4,
            requiredSkills: [],
            dependencies: ['t2'],
            deliverableId: 'd1',
          },
        ],
        totalEstimatedHours: 18,
        confidence: 0.8,
      };

      const dependencies = analyzer.analyzeDependencies(mockTasks);

      expect(dependencies.criticalPath).toContain('t1');
      expect(dependencies.criticalPath).toContain('t2');
      expect(dependencies.criticalPath).toContain('t3');
    });
  });
});
