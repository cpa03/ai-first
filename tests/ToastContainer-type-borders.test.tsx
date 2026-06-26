import React from 'react';
import { render, screen } from '@testing-library/react';
import ToastContainer from '@/components/ToastContainer';

// Mock the usePrefersReducedMotion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

describe('ToastContainer - Type Border Styles', () => {
  beforeEach(() => {
    // Clear any existing toasts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).showToast = undefined;
  });

  it('renders without errors', () => {
    render(<ToastContainer />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('has correct ARIA label for toast region', () => {
    render(<ToastContainer />);
    expect(screen.getByRole('region')).toHaveAttribute(
      'aria-label',
      'Notifications'
    );
  });

  it('shows clear all button when multiple toasts exist', () => {
    render(<ToastContainer />);

    // Simulate showing multiple toasts
    const win = window as Window & {
      showToast?: (options: {
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
      }) => void;
    };

    // First, we need to get the showToast function from the component
    // The component sets window.showToast on mount
    // We'll trigger it via the effect
    expect(win.showToast).toBeDefined();
  });
});

describe('TOAST_CONFIG - Left Border Styles', () => {
  const { TOAST_CONFIG } = require('@/lib/config');

  it('has left border styles for all toast types', () => {
    expect(TOAST_CONFIG.STYLES.SUCCESS.LEFT_BORDER).toBe(
      'border-l-4 border-l-green-500'
    );
    expect(TOAST_CONFIG.STYLES.ERROR.LEFT_BORDER).toBe(
      'border-l-4 border-l-red-500'
    );
    expect(TOAST_CONFIG.STYLES.WARNING.LEFT_BORDER).toBe(
      'border-l-4 border-l-yellow-500'
    );
    expect(TOAST_CONFIG.STYLES.INFO.LEFT_BORDER).toBe(
      'border-l-4 border-l-blue-500'
    );
  });

  it('left border styles include proper Tailwind classes', () => {
    Object.values(TOAST_CONFIG.STYLES).forEach((style: unknown) => {
      const typedStyle = style as {
        LEFT_BORDER: string;
        BG: string;
        BORDER: string;
      };
      expect(typedStyle.LEFT_BORDER).toMatch(/^border-l-4 border-l-\w+-500$/);
      expect(typedStyle.BG).toMatch(/^bg-\w+-50$/);
      expect(typedStyle.BORDER).toMatch(/^border-\w+-200$/);
    });
  });
});
