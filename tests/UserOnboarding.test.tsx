import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserOnboarding from '@/components/UserOnboarding';
import { LOCAL_STORAGE_KEYS } from '@/lib/config/storage-keys';

// Mock the analytics module
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  ANALYTICS_EVENTS: {
    ONBOARDING_START: 'onboarding_start',
    ONBOARDING_COMPLETE: 'onboarding_complete',
  },
}));

// Mock haptic feedback
jest.mock('@/lib/utils', () => ({
  triggerHapticFeedback: jest.fn(),
}));

const ONBOARDING_COMPLETED_KEY = LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED;

// Mock standard storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserOnboarding Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render the onboarding tour to first-time visitors', async () => {
    render(<UserOnboarding />);

    // Fast-forward the delay timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip onboarding tour/i })).toBeInTheDocument();
  });

  it('should not render if user has already completed onboarding', () => {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    render(<UserOnboarding />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should navigate through steps on Next button click', () => {
    render(<UserOnboarding />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(nextButton).toBeInTheDocument();

    // Click Next
    act(() => {
      fireEvent.click(nextButton);
    });

    // Check we navigated (Next button starts step 2)
    expect(screen.getByLabelText(/Step 2 of 4/i)).toBeInTheDocument();
  });

  it('should skip the tour on close button click', () => {
    render(<UserOnboarding />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const skipButton = screen.getByRole('button', { name: /Skip onboarding tour/i });
    expect(skipButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(skipButton);
    });

    expect(window.localStorage.getItem(ONBOARDING_COMPLETED_KEY)).toBe('true');
  });

  it('should handle keyboard navigation correctly', () => {
    render(<UserOnboarding />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Press Escape to Skip
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(window.localStorage.getItem(ONBOARDING_COMPLETED_KEY)).toBe('true');
  });
});
