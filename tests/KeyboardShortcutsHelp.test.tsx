
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp Enhancement Tests', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock navigator.platform
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });
  });

  it('renders "No results found" when search matches nothing', async () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/search commands/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentcommand' } });

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
  });

  it('renders shortcuts normally when search matches', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/search commands/i);
    fireEvent.change(searchInput, { target: { value: 'save' } });

    expect(screen.queryByText(/no results found/i)).not.toBeInTheDocument();
    expect(screen.getByText(/save current work/i)).toBeInTheDocument();
  });

  it('has aria-hidden="true" on decorative SVG icons', () => {
    const { container } = render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);

    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      // The search icon and close icon should have aria-hidden
      if (!svg.closest('button[aria-label="Close command palette"]')) {
         // Generic check for svgs in this component
      }
    });

    // Check specific icons we added aria-hidden to
    const searchIcon = container.querySelector('svg.text-gray-400');
    expect(searchIcon).toHaveAttribute('aria-hidden', 'true');

    const closeIcon = screen.getByLabelText(/close command palette/i).querySelector('svg');
    expect(closeIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('modal backdrop has backdrop-blur-sm class', () => {
    const { container } = render(<KeyboardShortcutsHelp isOpen={true} onClose={mockOnClose} />);
    const backdrop = container.querySelector('.backdrop-blur-sm');
    expect(backdrop).toBeInTheDocument();
  });
});
