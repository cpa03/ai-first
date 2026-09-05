import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoSaveIndicator from '../src/components/AutoSaveIndicator';

const flushMicrotasks = async () => {
  await act(async () => {
    if (typeof jest.runAllTicks === 'function') {
      jest.runAllTicks();
    }
    await Promise.resolve();
  });
};

describe('AutoSaveIndicator Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when the value is empty', async () => {
    const { container } = render(<AutoSaveIndicator value="" />);
    await flushMicrotasks();
    expect(container.firstChild).toBeNull();
  });

  it('renders typing state immediately when value is provided', async () => {
    render(<AutoSaveIndicator value="My new draft" />);
    await flushMicrotasks();
    expect(screen.getByText('Typing...')).toBeInTheDocument();
    expect(screen.getByText('Typing...')).toHaveClass('motion-safe:animate-pulse');
  });

  it('transitions to saving and then saved state over time', async () => {
    render(<AutoSaveIndicator value="My draft" delay={1000} />);
    await flushMicrotasks();

    // Starts in typing state
    expect(screen.getByText('Typing...')).toBeInTheDocument();

    // Advance time to transition from typing to saving
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await flushMicrotasks();

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toHaveClass('motion-safe:animate-pulse');

    // Advance time to transition from saving to saved (500ms save duration in config)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await flushMicrotasks();

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('resets progress and timers when value changes while typing', async () => {
    const { rerender } = render(<AutoSaveIndicator value="Draft v1" delay={1000} />);
    await flushMicrotasks();

    expect(screen.getByText('Typing...')).toBeInTheDocument();

    // Advance time partly
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await flushMicrotasks();

    // Value changes, should reset timer
    rerender(<AutoSaveIndicator value="Draft v2" delay={1000} />);
    await flushMicrotasks();

    // Advance 500ms (would have completed original 1000ms delay, but shouldn't be saving yet)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await flushMicrotasks();

    expect(screen.getByText('Typing...')).toBeInTheDocument();

    // Now advance another 500ms to trigger the new save
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await flushMicrotasks();

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('hides the indicator after saving completes and hide timeout passes', async () => {
    const { container } = render(<AutoSaveIndicator value="Draft content" delay={1000} />);
    await flushMicrotasks();

    // 1. Trigger Saving
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await flushMicrotasks();
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // 2. Trigger Saved
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await flushMicrotasks();
    expect(screen.getByText('Saved')).toBeInTheDocument();

    // 3. Trigger Hide (3000ms hide delay in config)
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await flushMicrotasks();

    expect(container.firstChild).toBeNull();
  });

  it('formats relative timestamp string labels correctly via AUTO_SAVE_INDICATOR_LABELS', async () => {
    const { AUTO_SAVE_INDICATOR_LABELS } = await import('../src/lib/config/component-labels');

    expect(AUTO_SAVE_INDICATOR_LABELS.SECONDS_AGO(15)).toBe('15s ago');
    expect(AUTO_SAVE_INDICATOR_LABELS.MINUTES_AGO(5)).toBe('5m ago');
    expect(AUTO_SAVE_INDICATOR_LABELS.JUST_NOW).toBe('just now');
  });

  it('includes proper accessibility live region attributes', async () => {
    const { container } = render(<AutoSaveIndicator value="Accessibility test" />);
    await flushMicrotasks();

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });
});
