import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareButton from '@/components/ShareButton';

// Mock navigator.share and navigator.canShare
Object.assign(navigator, {
  share: jest.fn().mockImplementation(() => Promise.resolve()),
  canShare: jest.fn().mockReturnValue(true),
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock window.showToast
(window as any).showToast = jest.fn();

describe('ShareButton', () => {
  it('renders correctly', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: /share this page/i })).toBeInTheDocument();
  });

  it('announces success to screen readers when shared', async () => {
    render(<ShareButton successLabel="Shared!" />);
    const button = screen.getByRole('button', { name: /share this page/i });

    fireEvent.click(button);

    // StatusAnnouncer uses role="status"
    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();

    await waitFor(() => {
      expect(announcer).toHaveTextContent('Shared!');
    }, { timeout: 1000 });
  });
});
