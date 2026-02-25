import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlueprintGeneration } from '@/hooks/useBlueprintGeneration';

jest.mock('@/templates/blueprint-template', () => ({
  generateBlueprintTemplate: jest.fn(
    (idea: string, answers: Record<string, string>) =>
      `Blueprint for: ${idea}\nAnswers: ${JSON.stringify(answers)}`
  ),
}));

jest.mock('@/lib/config/constants', () => ({
  UI_CONFIG: {
    BLUEPRINT_GENERATION_DELAY: 0,
    COPY_FEEDBACK_DURATION: 100,
    TOAST_DURATION: 3000,
  },
  PII_REDACTION_CONFIG: {
    REDACTION_LABELS: {
      JWT: '[REDACTED_TOKEN]',
      URL_WITH_CREDENTIALS: '[REDACTED_URL]',
      EMAIL: '[REDACTED_EMAIL]',
      PHONE: '[REDACTED_PHONE]',
      SSN: '[REDACTED_SSN]',
      CREDIT_CARD: '[REDACTED_CARD]',
      IP_ADDRESS: '[REDACTED_IP]',
      API_KEY: '[REDACTED_API_KEY]',
      PASSPORT: '[REDACTED_PASSPORT]',
      DRIVERS_LICENSE: '[REDACTED_LICENSE]',
    },
    PRIVATE_IP_RANGES: {
      LOOPBACK: ['127'],
      PRIVATE_CLASS_A: ['10'],
      PRIVATE_CLASS_B: ['172'],
      PRIVATE_CLASS_C: ['192', '168'],
    },
    API_KEY_PREFIXES: [
      'api[-_ ]?key',
      'apikey',
      'secret',
      'token',
      'credential',
    ],
    SAFE_FIELDS: ['id', 'created_at', 'updated_at', 'status', 'priority', 'estimate_hours'],
    MAX_RECURSION_DEPTH: 100,
  },
}))

jest.mock('@/lib/config', () => ({
  ANIMATION_DELAYS: {
    CLEANUP: 100,
  },
}));

describe('useBlueprintGeneration', () => {
  const mockIdea = 'Test Idea';
  const mockAnswers = { target_audience: 'Developers' };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: jest.fn(() => 'blob:test'),
        revokeObjectURL: jest.fn(),
      },
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

  it('starts in generating state', () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    expect(result.current.isGenerating).toBe(true);
    expect(result.current.blueprint).toBe('');
    expect(result.current.copied).toBe(false);
  });

  it('generates blueprint after delay', async () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(result.current.blueprint).toContain('Test Idea');
    expect(result.current.showCelebration).toBe(true);
  });

  it('handles copy to clipboard', async () => {
    const mockShowToast = jest.fn();
    (window as unknown as { showToast: jest.Mock }).showToast = mockShowToast;

    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(result.current.copied).toBe(true);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        message: 'Blueprint copied to clipboard!',
      })
    );
  });

  it('resets copied state after timeout', async () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.copied).toBe(false);
  });

  it('handles copy error', async () => {
    const mockError = new Error('Copy failed');
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      mockError
    );

    const mockShowToast = jest.fn();
    (window as unknown as { showToast: jest.Mock }).showToast = mockShowToast;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: 'Failed to copy. Please try selecting and copying manually.',
      })
    );

    consoleSpy.mockRestore();
  });

  it('dismisses celebration', async () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.showCelebration).toBe(true);
    });

    act(() => {
      result.current.dismissCelebration();
    });

    expect(result.current.showCelebration).toBe(false);
  });

  it('creates download link', async () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    // Set up DOM mocks AFTER renderHook to avoid interfering with test container
    const mockClick = jest.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag) => {
        if (tag === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });

    const mockAppendChild = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => mockAnchor as unknown as Node);
    const mockRemoveChild = jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => mockAnchor as unknown as Node);

    act(() => {
      result.current.handleDownload();
    });

    expect(mockAnchor.download).toBe('project-blueprint.md');
    expect(mockClick).toHaveBeenCalled();

    // Run the cleanup timer to ensure removeChild is called while mocks are active
    act(() => {
      jest.runOnlyPendingTimers();
    });

    createElementSpy.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });


  it('regenerates blueprint when inputs change', async () => {
    const { result, rerender } = renderHook(
      ({ idea, answers }) => useBlueprintGeneration(idea, answers),
      { initialProps: { idea: mockIdea, answers: mockAnswers } }
    );

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    const firstBlueprint = result.current.blueprint;

    rerender({ idea: 'New Idea', answers: { target_audience: 'Designers' } });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.blueprint).not.toBe(firstBlueprint);
    });
  });

  it('returns correct types', async () => {
    const { result } = renderHook(() =>
      useBlueprintGeneration(mockIdea, mockAnswers)
    );

    expect(typeof result.current.isGenerating).toBe('boolean');
    expect(typeof result.current.blueprint).toBe('string');
    expect(typeof result.current.copied).toBe('boolean');
    expect(typeof result.current.showCelebration).toBe('boolean');
    expect(typeof result.current.handleDownload).toBe('function');
    expect(typeof result.current.handleCopy).toBe('function');
    expect(typeof result.current.dismissCelebration).toBe('function');
  });
});
