import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SuccessCelebration from '@/components/SuccessCelebration';
import { SUCCESS_CELEBRATION_LABELS } from '@/lib/config/component-labels';

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  triggerHapticFeedback: jest.fn(),
}));

jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

describe('SuccessCelebration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<SuccessCelebration show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders StatusAnnouncer and announces success when show is true', () => {
    render(<SuccessCelebration show={true} />);

    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(announcer).toHaveTextContent(SUCCESS_CELEBRATION_LABELS.ANNOUNCEMENT);
  });

  it('invokes onComplete callback after standard animation duration', () => {
    const handleComplete = jest.fn();
    render(<SuccessCelebration show={true} onComplete={handleComplete} duration={1000} />);

    expect(handleComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('handles reduced motion mode correctly', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);
    const handleComplete = jest.fn();

    render(<SuccessCelebration show={true} onComplete={handleComplete} />);

    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(announcer).toHaveTextContent(SUCCESS_CELEBRATION_LABELS.ANNOUNCEMENT);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
