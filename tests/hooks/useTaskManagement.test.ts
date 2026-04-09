import { renderHook, act } from '@testing-library/react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { fetchWithTimeout } from '@/lib/api-client';

// Mock dependencies
jest.mock('@/lib/api-client', () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    errorWithContext: jest.fn(),
  }),
}));

jest.mock('@/lib/utils', () => ({
  triggerHapticFeedback: jest.fn(),
}));

describe('useTaskManagement', () => {
  const ideaId = 'idea-123';
  const mockTasks = [
    {
      id: 'd1',
      title: 'Deliverable 1',
      tasks: [
        { id: 't1', title: 'Task 1', status: 'todo', estimate: 1 },
      ],
      progress: 0,
      completedCount: 0,
      totalCount: 1,
      totalHours: 1,
      completedHours: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          deliverables: mockTasks,
          summary: {
            totalDeliverables: 1,
            totalTasks: 1,
            completedTasks: 0,
            totalHours: 1,
            completedHours: 0,
            overallProgress: 0,
          },
        },
      }),
    });
  });

  it('should initialize with loading state and fetch tasks', async () => {
    let result: any;
    await act(async () => {
      const rendered = renderHook(() => useTaskManagement(ideaId));
      result = rendered.result;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).not.toBeNull();
    expect(result.current.data.deliverables).toHaveLength(1);
    expect(fetchWithTimeout).toHaveBeenCalledWith(`/api/ideas/${ideaId}/tasks`);
  });

  it('should maintain stable handleToggleTaskStatus callback across data changes', async () => {
    let result: any;
    let rerender: any;

    await act(async () => {
      const rendered = renderHook(() => useTaskManagement(ideaId));
      result = rendered.result;
      rerender = rendered.rerender;
    });

    const initialCallback = result.current.handleToggleTaskStatus;

    // Simulate task status toggle which updates state
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    // Check if data updated
    expect(result.current.data.summary.completedTasks).toBe(1);

    // Check if callback reference is still the same
    expect(result.current.handleToggleTaskStatus).toBe(initialCallback);
  });
});
