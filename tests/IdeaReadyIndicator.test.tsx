import React from 'react';
import { render, screen, act } from '@testing-library/react';
import IdeaReadyIndicator from '@/components/IdeaReadyIndicator';
import { COMPONENT_CONFIG, IDEA_READY_INDICATOR_LABELS } from '@/lib/config';

// Mock usePrefersReducedMotion hook
const mockPrefersReducedMotion = jest.fn();
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockPrefersReducedMotion(),
}));

describe('IdeaReadyIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockPrefersReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders null when isReady is false initially', () => {
    const { container } = render(<IdeaReadyIndicator isReady={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders writing indicator text when isReady changes to false after being ready', () => {
    const { rerender } = render(<IdeaReadyIndicator isReady={true} />);

    act(() => {
      jest.advanceTimersByTime(COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
    });

    expect(screen.getByText(IDEA_READY_INDICATOR_LABELS.READY_TEXT)).toBeInTheDocument();

    rerender(<IdeaReadyIndicator isReady={false} />);

    expect(screen.queryByText(IDEA_READY_INDICATOR_LABELS.READY_TEXT)).not.toBeInTheDocument();
  });

  it('renders checkmark and ready text after delay when isReady is true', () => {
    render(<IdeaReadyIndicator isReady={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(IDEA_READY_INDICATOR_LABELS.READY_TEXT)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
    });

    expect(screen.getByText(IDEA_READY_INDICATOR_LABELS.READY_TEXT)).toBeInTheDocument();
  });

  it('has proper accessibility attributes (role="status", aria-live="polite", aria-atomic="true")', () => {
    render(<IdeaReadyIndicator isReady={true} />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('handles prefers-reduced-motion correctly', () => {
    mockPrefersReducedMotion.mockReturnValue(true);

    const { container } = render(<IdeaReadyIndicator isReady={true} />);

    act(() => {
      jest.advanceTimersByTime(COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
    });

    // Checkmark path transition should be 'none' when reduced motion is preferred
    const path = container.querySelector('path');
    expect(path).toHaveStyle({ transition: 'none' });
  });
});
