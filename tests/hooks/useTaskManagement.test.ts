import { renderHook, act } from '@testing-library/react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { fetchWithTimeout } from '@/lib/api-client';

// Mock dependencies
jest.mock('@/lib/api-client');
jest.mock('@/lib/utils', () => ({
  triggerHapticFeedback: jest.fn(),
}));
jest.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    errorWithContext: jest.fn(),
  }),
}));

const mockData = {
  success: true,
  data: {
    ideaId: 'test-idea',
    deliverables: [
      {
        id: 'd1',
        title: 'Deliverable 1',
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            status: 'todo',
            estimate: 2,
          },
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

describe('useTaskManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tasks on mount', async () => {
    (fetchWithTimeout as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useTaskManagement('test-idea'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      // Wait for useEffect
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data?.deliverables[0].title).toBe('Deliverable 1');
  });

  it('should perform optimistic update when toggling task', async () => {
    (fetchWithTimeout as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => JSON.parse(JSON.stringify(mockData)),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useTaskManagement('test-idea'));

    await act(async () => {
      // Wait for initial fetch
    });

    let promise: Promise<void>;
    await act(async () => {
      promise = result.current.handleToggleTaskStatus('t1', 'todo');
      // Wait for the state update inside act
    });

    // Check optimistic state
    expect(result.current.data?.deliverables[0].tasks[0].status).toBe('completed');
    expect(result.current.data?.summary.completedTasks).toBe(1);

    await act(async () => {
      await promise;
    });

    expect(result.current.data?.deliverables[0].tasks[0].status).toBe('completed');
  });

  it('should have a stable handleToggleTaskStatus callback', async () => {
     (fetchWithTimeout as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => JSON.parse(JSON.stringify(mockData)),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useTaskManagement('test-idea'));

    await act(async () => {
      // Wait for initial fetch
    });

    const callbackBeforeUpdate = result.current.handleToggleTaskStatus;

    await act(async () => {
      await result.current.handleToggleTaskStatus('t1', 'todo');
    });

    const callbackAfterUpdate = result.current.handleToggleTaskStatus;

    // This is expected to FAIL before optimization
    expect(callbackBeforeUpdate).toBe(callbackAfterUpdate);
  });
});
