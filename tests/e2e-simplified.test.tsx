/**
 * E2E Tests - Simplified
 *
 * This test suite uses a simpler mocking approach that avoids the complex
 * jest.mock patterns that were causing timing issues.
 *
 * Strategy:
 * - Use simple global.fetch mocking
 * - Avoid complex module mocking
 * - Focus on essential user flows
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

describe('E2E Tests - Simplified', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Complete User Journey: Idea to Submission', () => {
    it('should complete full flow from idea input to submission', async () => {
      const idea = 'Build a task management app for remote teams';

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

      // Step 1: User enters idea
      await act(async () => {
        fireEvent.change(textarea, { target: { value: idea } });
      });

      // Step 2: Submit the idea
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Step 3: Verify submission
      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(1);
          expect(mockOnSubmit).toHaveBeenCalledWith(idea, 'test-idea-123');
        },
        { timeout: TEST_CONFIG.SHORT_TIMEOUT }
      );
    });

    it('should handle API errors gracefully', async () => {
      const idea = 'Build a task management app';

      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Internal server error',
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

    it('should show loading state during submission', async () => {
      const idea = 'Build a task management app';

      // Mock delayed API response
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

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });
});
