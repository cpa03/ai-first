/**
 * Frontend Component Tests - Simplified
 *
 * This test suite uses a simpler mocking approach that avoids the complex
 * jest.mock patterns that were causing timing issues.
 *
 * Strategy:
 * - Use simple global.fetch mocking (like individual component tests)
 * - Avoid complex module mocking
 * - Focus on essential functionality
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaInput from '@/components/IdeaInput';

// Simple fetch mock - same pattern as individual component tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Frontend Component Tests - Simplified', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('IdeaInput Component', () => {
    it('renders input form correctly', () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /start clarifying/i })
      ).toBeInTheDocument();
    });

    it('disables submit button when idea is empty', () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when idea is entered', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await act(async () => {
        fireEvent.change(textarea, {
          target: { value: 'Test idea with more details' },
        });
      });
      expect(submitButton).not.toBeDisabled();
    });

    it('submits valid idea successfully', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'test-idea-123',
            title: 'Test idea with more details',
            status: 'draft',
            createdAt: new Date().toISOString(),
          },
          requestId: 'test-req-123',
          timestamp: new Date().toISOString(),
        }),
      });

      await act(async () => {
        fireEvent.change(textarea, {
          target: { value: 'Test idea with more details' },
        });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(1);
          expect(mockOnSubmit).toHaveBeenCalledWith(
            'Test idea with more details',
            'test-idea-123'
          );
        },
        { timeout: 3000 }
      );
    });

    it('shows encouragement message after typing a few characters', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);

      await act(async () => {
        fireEvent.change(textarea, {
          target: { value: 'Test' },
        });
      });

      // Should show encouragement message
      expect(screen.getByText(/great start/i)).toBeInTheDocument();
    });
  });
});
