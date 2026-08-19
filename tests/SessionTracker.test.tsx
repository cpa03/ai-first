import { useState } from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionTracker from '@/components/SessionTracker';
import { useSessionDuration } from '@/hooks/useSessionDuration';

// Mock the hook to track how many times it is executed
jest.mock('@/hooks/useSessionDuration', () => ({
  useSessionDuration: jest.fn(),
}));

describe('SessionTracker Component Performance and Correctness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render null and call useSessionDuration hook on mount', () => {
    const { container } = render(<SessionTracker />);

    // SessionTracker should have no visual output
    expect(container.firstChild).toBeNull();

    // Hook must be called exactly once on initial mount
    expect(useSessionDuration).toHaveBeenCalledTimes(1);
  });

  it('should prevent redundant re-renders via memoization when parent updates with the same props', () => {
    // Parent wrapper that can force updates using a state state
    let forceParentUpdate!: () => void;

    function ParentWrapper() {
      const [, setState] = useState(0);
      forceParentUpdate = () => setState((prev) => prev + 1);

      return (
        <div>
          <SessionTracker />
        </div>
      );
    }

    render(<ParentWrapper />);

    // Hook called exactly once on initial mount
    expect(useSessionDuration).toHaveBeenCalledTimes(1);

    // Trigger parent re-render
    act(() => {
      forceParentUpdate();
    });

    // Hook call count should STILL be 1 because SessionTracker is memoized and takes no props!
    expect(useSessionDuration).toHaveBeenCalledTimes(1);
  });
});
