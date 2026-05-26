import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CopyButton from '@/components/CopyButton';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock window.showToast
(window as any).showToast = jest.fn();

describe('CopyButton', () => {
  it('renders correctly', () => {
    render(<CopyButton textToCopy="test text" />);
    expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it('announces success to screen readers when clicked', async () => {
    render(<CopyButton textToCopy="test text" toastMessage="Copied!" />);
    const button = screen.getByRole('button', { name: /copy to clipboard/i });

    fireEvent.click(button);

    // StatusAnnouncer uses role="status"
    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();

    // The message is set after a delay (default 100ms) and requestAnimationFrame
    await waitFor(() => {
      expect(announcer).toHaveTextContent('Copied!');
    }, { timeout: 1000 });
  });
});
