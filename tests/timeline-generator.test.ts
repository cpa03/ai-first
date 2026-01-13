/**
 * TimelineGenerator Module Unit Tests
 *
 * Tests TimelineGenerator module which creates project phases,
 * milestones, and resource allocation.
 */

import { TimelineGenerator } from '@/lib/agents/breakdown-engine/TimelineGenerator';
import {
  IdeaAnalysis,
  TaskDecomposition,
  DependencyGraph,
} from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('TimelineGenerator', () => {
  let generator: TimelineGenerator;

  beforeEach(() => {
    generator = new TimelineGenerator();
  });

  describe('generateTimeline', () => {
    const createMockAnalysis = (): IdeaAnalysis => ({
      objectives: [],
      deliverables: [
        {
          title: 'Phase 1',
          description: 'MVP',
          priority: 1,
          estimatedHours: 40,
          confidence: 0.9,
        },
        {
          title: 'Phase 2',
          description: 'Enhancements',
          priority: 2,
          estimatedHours: 40,
          confidence: 0.85,
        },
        {
          title: 'Phase 3',
          description: 'Testing',
          priority: 3,
          estimatedHours: 20,
          confidence: 0.8,
        },
      ],
      complexity: { score: 5, factors: [], level: 'medium' },
      scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
      riskFactors: [],
      successCriteria: [],
      overallConfidence: 0.85,
    });

    const createMockTasks = (): TaskDecomposition => ({
      tasks: [],
      totalEstimatedHours: 100,
      confidence: 0.75,
    });

    const createMockDependencies = (): DependencyGraph => ({
      nodes: [],
      edges: [],
      criticalPath: [],
    });

    it('should generate project timeline', () => {
      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        createMockTasks(),
        createMockDependencies(),
        { teamSize: 2 }
      );

      expect(timeline.startDate).toBeInstanceOf(Date);
      expect(timeline.endDate).toBeInstanceOf(Date);
      expect(timeline.totalWeeks).toBeGreaterThan(0);
      expect(timeline.milestones).toHaveLength(3);
      expect(timeline.phases).toHaveLength(3);
      expect(timeline.phases[0].name).toBe('Planning & Design');
      expect(timeline.phases[1].name).toBe('Development');
      expect(timeline.phases[2].name).toBe('Testing & Deployment');
      expect(timeline.criticalPath).toBeDefined();
      expect(timeline.resourceAllocation).toEqual({ default: 2 });
    });

    it('should adjust timeline based on team size', () => {
      const timeline1 = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: 80, confidence: 0.75 },
        createMockDependencies(),
        { teamSize: 1 }
      );

      const timeline2 = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: 80, confidence: 0.75 },
        createMockDependencies(),
        { teamSize: 4 }
      );

      expect(timeline1.totalWeeks).toBeGreaterThan(timeline2.totalWeeks);
    });

    it('should calculate correct total weeks based on hours and team size', () => {
      const hoursPerWeek = 40;
      const totalHours = 120;
      const teamSize = 3;
      const expectedWeeks = Math.ceil(totalHours / (hoursPerWeek * teamSize));

      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: totalHours, confidence: 0.75 },
        createMockDependencies(),
        { teamSize }
      );

      expect(timeline.totalWeeks).toBe(expectedWeeks);
    });

    it('should create milestones for each deliverable', () => {
      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        createMockTasks(),
        createMockDependencies(),
        {}
      );

      expect(timeline.milestones).toHaveLength(3);
      expect(timeline.milestones[0].title).toBe('Phase 1');
      expect(timeline.milestones[1].title).toBe('Phase 2');
      expect(timeline.milestones[2].title).toBe('Phase 3');
      timeline.milestones.forEach((milestone) => {
        expect(milestone.id).toBeDefined();
        expect(milestone.date).toBeInstanceOf(Date);
        expect(milestone.dependencies).toEqual([]);
      });
    });

    it('should set default team size to 1 when not specified', () => {
      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: 40, confidence: 0.75 },
        createMockDependencies(),
        {}
      );

      expect(timeline.resourceAllocation).toEqual({ default: 1 });
    });

    it('should create phase tasks based on planning and development ratios', () => {
      const tasks: TaskDecomposition = {
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 1',
          },
          {
            id: 't2',
            title: 'Task 2',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 2',
          },
          {
            id: 't3',
            title: 'Task 3',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 3',
          },
          {
            id: 't4',
            title: 'Task 4',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 1',
          },
          {
            id: 't5',
            title: 'Task 5',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 1',
          },
          {
            id: 't6',
            title: 'Task 6',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 2',
          },
          {
            id: 't7',
            title: 'Task 7',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 2',
          },
          {
            id: 't8',
            title: 'Task 8',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 3',
          },
          {
            id: 't9',
            title: 'Task 9',
            description: 'Desc',
            estimatedHours: 10,
            complexity: 3,
            requiredSkills: [],
            dependencies: [],
            deliverableId: 'Phase 3',
          },
        ],
        totalEstimatedHours: 90,
        confidence: 0.75,
      };

      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        tasks,
        createMockDependencies(),
        {}
      );

      expect(timeline.phases[0].tasks).toContain('t1');
      expect(timeline.phases[0].tasks).toContain('t2');
      expect(timeline.phases[1].tasks).toContain('t4');
      expect(timeline.phases[1].tasks).toContain('t6');
      expect(timeline.phases[1].tasks).toContain('t8');
      expect(timeline.phases[2].tasks).toContain('t9');
    });

    it('should assign deliverables to appropriate phases', () => {
      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        createMockTasks(),
        createMockDependencies(),
        {}
      );

      expect(timeline.phases[0].deliverables).toContain('Phase 1');
      expect(timeline.phases[1].deliverables).toContain('Phase 2');
      expect(timeline.phases[2].deliverables).toContain('Phase 3');
    });

    it('should calculate phase dates sequentially', () => {
      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: 120, confidence: 0.75 },
        createMockDependencies(),
        { teamSize: 1 }
      );

      expect(timeline.phases[0].startDate.getTime()).toBeLessThan(
        timeline.phases[0].endDate.getTime()
      );
      expect(timeline.phases[0].endDate.getTime()).toBeLessThanOrEqual(
        timeline.phases[1].startDate.getTime()
      );
      expect(timeline.phases[1].startDate.getTime()).toBeLessThan(
        timeline.phases[1].endDate.getTime()
      );
      expect(timeline.phases[1].endDate.getTime()).toBeLessThanOrEqual(
        timeline.phases[2].startDate.getTime()
      );
      expect(timeline.phases[2].startDate.getTime()).toBeLessThan(
        timeline.phases[2].endDate.getTime()
      );
    });

    it('should include critical path from dependencies', () => {
      const mockDependencies: DependencyGraph = {
        nodes: [],
        edges: [],
        criticalPath: ['t1', 't2', 't3'],
      };

      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        createMockTasks(),
        mockDependencies,
        {}
      );

      expect(timeline.criticalPath).toEqual(['t1', 't2', 't3']);
    });

    it('should calculate end date based on total weeks', () => {
      const expectedWeeks = 3;
      const startDate = new Date();
      const expectedEndDate = new Date(
        startDate.getTime() + expectedWeeks * 7 * 24 * 60 * 60 * 1000
      );

      const timeline = generator.generateTimeline(
        createMockAnalysis(),
        { tasks: [], totalEstimatedHours: 120, confidence: 0.75 },
        createMockDependencies(),
        { teamSize: 1 }
      );

      expect(timeline.endDate.getTime()).toBeCloseTo(
        expectedEndDate.getTime(),
        -2
      );
    });
  });
});
