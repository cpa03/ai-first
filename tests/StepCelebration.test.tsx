import React from 'react';
import { render, screen, act } from '@testing-library/react';
import StepCelebration from '@/components/StepCelebration';

// Mock usePrefersReducedMotion
const mockUsePrefersReducedMotion = jest.fn();
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}));

// Mock triggerHapticFeedback
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  triggerHapticFeedback: jest.fn(),
}));

describe('StepCelebration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUsePrefersReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(
      <StepCelebration stepNumber={2} totalSteps={5} show={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders step celebration UI and announces progress when show is true', () => {
    render(<StepCelebration stepNumber={2} totalSteps={5} show={true} />);

    expect(screen.getByText('Step 2 Complete!')).toBeInTheDocument();
    expect(screen.getByText('40% Complete')).toBeInTheDocument();

    // Check accessible live status announcer region exists
    const statusElement = screen.getByRole('status');
    expect(statusElement).toBeInTheDocument();

    // Advance timer for StatusAnnouncer's internal delay & RAF
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(statusElement).toHaveTextContent('Step 2 Complete! 40% Complete.');
  });

  it('calls onComplete callback after exit animation finishes', () => {
    const handleComplete = jest.fn();
    render(
      <StepCelebration
        stepNumber={3}
        totalSteps={5}
        show={true}
        onComplete={handleComplete}
      />
    );

    expect(handleComplete).not.toHaveBeenCalled();

    // Fast-forward past step celebration duration and exit timeout
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('handles reduced motion preference correctly', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true);
    const handleComplete = jest.fn();

    render(
      <StepCelebration
        stepNumber={1}
        totalSteps={4}
        show={true}
        onComplete={handleComplete}
      />
    );

    expect(screen.getByText('Step 1 Complete!')).toBeInTheDocument();

    // Fast-forward reduced motion duration
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
