import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('DashboardSkeleton', () => {
  const mockUsePrefersReducedMotion = usePrefersReducedMotion as jest.MockedFunction<
    typeof usePrefersReducedMotion
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePrefersReducedMotion.mockReturnValue(false);
  });

  it('renders status live region with correct aria-label and screen reader announcement', () => {
    render(<DashboardSkeleton />);
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-label', 'Loading dashboard');
    expect(screen.getByText('Loading your ideas...')).toBeInTheDocument();
  });

  it('applies staggered animation delay when reduced motion is disabled', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false);
    const { container } = render(<DashboardSkeleton />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toHaveStyle('animation-delay: 0ms');
    expect(rows[1]).toHaveStyle('animation-delay: 50ms');
  });

  it('omits animation delay when reduced motion is preferred', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true);
    const { container } = render(<DashboardSkeleton />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).not.toHaveAttribute('style');
    expect(rows[1]).not.toHaveAttribute('style');
  });
});
