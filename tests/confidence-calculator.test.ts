/**
 * ConfidenceCalculator Module Unit Tests
 *
 * Tests the ConfidenceCalculator module which computes weighted confidence
 * from all breakdown stages.
 */

import { ConfidenceCalculator } from '@/lib/agents/breakdown-engine/ConfidenceCalculator';
import { BreakdownSession } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('ConfidenceCalculator', () => {
  let calculator: ConfidenceCalculator;

  beforeEach(() => {
    calculator = new ConfidenceCalculator();
  });

  describe('calculateOverallConfidence', () => {
    it('should calculate weighted confidence from complete session', () => {
      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.8,
        },
        tasks: { tasks: [], totalEstimatedHours: 40, confidence: 0.75 },
        dependencies: { nodes: [], edges: [], criticalPath: [] },
        timeline: {
          startDate: new Date(),
          endDate: new Date(),
          totalWeeks: 8,
          milestones: [],
          phases: [],
          criticalPath: [],
          resourceAllocation: {},
        },
        status: 'completed',
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = calculator.calculateOverallConfidence(session);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
      expect(confidence).toBeCloseTo(0.77, 2);
    });

    it('should handle missing components gracefully', () => {
      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: null,
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing',
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = calculator.calculateOverallConfidence(session);

      expect(confidence).toBe(0);
    });

    it('should calculate partial confidence with only analysis', () => {
      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.9,
        },
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing',
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = calculator.calculateOverallConfidence(session);

      expect(confidence).toBeCloseTo(0.27, 2);
    });

    it('should handle varying confidence levels', () => {
      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'medium', estimatedWeeks: 8, teamSize: 2 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 1.0,
        },
        tasks: { tasks: [], totalEstimatedHours: 40, confidence: 1.0 },
        dependencies: { nodes: [], edges: [], criticalPath: [] },
        timeline: {
          startDate: new Date(),
          endDate: new Date(),
          totalWeeks: 8,
          milestones: [],
          phases: [],
          criticalPath: [],
          resourceAllocation: {},
        },
        status: 'completed',
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const confidence = calculator.calculateOverallConfidence(session);

      expect(confidence).toBeCloseTo(0.9, 2);
    });
  });
});
