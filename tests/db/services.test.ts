import { TaskService } from '@/lib/db/tasks';
import { DeliverableService } from '@/lib/db/deliverables';
import { IdeaService } from '@/lib/db/ideas';
import { VectorService } from '@/lib/db/vectors';
import { ClarificationService } from '@/lib/db/clarification';
import type { ClientProvider } from '@/lib/db/ideas';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

const createMockClientProvider = (): ClientProvider => ({
  getClient: jest.fn(),
  getAdmin: jest.fn(),
});

interface MockSupabaseChain {
  from: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
  single: jest.Mock;
  eq: jest.Mock;
  is: jest.Mock;
  order: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  range: jest.Mock;
  _result: { data: unknown; count: number | null; error: Error | null };
  then: (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise<unknown>;
}

const createMockSupabaseClient = (): MockSupabaseChain => {
  const chain: MockSupabaseChain = {
    from: jest.fn(),
    insert: jest.fn(),
    select: jest.fn(),
    single: jest.fn().mockResolvedValue({ data: null, count: null, error: null }),
    eq: jest.fn(),
    is: jest.fn(),
    order: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    range: jest.fn(),
    _result: { data: null, count: null, error: null },
    then: function (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown
    ) {
      return Promise.resolve(chain._result).then(resolve, reject);
    },
  };

  // Set up chain returns after object creation
  chain.from.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.is.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.range.mockReturnValue(chain);

  return chain;
};

describe('Database Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskService', () => {
    let taskService: TaskService;
    let mockProvider: ClientProvider;
    let mockClient: ReturnType<typeof createMockSupabaseClient>;
    let mockAdmin: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mockProvider = createMockClientProvider();
      mockClient = createMockSupabaseClient();
      mockAdmin = createMockSupabaseClient();
      (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
      (mockProvider.getAdmin as jest.Mock).mockReturnValue(mockAdmin);
      taskService = new TaskService(mockProvider);
    });

    describe('createTask', () => {
      it('should create a task successfully', async () => {
        const taskData = {
          deliverable_id: 'del-1',
          title: 'Test Task',
          status: 'todo' as const,
          estimate: 5,
          start_date: null,
          end_date: null,
          actual_hours: null,
          completion_percentage: 0,
          priority_score: 0,
          complexity_score: 0,
          risk_level: 'low' as const,
          milestone_id: null,
          tags: null,
          custom_fields: null,
        };
        const expectedTask = {
          id: 'task-1',
          ...taskData,
          created_at: new Date().toISOString(),
        };

        mockClient.single.mockResolvedValue({
          data: expectedTask,
          error: null,
        });

        const result = await taskService.createTask(taskData);

        expect(result).toEqual(expectedTask);
        expect(mockClient.from).toHaveBeenCalledWith('tasks');
        expect(mockClient.insert).toHaveBeenCalled();
      });

      it('should throw error when client is not initialized', async () => {
        (mockProvider.getClient as jest.Mock).mockReturnValue(null);

        await expect(
          taskService.createTask({
            deliverable_id: 'del-1',
            title: 'Test',
            status: 'todo',
            estimate: 5,
            start_date: null,
            end_date: null,
            actual_hours: null,
            completion_percentage: 0,
            priority_score: 0,
            complexity_score: 0,
            risk_level: 'low',
            milestone_id: null,
            tags: null,
            custom_fields: null,
          })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);
      });

      it('should throw error when database returns error', async () => {
        mockClient.single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

        await expect(
          taskService.createTask({
            deliverable_id: 'del-1',
            title: 'Test',
            status: 'todo',
            estimate: 5,
            start_date: null,
            end_date: null,
            actual_hours: null,
            completion_percentage: 0,
            priority_score: 0,
            complexity_score: 0,
            risk_level: 'low',
            milestone_id: null,
            tags: null,
            custom_fields: null,
          })
        ).rejects.toEqual({ message: 'Database error' });
      });
    });

    describe('createTasks', () => {
      it('should create multiple tasks successfully', async () => {
        const tasks = [
          {
            deliverable_id: 'del-1',
            title: 'Task 1',
            status: 'todo' as const,
            estimate: 5,
            start_date: null,
            end_date: null,
            actual_hours: null,
            completion_percentage: 0,
            priority_score: 0,
            complexity_score: 0,
            risk_level: 'low' as const,
            milestone_id: null,
            tags: null,
            custom_fields: null,
          },
        ];
        const expectedTasks = tasks.map((t, i) => ({
          id: `task-${i + 1}`,
          ...t,
          created_at: new Date().toISOString(),
        }));

        mockClient._result = { data: expectedTasks, error: null };

        const result = await taskService.createTasks(tasks);

        expect(result).toEqual(expectedTasks);
      });

      it('should return empty array when no data returned', async () => {
        mockClient._result = { data: null, error: null };

        const result = await taskService.createTasks([]);

        expect(result).toEqual([]);
      });
    });

    describe('getDeliverableTasks', () => {
      it('should return tasks for a deliverable', async () => {
        const tasks = [
          { id: 'task-1', deliverable_id: 'del-1', title: 'Task 1' },
          { id: 'task-2', deliverable_id: 'del-1', title: 'Task 2' },
        ];

        mockClient._result = { data: tasks, error: null };

        const result = await taskService.getDeliverableTasks('del-1');

        expect(result).toEqual(tasks);
        expect(mockClient.eq).toHaveBeenCalledWith('deliverable_id', 'del-1');
        expect(mockClient.is).toHaveBeenCalledWith('deleted_at', null);
      });

      it('should exclude soft-deleted tasks', async () => {
        const tasks = [{ id: 'task-1', deleted_at: null }];

        mockClient._result = { data: tasks, error: null };

        await taskService.getDeliverableTasks('del-1');

        expect(mockClient.is).toHaveBeenCalledWith('deleted_at', null);
      });
    });

    describe('getTask', () => {
      it('should return a task by ID', async () => {
        const task = { id: 'task-1', title: 'Test Task' };
        mockClient.single.mockResolvedValue({ data: task, error: null });

        const result = await taskService.getTask('task-1');

        expect(result).toEqual(task);
      });

      it('should return null when task not found', async () => {
        mockClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

        const result = await taskService.getTask('nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('updateTask', () => {
      it('should update a task successfully', async () => {
        const updatedTask = { id: 'task-1', title: 'Updated Task' };
        mockAdmin.single.mockResolvedValue({ data: updatedTask, error: null });

        const result = await taskService.updateTask('task-1', {
          title: 'Updated Task',
        });

        expect(result).toEqual(updatedTask);
        expect(mockAdmin.from).toHaveBeenCalledWith('tasks');
        expect(mockAdmin.update).toHaveBeenCalled();
      });

      it('should throw error when admin is not initialized', async () => {
        (mockProvider.getAdmin as jest.Mock).mockReturnValue(null);

        await expect(
          taskService.updateTask('task-1', { title: 'Updated' })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
      });
    });

    describe('softDeleteTask', () => {
      it('should soft delete a task', async () => {
        mockAdmin._result = { data: null, error: null };

        await taskService.softDeleteTask('task-1');

        expect(mockAdmin.from).toHaveBeenCalledWith('tasks');
        expect(mockAdmin.update).toHaveBeenCalled();
        expect(mockAdmin.eq).toHaveBeenCalledWith('id', 'task-1');
      });
    });

    describe('deleteTask', () => {
      it('should permanently delete a task', async () => {
        mockClient._result = { data: null, error: null };

        await taskService.deleteTask('task-1');

        expect(mockClient.from).toHaveBeenCalledWith('tasks');
        expect(mockClient.delete).toHaveBeenCalled();
        expect(mockClient.eq).toHaveBeenCalledWith('id', 'task-1');
      });
    });

    describe('getTaskWithOwnership', () => {
      it('should return task with deliverable and idea', async () => {
        const taskWithOwnership = {
          id: 'task-1',
          deliverable: { id: 'del-1' },
          idea: { idea: { id: 'idea-1', title: 'Test Idea' } },
        };
        mockClient.single.mockResolvedValue({
          data: taskWithOwnership,
          error: null,
        });

        const result = await taskService.getTaskWithOwnership('task-1');

        expect(result).toBeDefined();
        expect(result?.id).toBe('task-1');
      });

      it('should return null when task not found', async () => {
        mockClient.single.mockResolvedValue({ data: null, error: {} });

        const result = await taskService.getTaskWithOwnership('nonexistent');

        expect(result).toBeNull();
      });
    });
  });

  describe('DeliverableService', () => {
    let deliverableService: DeliverableService;
    let mockProvider: ClientProvider;
    let mockClient: ReturnType<typeof createMockSupabaseClient>;
    let mockAdmin: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mockProvider = createMockClientProvider();
      mockClient = createMockSupabaseClient();
      mockAdmin = createMockSupabaseClient();
      (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
      (mockProvider.getAdmin as jest.Mock).mockReturnValue(mockAdmin);
      deliverableService = new DeliverableService(mockProvider);
    });

    describe('createDeliverable', () => {
      it('should create a deliverable successfully', async () => {
        const deliverableData = {
          idea_id: 'idea-1',
          title: 'Test Deliverable',
          priority: 1,
          estimate_hours: 10,
          milestone_id: null,
          completion_percentage: 0,
          business_value: 5,
          risk_factors: null,
          acceptance_criteria: null,
          deliverable_type: 'feature' as const,
        };
        const expected = {
          id: 'del-1',
          ...deliverableData,
          created_at: new Date().toISOString(),
        };

        mockClient.single.mockResolvedValue({ data: expected, error: null });

        const result =
          await deliverableService.createDeliverable(deliverableData);

        expect(result).toEqual(expected);
        expect(mockClient.from).toHaveBeenCalledWith('deliverables');
      });

      it('should throw error when client is not initialized', async () => {
        (mockProvider.getClient as jest.Mock).mockReturnValue(null);

        await expect(
          deliverableService.createDeliverable({
            idea_id: 'idea-1',
            title: 'Test',
            priority: 1,
            estimate_hours: 10,
            milestone_id: null,
            completion_percentage: 0,
            business_value: 5,
            risk_factors: null,
            acceptance_criteria: null,
            deliverable_type: 'feature',
          })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);
      });
    });

    describe('createDeliverables', () => {
      it('should create multiple deliverables', async () => {
        const deliverables = [
          {
            idea_id: 'idea-1',
            title: 'Deliverable 1',
            priority: 1,
            estimate_hours: 10,
            milestone_id: null,
            completion_percentage: 0,
            business_value: 5,
            risk_factors: null,
            acceptance_criteria: null,
            deliverable_type: 'feature' as const,
          },
        ];
        const expected = deliverables.map((d, i) => ({
          id: `del-${i + 1}`,
          ...d,
          created_at: new Date().toISOString(),
        }));

        mockClient._result = { data: expected, error: null };

        const result =
          await deliverableService.createDeliverables(deliverables);

        expect(result).toEqual(expected);
      });
    });

    describe('getIdeaDeliverables', () => {
      it('should return deliverables for an idea', async () => {
        const deliverables = [
          { id: 'del-1', idea_id: 'idea-1', title: 'Deliverable 1' },
        ];

        mockClient._result = { data: deliverables, error: null };

        const result = await deliverableService.getIdeaDeliverables('idea-1');

        expect(result).toEqual(deliverables);
        expect(mockClient.eq).toHaveBeenCalledWith('idea_id', 'idea-1');
      });

      it('should order by priority descending', async () => {
        mockClient._result = { data: [], error: null };

        await deliverableService.getIdeaDeliverables('idea-1');

        expect(mockClient.order).toHaveBeenCalledWith('priority', {
          ascending: false,
        });
      });
    });

    describe('getIdeaDeliverablesWithTasks', () => {
      it('should return deliverables with tasks', async () => {
        const deliverables = [
          {
            id: 'del-1',
            idea_id: 'idea-1',
            tasks: [
              { id: 'task-1', created_at: '2024-01-01' },
              { id: 'task-2', created_at: '2024-01-02' },
            ],
          },
        ];

        mockClient._result = { data: deliverables, error: null };

        const result =
          await deliverableService.getIdeaDeliverablesWithTasks('idea-1');

        expect(result).toHaveLength(1);
        expect(result[0].tasks).toHaveLength(2);
      });

      it('should sort tasks by created_at ascending', async () => {
        const deliverables = [
          {
            id: 'del-1',
            tasks: [
              { id: 'task-2', created_at: '2024-01-02' },
              { id: 'task-1', created_at: '2024-01-01' },
            ],
          },
        ];

        mockClient._result = { data: deliverables, error: null };

        const result =
          await deliverableService.getIdeaDeliverablesWithTasks('idea-1');

        expect(result[0].tasks[0].id).toBe('task-1');
        expect(result[0].tasks[1].id).toBe('task-2');
      });

      it('should handle null tasks array', async () => {
        const deliverables = [{ id: 'del-1', tasks: null }];

        mockClient._result = { data: deliverables, error: null };

        const result =
          await deliverableService.getIdeaDeliverablesWithTasks('idea-1');

        expect(result[0].tasks).toEqual([]);
      });
    });

    describe('getDeliverableWithIdea', () => {
      it('should return deliverable with idea', async () => {
        const deliverable = {
          id: 'del-1',
          idea: { id: 'idea-1', title: 'Test Idea' },
        };
        mockClient.single.mockResolvedValue({
          data: deliverable,
          error: null,
        });

        const result = await deliverableService.getDeliverableWithIdea('del-1');

        expect(result).toEqual(deliverable);
      });

      it('should return null when not found', async () => {
        mockClient.single.mockResolvedValue({ data: null, error: {} });

        const result =
          await deliverableService.getDeliverableWithIdea('nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('updateDeliverable', () => {
      it('should update a deliverable', async () => {
        const updated = { id: 'del-1', title: 'Updated' };
        mockAdmin.single.mockResolvedValue({ data: updated, error: null });

        const result = await deliverableService.updateDeliverable('del-1', {
          title: 'Updated',
        });

        expect(result).toEqual(updated);
      });

      it('should throw error when admin not initialized', async () => {
        (mockProvider.getAdmin as jest.Mock).mockReturnValue(null);

        await expect(
          deliverableService.updateDeliverable('del-1', { title: 'Updated' })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
      });
    });

    describe('softDeleteDeliverable', () => {
      it('should soft delete a deliverable', async () => {
        mockAdmin._result = { data: null, error: null };

        await deliverableService.softDeleteDeliverable('del-1');

        expect(mockAdmin.from).toHaveBeenCalledWith('deliverables');
        expect(mockAdmin.update).toHaveBeenCalled();
        expect(mockAdmin.eq).toHaveBeenCalledWith('id', 'del-1');
      });
    });

    describe('deleteDeliverable', () => {
      it('should permanently delete a deliverable', async () => {
        mockClient._result = { data: null, error: null };

        await deliverableService.deleteDeliverable('del-1');

        expect(mockClient.from).toHaveBeenCalledWith('deliverables');
        expect(mockClient.delete).toHaveBeenCalled();
        expect(mockClient.eq).toHaveBeenCalledWith('id', 'del-1');
      });
    });
  });

  describe('IdeaService', () => {
    let ideaService: IdeaService;
    let mockProvider: ClientProvider;
    let mockClient: ReturnType<typeof createMockSupabaseClient>;
    let mockAdmin: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mockProvider = createMockClientProvider();
      mockClient = createMockSupabaseClient();
      mockAdmin = createMockSupabaseClient();
      (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
      (mockProvider.getAdmin as jest.Mock).mockReturnValue(mockAdmin);
      ideaService = new IdeaService(mockProvider);
    });

    describe('createIdea', () => {
      it('should create an idea successfully', async () => {
        const ideaData = {
          user_id: 'user-1',
          title: 'Test Idea',
          raw_text: 'Test raw text',
          status: 'draft' as const,
          deleted_at: null,
        };
        const expected = {
          id: 'idea-1',
          ...ideaData,
          created_at: new Date().toISOString(),
        };

        mockClient.single.mockResolvedValue({ data: expected, error: null });

        const result = await ideaService.createIdea(ideaData);

        expect(result).toEqual(expected);
        expect(mockClient.from).toHaveBeenCalledWith('ideas');
      });

      it('should throw error when client not initialized', async () => {
        (mockProvider.getClient as jest.Mock).mockReturnValue(null);

        await expect(
          ideaService.createIdea({
            user_id: 'user-1',
            title: 'Test',
            raw_text: 'Test',
            status: 'draft',
            deleted_at: null,
          })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);
      });
    });

    describe('getIdea', () => {
      it('should return an idea by ID', async () => {
        const idea = { id: 'idea-1', title: 'Test Idea' };
        mockClient.single.mockResolvedValue({ data: idea, error: null });

        const result = await ideaService.getIdea('idea-1');

        expect(result).toEqual(idea);
      });

      it('should return null when not found', async () => {
        mockClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

        const result = await ideaService.getIdea('nonexistent');

        expect(result).toBeNull();
      });

      it('should exclude soft-deleted ideas', async () => {
        mockClient.single.mockResolvedValue({ data: null, error: null });

        await ideaService.getIdea('idea-1');

        expect(mockClient.is).toHaveBeenCalledWith('deleted_at', null);
      });
    });

    describe('updateIdea', () => {
      it('should update an idea', async () => {
        const updated = { id: 'idea-1', title: 'Updated' };
        mockAdmin.single.mockResolvedValue({ data: updated, error: null });

        const result = await ideaService.updateIdea('idea-1', {
          title: 'Updated',
        });

        expect(result).toEqual(updated);
      });

      it('should throw error when admin not initialized', async () => {
        (mockProvider.getAdmin as jest.Mock).mockReturnValue(null);

        await expect(
          ideaService.updateIdea('idea-1', { title: 'Updated' })
        ).rejects.toThrow(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
      });
    });

    describe('softDeleteIdea', () => {
      it('should soft delete an idea', async () => {
        mockAdmin._result = { data: null, error: null };

        await ideaService.softDeleteIdea('idea-1');

        expect(mockAdmin.from).toHaveBeenCalledWith('ideas');
        expect(mockAdmin.update).toHaveBeenCalled();
        expect(mockAdmin.eq).toHaveBeenCalledWith('id', 'idea-1');
      });
    });

    describe('deleteIdea', () => {
      it('should permanently delete an idea', async () => {
        mockClient._result = { data: null, error: null };

        await ideaService.deleteIdea('idea-1');

        expect(mockClient.from).toHaveBeenCalledWith('ideas');
        expect(mockClient.delete).toHaveBeenCalled();
        expect(mockClient.eq).toHaveBeenCalledWith('id', 'idea-1');
      });
    });

    describe('getUserIdeas', () => {
      it('should return ideas for a user', async () => {
        const ideas = [
          { id: 'idea-1', user_id: 'user-1', title: 'Idea 1' },
          { id: 'idea-2', user_id: 'user-1', title: 'Idea 2' },
        ];

        mockClient._result = { data: ideas, error: null };

        const result = await ideaService.getUserIdeas('user-1');

        expect(result).toEqual(ideas);
        expect(mockClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
      });

      it('should exclude soft-deleted ideas', async () => {
        mockClient._result = { data: [], error: null };

        await ideaService.getUserIdeas('user-1');

        expect(mockClient.is).toHaveBeenCalledWith('deleted_at', null);
      });
    });

    describe('getUserIdeasPaginated', () => {
      it('should return paginated ideas with total count', async () => {
        const ideas = [{ id: 'idea-1', user_id: 'user-1', title: 'Idea 1' }];

        mockClient._result = { data: ideas, count: 1, error: null };

        const result = await ideaService.getUserIdeasPaginated('user-1', {
          page: 1,
          pageSize: 10,
        });

        expect(result.data).toEqual(ideas);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(10);
        expect(result.hasMore).toBe(false);
      });

      it('should correctly identify when more pages are available', async () => {
        const ideas = [{ id: 'idea-1', user_id: 'user-1', title: 'Idea 1' }];

        mockClient._result = { data: ideas, count: 15, error: null };

        const result = await ideaService.getUserIdeasPaginated('user-1', {
          page: 1,
          pageSize: 10,
        });

        expect(result.data).toEqual(ideas);
        expect(result.total).toBe(15);
        expect(result.hasMore).toBe(true);
      });

      it('should use default pagination options', async () => {
        mockClient._result = { data: [], count: 0, error: null };

        const result = await ideaService.getUserIdeasPaginated('user-1');

        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(50);
      });
    });

    describe('getIdeaSession', () => {
      it('should return an idea session', async () => {
        const session = { idea_id: 'idea-1', state: {} };
        mockClient.single.mockResolvedValue({ data: session, error: null });

        const result = await ideaService.getIdeaSession('idea-1');

        expect(result).toEqual(session);
      });

      it('should return null when not found', async () => {
        mockClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

        const result = await ideaService.getIdeaSession('nonexistent');

        expect(result).toBeNull();
      });
    });
  });

  describe('VectorService', () => {
    let vectorService: VectorService;
    let mockProvider: ClientProvider;
    let mockClient: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mockProvider = createMockClientProvider();
      mockClient = createMockSupabaseClient();
      (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
      vectorService = new VectorService(mockProvider);
    });

    describe('getVectorsPaginated', () => {
      it('should return paginated vectors with total count', async () => {
        const vectors = [
          { id: 'v-1', idea_id: 'idea-1', reference_type: 'context' },
        ];
        mockClient._result = { data: vectors, count: 1, error: null };

        const result = await vectorService.getVectorsPaginated('idea-1', 'context', {
          page: 1,
          pageSize: 10,
        });

        expect(result.data).toEqual(vectors);
        expect(result.total).toBe(1);
        expect(result.hasMore).toBe(false);
      });
    });
  });

  describe('ClarificationService', () => {
    let clarificationService: ClarificationService;
    let mockProvider: ClientProvider;
    let mockClient: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mockProvider = createMockClientProvider();
      mockClient = createMockSupabaseClient();
      (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
      clarificationService = new ClarificationService(mockProvider);
    });

    describe('getAgentLogsPaginated', () => {
      it('should return paginated agent logs with total count', async () => {
        const logs = [
          { id: 'log-1', agent: 'test-agent', action: 'test-action' },
        ];
        mockClient._result = { data: logs, count: 1, error: null };

        const result = await clarificationService.getAgentLogsPaginated('test-agent', {
          page: 1,
          pageSize: 10,
        });

        expect(result.data).toEqual(logs);
        expect(result.total).toBe(1);
        expect(result.hasMore).toBe(false);
      });
    });
  });
});
