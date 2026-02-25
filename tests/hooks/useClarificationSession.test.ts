import { renderHook, act, waitFor } from '@testing-library/react';
import { useClarificationSession } from '@/hooks/useClarificationSession';

jest.mock('@/lib/api-client', () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock('@/lib/config', () => ({
  UI_CONFIG: {
    FOCUS: {
      DELAY_MS: 0,
    },
  },
  CLARIFIER_CONFIG: {
    FALLBACK_QUESTIONS: [
      { id: 'fallback_1', question: 'Fallback Question?', type: 'open' },
    ],
  },
  MESSAGES: {
    CLARIFICATION: {
      ERROR_FETCH_QUESTIONS: 'Failed to fetch questions',
    },
    ERRORS: {
      UNKNOWN_ERROR: 'Unknown error',
    },
  },
}));

const mockFetch = require('@/lib/api-client').fetchWithTimeout as jest.Mock;

describe('useClarificationSession', () => {
  const mockIdea = 'Test Idea';
  const mockOnComplete = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockFetch.mockReset();

    Object.defineProperty(window, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('starts in loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.questions).toHaveLength(0);
  });

  it('fetches and formats questions successfully', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'Target audience?',
        type: 'open' as const,
        required: true,
      },
      {
        id: '2',
        question: 'Timeline?',
        type: 'multiple_choice' as const,
        options: ['1 week', '1 month'],
        required: true,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.questions).toHaveLength(2);
    expect(result.current.questions[0].type).toBe('textarea');
    expect(result.current.questions[1].type).toBe('select');
    expect(result.current.questions[1].options).toEqual(['1 week', '1 month']);
  });

  it('uses fallback questions on API failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.questions.length).toBeGreaterThan(0);
  });

  it('uses fallback questions when API returns empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: [] },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.questions.length).toBeGreaterThan(0);
  });

  it('calculates progress correctly', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
      { id: '2', question: 'Q2?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toBe(50);
    expect(result.current.currentStep).toBe(0);
  });

  it('handles next navigation', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
      { id: '2', question: 'Q2?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentAnswer('Test answer');
    });

    await act(async () => {
      await result.current.handleNext();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.showCelebration).toBe(true);
  });

  it('handles previous navigation', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
      { id: '2', question: 'Q2?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentAnswer('Answer 1');
    });

    await act(async () => {
      await result.current.handleNext();
    });

    act(() => {
      jest.runAllTimers();
    });

    act(() => {
      result.current.handlePrevious();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('calls onComplete on final step', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentAnswer('Final answer');
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(mockOnComplete).toHaveBeenCalledWith({ '1': 'Final answer' });
  });

  it('handles keyboard shortcuts', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentAnswer('Answer');
    });

    const mockEvent = {
      metaKey: true,
      ctrlKey: false,
      key: 'Enter',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('detects Mac platform', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { platform: 'MacIntel' },
      writable: true,
      configurable: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: [] },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isMac).toBe(true);
  });

  it('generates correct steps array', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
      { id: '2', question: 'Q2?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.steps).toHaveLength(2);
    expect(result.current.steps[0].current).toBe(true);
    expect(result.current.steps[0].completed).toBe(false);
    expect(result.current.steps[1].current).toBe(false);
    expect(result.current.steps[1].completed).toBe(false);
  });

  it('prevents navigation with empty answer', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('trims whitespace from answers', async () => {
    const mockQuestions = [
      { id: '1', question: 'Q1?', type: 'open' as const, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setCurrentAnswer('  Trimmed Answer  ');
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(mockOnComplete).toHaveBeenCalledWith({ '1': 'Trimmed Answer' });
  });

  it('sends correct API request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: [] },
      }),
    });

    const ideaId = 'test-idea-123';

    renderHook(() => useClarificationSession(mockIdea, ideaId, mockOnComplete));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clarify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea: mockIdea, ideaId }),
        })
      );
    });
  });

  it('returns correct types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: [] },
      }),
    });

    const { result } = renderHook(() =>
      useClarificationSession(mockIdea, undefined, mockOnComplete)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.loading).toBe('boolean');
    expect(Array.isArray(result.current.questions)).toBe(true);
    expect(typeof result.current.currentStep).toBe('number');
    expect(typeof result.current.progress).toBe('number');
    expect(typeof result.current.currentAnswer).toBe('string');
    expect(typeof result.current.showCelebration).toBe('boolean');
    expect(typeof result.current.isSubmitting).toBe('boolean');
    expect(typeof result.current.handleNext).toBe('function');
    expect(typeof result.current.handlePrevious).toBe('function');
    expect(typeof result.current.handleKeyDown).toBe('function');
    expect(typeof result.current.setCurrentAnswer).toBe('function');
  });
});
