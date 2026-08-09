/**
 * Integration Tests - Simplified
 *
 * This test suite uses a simpler mocking approach that avoids the complex
 * jest.mock patterns that were causing timing issues.
 *
 * Strategy:
 * - Use simple global.fetch mocking
 * - Avoid complex module mocking
 * - Focus on essential integration flows
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
import { TEST_CONFIG } from './config/test-config';

// Simple fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Integration Tests - Simplified', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Idea Submission Integration', () => {
    it('should submit idea and handle response correctly', async () => {
      const idea = 'Build a task management app';

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'test-idea-123',
            title: idea,
            status: 'draft',
            createdAt: new Date().toISOString(),
          },
          requestId: 'test-req-123',
          timestamp: new Date().toISOString(),
        }),
      });

      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await act(async () => {
        fireEvent.change(textarea, { target: { value: idea } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(1);
          expect(mockOnSubmit).toHaveBeenCalledWith(idea, 'test-idea-123');
        },
        { timeout: TEST_CONFIG.SHORT_TIMEOUT }
      );

      // Verify API was called with correct data
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ideas',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ idea }),
        })
      );
    });

    it('should handle network errors gracefully', async () => {
      const idea = 'Build a task management app';

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await act(async () => {
        fireEvent.change(textarea, { target: { value: idea } });
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should show error message
      await waitFor(
        () => {
          expect(
            screen.getByText(/failed to save your idea/i)
          ).toBeInTheDocument();
        },
        { timeout: TEST_CONFIG.SHORT_TIMEOUT }
      );

      // Should not call onSubmit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate input before submission', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      expect(submitButton).toBeDisabled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
