import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileNav from '@/components/MobileNav';
import { MOBILE_NAV_LABELS } from '@/lib/config/component-labels';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('MobileNav', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('renders desktop navigation when window width is large', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<MobileNav />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  it('renders mobile navigation toggle and handles open/close with announcements', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<MobileNav />);

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const toggleButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton.className).toContain('active:scale-95');

    // Open menu
    fireEvent.click(toggleButton);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const statusAnnouncements = screen.getByRole('status');
    expect(statusAnnouncements).toHaveTextContent(MOBILE_NAV_LABELS.MENU_OPENED_ANNOUNCEMENT);

    // Close menu
    const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.className).toContain('active:scale-95');

    fireEvent.click(closeButton);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(statusAnnouncements).toHaveTextContent(MOBILE_NAV_LABELS.MENU_CLOSED_ANNOUNCEMENT);
  });
});
