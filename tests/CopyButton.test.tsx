import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CopyButton from '@/components/CopyButton';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock StatusAnnouncer to verify it receives correct props
jest.mock('@/components/StatusAnnouncer', () => {
  return jest.fn(({ message, triggered }) => (
    <div data-testid="status-announcer" data-message={message} data-triggered={triggered.toString()} />
  ));
});

describe('CopyButton Accessibility', () => {
  beforeEach(() => {
    mockWriteText.mockClear();
    jest.clearAllMocks();
  });

  it('triggers StatusAnnouncer when text is copied', async () => {
    const successLabel = 'Text Copied!';
    render(<CopyButton textToCopy="test-text" successLabel={successLabel} />);

    const button = screen.getByRole('button');

    // Initially not triggered
    let announcer = screen.getByTestId('status-announcer');
    expect(announcer).toHaveAttribute('data-triggered', 'false');

    // Click to copy
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test-text');
    });

    // Should now be triggered with successLabel
    announcer = screen.getByTestId('status-announcer');
    expect(announcer).toHaveAttribute('data-triggered', 'true');
    expect(announcer).toHaveAttribute('data-message', successLabel);
  });

  it('keeps button aria-label static when copied', async () => {
    render(<CopyButton textToCopy="test-text" ariaLabel="Copy this" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Copy this');

    fireEvent.click(button);

    await waitFor(() => {
      // The aria-label should remain "Copy this" to avoid double announcement with StatusAnnouncer
      expect(button).toHaveAttribute('aria-label', 'Copy this');
    });
  });
});
