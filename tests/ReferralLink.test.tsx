import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReferralLink from '../src/components/ReferralLink';

const mockSelectNodeContents = jest.fn();
const mockRemoveAllRanges = jest.fn();
const mockAddRange = jest.fn();

const mockSelection = {
  removeAllRanges: mockRemoveAllRanges,
  addRange: mockAddRange,
} as unknown as Selection;

const mockRange = {
  selectNodeContents: mockSelectNodeContents,
} as unknown as Range;

window.getSelection = jest.fn().mockReturnValue(mockSelection);
document.createRange = jest.fn().mockReturnValue(mockRange);

describe('ReferralLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the referral title, description, and link correctly with focus-visible and aria attributes', () => {
    render(<ReferralLink referralCode="testcode123" />);

    expect(screen.getByText(/Share Your Referral Link/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Invite friends and earn rewards when they sign up!/i)
    ).toBeInTheDocument();

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveAttribute(
      'aria-label',
      'http://localhost/signup?ref=testcode123. Press Space or Enter to select the link.'
    );
    expect(codeElement.className).toContain('focus-visible:ring-2');
    expect(codeElement.className).toContain('focus-visible:ring-primary-500');
  });

  it('selects the entire code container content on click', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.click(codeElement);

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('selects the entire code container content on Enter press', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: 'Enter' });

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('selects the entire code container content on Space press', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: ' ' });

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('does not select content on tab or other keys', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: 'Tab' });

    expect(window.getSelection).not.toHaveBeenCalled();
    expect(document.createRange).not.toHaveBeenCalled();
  });

  describe('Micro-UX selection feedback with Tooltip', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('renders the custom tooltip with the default instructions', () => {
      render(<ReferralLink referralCode="testcode123" />);
      const codeElement = screen.getByText(/signup\?ref=testcode123/i);

      // Focus to trigger Tooltip show
      fireEvent.focus(codeElement);

      // Advance timers to trigger Tooltip setTimeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(screen.getByText('Click or press Enter/Space to select all')).toBeInTheDocument();
    });

    it('updates the tooltip text to selected when clicked, and reverts on blur', () => {
      render(<ReferralLink referralCode="testcode123" />);
      const codeElement = screen.getByText(/signup\?ref=testcode123/i);

      // Focus/hover to show initial tooltip
      fireEvent.focus(codeElement);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(screen.getByText('Click or press Enter/Space to select all')).toBeInTheDocument();

      // Click to select
      act(() => {
        fireEvent.click(codeElement);
      });
      expect(screen.getByText('Selected! Press Ctrl+C to copy')).toBeInTheDocument();

      // Blur to revert
      act(() => {
        fireEvent.blur(codeElement);
      });
      expect(screen.getByText('Click or press Enter/Space to select all')).toBeInTheDocument();
    });

    it('updates the tooltip text to selected on Enter, and reverts after timeout', () => {
      render(<ReferralLink referralCode="testcode123" />);
      const codeElement = screen.getByText(/signup\?ref=testcode123/i);

      // Focus to show
      fireEvent.focus(codeElement);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(screen.getByText('Click or press Enter/Space to select all')).toBeInTheDocument();

      // KeyDown Enter
      act(() => {
        fireEvent.keyDown(codeElement, { key: 'Enter' });
      });
      expect(screen.getByText('Selected! Press Ctrl+C to copy')).toBeInTheDocument();

      // Fast-forward 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByText('Click or press Enter/Space to select all')).toBeInTheDocument();
    });
  });
});
