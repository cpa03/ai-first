/**
 * SessionManager Module Unit Tests
 *
 * Tests SessionManager module which manages breakdown session persistence.
 */

import { SessionManager } from '@/lib/agents/breakdown-engine/SessionManager';
import { BreakdownSession } from '@/lib/agents/breakdown-engine';

jest.mock('@/lib/db', () => ({
  dbService: {
    storeVector: jest.fn(),
    getVectors: jest.fn(),
    createDeliverable: jest.fn(),
    getIdeaDeliverables: jest.fn(),
    createTask: jest.fn(),
    updateIdea: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new SessionManager();
  });

  describe('storeSession', () => {
    it('should store session in database', async () => {
      const { dbService } = require('@/lib/db');

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

      dbService.storeVector.mockResolvedValue(undefined);

      await manager.storeSession(session);

      expect(dbService.storeVector).toHaveBeenCalledWith({
        idea_id: 'idea-123',
        vector_data: session,
        reference_type: 'breakdown_session',
        reference_id: 'test-session',
      });
    });
  });

  describe('getBreakdownSession', () => {
    it('should retrieve existing session', async () => {
      const { dbService } = require('@/lib/db');

      const mockSessionData = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.8,
        },
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing',
        confidence: 0.5,
        processingTime: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbService.getVectors.mockResolvedValue([
        { vector_data: mockSessionData } as any,
      ]);

      const session = await manager.getBreakdownSession('idea-123');

      expect(session).toBeDefined();
      expect(session?.ideaId).toBe('idea-123');
      expect(session?.id).toBe('test-session');
      expect(session?.createdAt).toBeInstanceOf(Date);
      expect(session?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent session', async () => {
      const { dbService } = require('@/lib/db');

      dbService.getVectors.mockResolvedValue([]);

      const session = await manager.getBreakdownSession('non-existent');

      expect(session).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const { dbService } = require('@/lib/db');

      dbService.getVectors.mockRejectedValue(new Error('Database error'));

      const session = await manager.getBreakdownSession('idea-123');

      expect(session).toBeNull();
    });
  });

  describe('persistResults', () => {
    it('should persist analysis and tasks to database', async () => {
      const { dbService } = require('@/lib/db');

      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [
            {
              title: 'Deliverable 1',
              description: 'Description 1',
              priority: 1,
              estimatedHours: 10,
              confidence: 0.8,
            },
            {
              title: 'Deliverable 2',
              description: 'Description 2',
              priority: 2,
              estimatedHours: 15,
              confidence: 0.85,
            },
          ],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.8,
        },
        tasks: {
          tasks: [
            {
              id: 't1',
              title: 'Task 1',
              description: 'Task 1 description',
              estimatedHours: 5,
              complexity: 3,
              requiredSkills: [],
              dependencies: [],
              deliverableId: 'Deliverable 1',
            },
            {
              id: 't2',
              title: 'Task 2',
              description: 'Task 2 description',
              estimatedHours: 8,
              complexity: 4,
              requiredSkills: [],
              dependencies: [],
              deliverableId: 'Deliverable 2',
            },
          ],
          totalEstimatedHours: 13,
          confidence: 0.75,
        },
        dependencies: null,
        timeline: null,
        status: 'completed',
        confidence: 0.8,
        processingTime: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dbService.createDeliverable.mockResolvedValue({ id: 'del-1' } as any);
      dbService.createDeliverable.mockResolvedValue({ id: 'del-2' } as any);
      dbService.getIdeaDeliverables.mockResolvedValue([
        { id: 'del-1', title: 'Deliverable 1' } as any,
        { id: 'del-2', title: 'Deliverable 2' } as any,
      ]);
      dbService.createTask.mockResolvedValue({ id: 'task-1' } as any);
      dbService.createTask.mockResolvedValue({ id: 'task-2' } as any);
      dbService.updateIdea.mockResolvedValue(undefined);

      await manager.persistResults(session);

      expect(dbService.createDeliverable).toHaveBeenCalledTimes(2);
      expect(dbService.createTask).toHaveBeenCalledTimes(2);
      expect(dbService.updateIdea).toHaveBeenCalledWith('idea-123', {
        status: 'breakdown',
      });
    });

    it('should skip persistence when analysis or tasks missing', async () => {
      const { dbService } = require('@/lib/db');

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

      await manager.persistResults(session);

      expect(dbService.createDeliverable).not.toHaveBeenCalled();
      expect(dbService.createTask).not.toHaveBeenCalled();
      expect(dbService.updateIdea).not.toHaveBeenCalled();
    });

    it('should handle persistence errors', async () => {
      const { dbService } = require('@/lib/db');

      const session: BreakdownSession = {
        id: 'test-session',
        ideaId: 'idea-123',
        analysis: {
          objectives: [],
          deliverables: [
            {
              title: 'Deliverable 1',
              description: 'Description 1',
              priority: 1,
              estimatedHours: 10,
              confidence: 0.8,
            },
          ],
          complexity: { score: 5, factors: [], level: 'medium' },
          scope: { size: 'small', estimatedWeeks: 2, teamSize: 1 },
          riskFactors: [],
          successCriteria: [],
          overallConfidence: 0.8,
        },
        tasks: {
          tasks: [],
          totalEstimatedHours: 10,
          confidence: 0.75,
        },
        dependencies: null,
        timeline: null,
        status: 'completed',
        confidence: 0.8,
        processingTime: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dbService.createDeliverable.mockRejectedValue(
        new Error('Database error')
      );

      await expect(manager.persistResults(session)).rejects.toThrow();
    });
  });
});
