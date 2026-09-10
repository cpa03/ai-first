import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskManagementSkeleton from '@/components/TaskManagementSkeleton';
import { TASK_MANAGEMENT_LABELS, ANIMATION_CONFIG } from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

jest.mock('@/hooks/usePrefersReducedMotion');

describe('TaskManagementSkeleton', () => {
  const mockUsePrefersReducedMotion = usePrefersReducedMotion as jest.MockedFunction<
    typeof usePrefersReducedMotion
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with polite status live region and screen reader text', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false);

    render(<TaskManagementSkeleton />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute(
      'aria-label',
      TASK_MANAGEMENT_LABELS.SKELETON_ARIA_LABEL
    );
    expect(
      screen.getByText(TASK_MANAGEMENT_LABELS.SKELETON_SR_TEXT)
    ).toBeInTheDocument();
  });

  it('applies staggered animation delays when prefersReducedMotion is false', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false);

    const { container } = render(<TaskManagementSkeleton />);

    const cardContainers = container.querySelectorAll('.animate-fade-in');
    // Index 0 is root container; deliverable items start from index 1
    expect(cardContainers.length).toBeGreaterThan(1);
    expect(cardContainers[1]).toHaveStyle({ animationDelay: '0ms' });
    expect(cardContainers[2]).toHaveStyle({
      animationDelay: `${ANIMATION_CONFIG.DASHBOARD_STAGGER_DELAY}ms`,
    });
  });

  it('omits staggered animation delays when prefersReducedMotion is true', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true);

    const { container } = render(<TaskManagementSkeleton />);

    const cardContainers = container.querySelectorAll('.animate-fade-in');
    expect(cardContainers.length).toBeGreaterThan(1);
    expect(cardContainers[1].style.animationDelay).toBe('');
    expect(cardContainers[2].style.animationDelay).toBe('');
  });
});
