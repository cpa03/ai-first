import { renderHook, act } from '@testing-library/react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { fetchWithTimeout } from '@/lib/api-client';

// Mock the dependencies
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
  const ideaId = 'test-idea-id';
  const mockTasksResponse = {
    success: true,
    data: {
      deliverables: [
        {
          id: 'd1',
          title: 'Deliverable 1',
          tasks: [
            { id: 't1', title: 'Task 1', status: 'todo', estimate: 2 },
          ],
          progress: 0,
          completedCount: 0,
          totalCount: 1,
          totalHours: 2,
          completedHours: 0,
        },
      ],
      summary: {
        totalDeliverables: 1,
        totalTasks: 1,
        completedTasks: 0,
        totalHours: 2,
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

  it('stabilizes handleToggleTaskStatus callback across data updates', async () => {
    const { result } = renderHook(() => useTaskManagement(ideaId));

    // Wait for initial fetch
    await act(async () => {
      // Small delay to allow useEffect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const firstCallback = result.current.handleToggleTaskStatus;

    // Simulate a data update by triggering a task toggle
    // Mock the PATCH response
    (fetchWithTimeout as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    const secondCallback = result.current.handleToggleTaskStatus;

    // The callback reference should be the same
    expect(firstCallback).toBe(secondCallback);
  });

  it('updates data correctly when toggling task status', async () => {
    const { result } = renderHook(() => useTaskManagement(ideaId));

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data?.summary.completedTasks).toBe(0);

    // Mock the PATCH response
    (fetchWithTimeout as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    expect(result.current.data?.summary.completedTasks).toBe(1);
    expect(result.current.data?.deliverables[0].tasks[0].status).toBe('completed');
  });
});
