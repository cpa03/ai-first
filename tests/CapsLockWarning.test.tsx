import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CapsLockWarning } from '@/components/CapsLockWarning';
import { CAPS_LOCK_WARNING_LABELS } from '@/lib/config/component-labels';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock the prefers-reduced-motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('CapsLockWarning', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when isOn is false', () => {
    const { container } = render(<CapsLockWarning isOn={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOn is true', () => {
    render(<CapsLockWarning isOn={true} />);

    // Warning text should be displayed using centralized label
    expect(screen.getByText(CAPS_LOCK_WARNING_LABELS.WARNING_TEXT)).toBeInTheDocument();

    // Must have a "status" role with "polite" live region for accessibility
    const warningRegion = screen.getByRole('status');
    expect(warningRegion).toBeInTheDocument();
    expect(warningRegion).toHaveAttribute('aria-live', 'polite');

    // Should have fade-in animation by default when reduced motion is false
    expect(warningRegion).toHaveClass('animate-fade-in');
  });

  it('handles repeated toggles of Caps Lock state correctly', () => {
    const { rerender } = render(<CapsLockWarning isOn={true} />);
    expect(screen.getByText(CAPS_LOCK_WARNING_LABELS.WARNING_TEXT)).toBeInTheDocument();

    // Toggle OFF
    rerender(<CapsLockWarning isOn={false} />);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText(CAPS_LOCK_WARNING_LABELS.WARNING_TEXT)).not.toBeInTheDocument();

    // Toggle back ON - should re-appear cleanly
    rerender(<CapsLockWarning isOn={true} />);
    expect(screen.getByText(CAPS_LOCK_WARNING_LABELS.WARNING_TEXT)).toBeInTheDocument();
  });

  it('respects prefers-reduced-motion', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    render(<CapsLockWarning isOn={true} />);

    const warningRegion = screen.getByRole('status');
    expect(warningRegion).toBeInTheDocument();
    expect(warningRegion).not.toHaveClass('animate-fade-in');
  });
});
