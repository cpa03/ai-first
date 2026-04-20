import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskManagement } from '@/hooks/useTaskManagement';

jest.mock('@/lib/api-client', () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  triggerHapticFeedback: jest.fn(),
}));

const mockFetch = require('@/lib/api-client').fetchWithTimeout as jest.Mock;

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
            { id: 't1', title: 'Task 1', status: 'todo', estimate: 2 },
            { id: 't2', title: 'Task 2', status: 'completed', estimate: 3 },
          ],
          progress: 50,
          completedCount: 1,
          totalCount: 2,
          totalHours: 5,
          completedHours: 3,
        },
      ],
      summary: {
        totalDeliverables: 1,
        totalTasks: 2,
        completedTasks: 1,
        totalHours: 5,
        completedHours: 3,
        overallProgress: 50,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();

    // Mock showToast on window
    (window as any).showToast = jest.fn();
  });

  it('starts in loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useTaskManagement(mockIdeaId));
    expect(result.current.loading).toBe(true);
  });

  it('fetches tasks successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasksResponse,
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.deliverables).toHaveLength(1);
    expect(result.current.data?.summary.totalTasks).toBe(2);
    expect(result.current.expandedDeliverables.has('d1')).toBe(true);
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch');
  });

  it('toggles task status optimistically', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasksResponse,
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock the PATCH call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    expect(result.current.data?.deliverables[0].tasks[0].status).toBe('completed');
    expect(result.current.data?.summary.completedTasks).toBe(2);
    expect(result.current.data?.summary.overallProgress).toBe(100);
  });

  it('rolls back on toggle error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasksResponse,
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock the PATCH call to fail
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Update failed' }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    // Should rollback to 'todo'
    expect(result.current.data?.deliverables[0].tasks[0].status).toBe('todo');
    expect((window as any).showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });

  it('toggles deliverable expansion', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasksResponse,
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.expandedDeliverables.has('d1')).toBe(true);

    act(() => {
      result.current.toggleDeliverable('d1');
    });

    expect(result.current.expandedDeliverables.has('d1')).toBe(false);
  });

  it('expands and collapses all', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasksResponse,
    });

    const { result } = renderHook(() => useTaskManagement(mockIdeaId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.collapseAll();
    });
    expect(result.current.expandedDeliverables.size).toBe(0);

    act(() => {
      result.current.expandAll();
    });
    expect(result.current.expandedDeliverables.has('d1')).toBe(true);
  });
});
