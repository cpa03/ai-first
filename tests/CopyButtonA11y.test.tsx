import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import CopyButton from '@/components/CopyButton';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('CopyButton Accessibility', () => {
  it('should trigger StatusAnnouncer when clicked', async () => {
    const toastMessage = 'Copied to clipboard!';
    render(<CopyButton textToCopy="Test text" toastMessage={toastMessage} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // StatusAnnouncer uses role="status"
    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();

    // StatusAnnouncer might have a delay, but in tests we can wait
    await waitFor(() => {
      expect(announcer).toHaveTextContent(toastMessage);
    });
  });
});
