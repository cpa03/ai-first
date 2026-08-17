import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading status region with default aria label', () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading...');
  });

  it('hides visible label from screen readers when label equals ariaLabel to avoid duplicate reading', () => {
    render(<LoadingSpinner label="Loading..." ariaLabel="Loading..." />);
    const visibleLabel = screen.getByText('Loading...', { selector: 'span:not(.sr-only)' });
    expect(visibleLabel).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not hide visible label when label differs from ariaLabel', () => {
    render(<LoadingSpinner label="Processing request" ariaLabel="Please wait..." />);
    const visibleLabel = screen.getByText('Processing request');
    expect(visibleLabel).not.toHaveAttribute('aria-hidden');
  });

  it('renders elapsed time when showElapsedTime is true', () => {
    render(<LoadingSpinner showElapsedTime={true} />);

    act(() => {
      jest.advanceTimersByTime(11000); // Threshold + interval
    });

    expect(screen.getByText(/Still loading/i)).toBeInTheDocument();
  });
});
