/**
 * E2E Tests - Critical User Flows
 * Tests the core user journey from idea input to export
 *
 * This test suite focuses on the critical user flows mentioned in issue #1725:
 * - Idea creation and clarification
 * - Breakdown generation
 * - Export functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaInput from '@/components/IdeaInput';
import ClarificationFlow from '@/components/ClarificationFlow';

// Mock fetch globally
global.fetch = jest.fn();

describe('E2E Critical User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Idea Input Flow', () => {
    it('should allow user to enter an idea and submit', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'idea-123',
            content: 'Build a task management app',
            status: 'draft',
          },
        }),
      });

      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      fireEvent.change(textarea, {
        target: { value: 'Build a task management app' },
      });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledWith(
            'Build a task management app',
            'idea-123'
          );
        },
        { timeout: 3000 }
      );
    });

    it('should validate idea is not empty', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Clarification Flow', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow
          idea="Test idea"
          ideaId="idea-123"
          onComplete={mockOnComplete}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('User Flow Integration', () => {
    it('should complete full idea to clarification flow', async () => {
      // Step 1: Submit idea
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'idea-123' } }),
      });

      const idea = 'Build a task management app';
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });
      fireEvent.change(textarea, { target: { value: idea } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledWith(idea, 'idea-123');
        },
        { timeout: 3000 }
      );

      // Step 2: Clarification questions
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            questions: [
              {
                id: 'goal',
                question: 'What is the main goal?',
                type: 'open',
                required: true,
              },
            ],
          },
        }),
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow
          idea={idea}
          ideaId="idea-123"
          onComplete={mockOnComplete}
        />
      );

      await waitFor(
        () => {
          expect(
            screen.getAllByText('What is the main goal?')[0]
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { refined_idea: 'Refined' } }),
      });

      const answerInput = screen.getByPlaceholderText(/enter your answer/i);
      fireEvent.change(answerInput, { target: { value: 'Productivity tool' } });
      fireEvent.click(screen.getByText('Complete'));

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledWith({
            goal: 'Productivity tool',
          });
        },
        { timeout: 3000 }
      );
    });
  });
});
