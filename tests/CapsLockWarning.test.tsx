import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CapsLockWarning } from '@/components/CapsLockWarning';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock the prefers-reduced-motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('CapsLockWarning', () => {
  beforeEach(() => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOn is false', () => {
    const { container } = render(<CapsLockWarning isOn={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOn is true', () => {
    render(<CapsLockWarning isOn={true} />);

    // Warning text should be displayed
    expect(screen.getByText('Caps Lock is on')).toBeInTheDocument();

    // Must have a "status" role with "polite" live region for accessibility
    const warningRegion = screen.getByRole('status');
    expect(warningRegion).toBeInTheDocument();
    expect(warningRegion).toHaveAttribute('aria-live', 'polite');

    // Should have fade-in animation by default when reduced motion is false
    expect(warningRegion).toHaveClass('animate-fade-in');
  });

  it('respects prefers-reduced-motion', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    render(<CapsLockWarning isOn={true} />);

    const warningRegion = screen.getByRole('status');
    expect(warningRegion).toBeInTheDocument();
    expect(warningRegion).not.toHaveClass('animate-fade-in');
  });
});
