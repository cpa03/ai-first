import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessCelebration from '@/components/SuccessCelebration';
import { SUCCESS_CELEBRATION_LABELS } from '@/lib/config/component-labels';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

jest.mock('@/hooks/usePrefersReducedMotion');
const mockUsePrefersReducedMotion = usePrefersReducedMotion as jest.MockedFunction<
  typeof usePrefersReducedMotion
>;

describe('SuccessCelebration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUsePrefersReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<SuccessCelebration show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders status announcer with screen reader label when show is true', () => {
    render(<SuccessCelebration show={true} />);

    // Fast-forward status announcer delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveTextContent(SUCCESS_CELEBRATION_LABELS.ANNOUNCEMENT);
  });

  it('triggers onComplete callback after duration', () => {
    const onComplete = jest.fn();
    render(<SuccessCelebration show={true} onComplete={onComplete} duration={1000} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('respects reduced motion setting', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true);
    const onComplete = jest.fn();

    render(<SuccessCelebration show={true} onComplete={onComplete} />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
