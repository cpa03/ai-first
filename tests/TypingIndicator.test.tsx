import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypingIndicator from '@/components/TypingIndicator';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

jest.useFakeTimers();

// Mock the prefers-reduced-motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('TypingIndicator', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isTyping is false initially', () => {
    const { container } = render(<TypingIndicator isTyping={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isTyping is true', () => {
    render(<TypingIndicator isTyping={true} />);

    // Screen reader text should be present
    expect(screen.getByText('Typing...')).toBeInTheDocument();

    // Must have a "status" role with "polite" live region and atomic updates for accessibility
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-atomic', 'true');

    // Dot elements should be rendered inside an aria-hidden container
    const dotsContainer = container.querySelector('[aria-hidden="true"]');
    expect(dotsContainer).toBeInTheDocument();
  });

  it('hides after delay when isTyping becomes false', async () => {
    const { rerender } = render(<TypingIndicator isTyping={true} hideDelay={1000} />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    // Set isTyping to false
    await act(async () => {
      rerender(<TypingIndicator isTyping={false} hideDelay={1000} />);
    });

    // It should still be visible immediately since the hide delay has not elapsed
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Advance time past the hide delay
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Now it should be hidden
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('respects prefers-reduced-motion', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    render(<TypingIndicator isTyping={true} />);

    const container = screen.getByRole('status');
    const dots = container.querySelectorAll('.animate-typing-dot');
    // Dots should not have the animation class when prefers-reduced-motion is true
    expect(dots.length).toBe(0);
  });

  it('uses custom className correctly', () => {
    render(<TypingIndicator isTyping={true} className="test-custom-class" />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('test-custom-class');
  });
});
