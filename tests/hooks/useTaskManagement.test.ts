import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { fetchWithTimeout } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    errorWithContext: jest.fn(),
  })),
}));

jest.mock('@/lib/utils', () => ({
  triggerHapticFeedback: jest.fn(),
}));

describe('useTaskManagement', () => {
  const mockIdeaId = 'test-idea-id';
  const mockTasksResponse = {
    success: true,
    data: {
      deliverables: [
        {
          id: 'd1',
          title: 'Deliverable 1',
          tasks: [
            { id: 't1', title: 'Task 1', status: 'todo', estimate: 1 },
            { id: 't2', title: 'Task 2', status: 'todo', estimate: 2 },
          ],
          progress: 0,
          completedCount: 0,
          totalCount: 2,
          totalHours: 3,
          completedHours: 0,
        },
      ],
      summary: {
        totalDeliverables: 1,
        totalTasks: 2,
        completedTasks: 0,
        totalHours: 3,
        completedHours: 0,
        overallProgress: 0,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasksResponse),
    });
  });

  it('fetches tasks on mount', async () => {
    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      ideaId: mockIdeaId,
      deliverables: mockTasksResponse.data.deliverables,
      summary: mockTasksResponse.data.summary,
    });
    expect(fetchWithTimeout).toHaveBeenCalledWith(`/api/ideas/${mockIdeaId}/tasks`);
  });

  it('handleToggleTaskStatus reference remains stable when data updates', async () => {
    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstCallback = result.current.handleToggleTaskStatus;

    // Trigger a status toggle (optimistic update)
    (fetchWithTimeout as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    const secondCallback = result.current.handleToggleTaskStatus;

    // The callback should remain stable because it no longer depends on [data]
    expect(firstCallback).toBe(secondCallback);
  });
});
