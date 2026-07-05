import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp - Search Term Highlighting', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HighlightedText rendering', () => {
    it('highlights matching text in shortcut descriptions when searching', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      fireEvent.change(searchInput, { target: { value: 'submit' } });

      // HighlightedText splits "Submit form" into segments with highlighted "Submit"
      // The highlighted span should have the yellow background class
      const highlightSpans = document.querySelectorAll('span.bg-yellow-200');
      expect(highlightSpans.length).toBeGreaterThan(0);
      expect(highlightSpans[0].textContent).toBe('Submit');
    });

    it('highlights matching text case-insensitively', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      fireEvent.change(searchInput, { target: { value: 'SUBMIT' } });

      // Should still find matching text despite different case
      const highlightSpans = document.querySelectorAll('span.bg-yellow-200');
      expect(highlightSpans.length).toBeGreaterThan(0);
      expect(highlightSpans[0].textContent).toBe('Submit');
    });

    it('does not show highlights when search is empty', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);

      // No highlight spans should exist when there's no search query
      const highlightSpans = document.querySelectorAll('span.bg-yellow-200');
      expect(highlightSpans.length).toBe(0);
    });

    it('highlights the matching portion in "Submit form" shortcut', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      fireEvent.change(searchInput, { target: { value: 'Submit' } });

      const highlightSpans = document.querySelectorAll('span.bg-yellow-200');
      expect(highlightSpans.length).toBe(1);
      expect(highlightSpans[0].textContent).toBe('Submit');
    });
  });

  describe('search functionality with highlights', () => {
    it('shows filtered results with highlights when searching', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      fireEvent.change(searchInput, { target: { value: 'copy' } });

      // Should show result count
      expect(screen.getByText(/result/)).toBeInTheDocument();

      // Should have highlighted text
      const highlightSpans = document.querySelectorAll('span.bg-yellow-200');
      expect(highlightSpans.length).toBeGreaterThan(0);
    });

    it('clears highlights when search is cleared', () => {
      render(<KeyboardShortcutsHelp {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      // Type search
      fireEvent.change(searchInput, { target: { value: 'submit' } });
      expect(
        document.querySelectorAll('span.bg-yellow-200').length
      ).toBeGreaterThan(0);

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(document.querySelectorAll('span.bg-yellow-200').length).toBe(0);
    });
  });
});
