import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaReadyIndicator from '@/components/IdeaReadyIndicator';
import { IDEA_READY_INDICATOR_LABELS, COMPONENT_CONFIG } from '@/lib/config';

jest.useFakeTimers();

describe('IdeaReadyIndicator', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('renders null when isReady is false and checkmark is not shown', () => {
    const { container } = render(<IdeaReadyIndicator isReady={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders status live region with aria-atomic="true" when isReady is true', async () => {
    render(<IdeaReadyIndicator isReady={true} />);

    // Fast-forward delay timer for checkmark animation
    await act(async () => {
      jest.advanceTimersByTime(COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
    });

    const statusElement = screen.getByRole('status');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-atomic', 'true');
    expect(
      screen.getByText(IDEA_READY_INDICATOR_LABELS.READY_TEXT)
    ).toBeInTheDocument();
  });

  it('applies custom className when provided', async () => {
    render(<IdeaReadyIndicator isReady={true} className="custom-test-class" />);

    await act(async () => {
      jest.advanceTimersByTime(COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
    });

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveClass('custom-test-class');
  });
});
