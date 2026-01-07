import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaInput from '@/components/IdeaInput';
import ClarificationFlow from '@/components/ClarificationFlow';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import {
  TestDataFactory,
  TestUtils,
  MockResponseGenerator,
} from './fixtures/testDataFactory';

// Mock fetch for all E2E tests
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Declare mockFetch on globalThis for test helpers
(globalThis as any).mockFetch = (
  response: any,
  ok: boolean = true,
  status: number = 200
) => {
  mockFetch.mockResolvedValue({
    ok,
    status,
    json: async () => response,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    text: async () => JSON.stringify(response),
  } as Response);
};

// Type declaration for global mockFetch
declare global {
  var mockFetch: (response: any, ok?: boolean, status?: number) => void;
}

describe('End-to-End User Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Journey: Idea to Blueprint', () => {
    it('should complete full flow from idea input to blueprint generation', async () => {
      const idea = 'Build a task management app for remote teams';
      const mockQuestions = MockResponseGenerator.aiQuestions.slice(0, 3);
      const mockAnswers = {
        target_audience: 'Remote development teams',
        main_goal: 'Improve team collaboration',
        timeline: '3 months',
      };

      // Step 1: User enters idea
      global.mockFetch({
        questions: mockQuestions,
      });

      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      fireEvent.change(textarea, { target: { value: idea } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(idea, expect.any(String));
      });

      // Step 2: Clarification flow
      global.mockFetch({
        questions: mockQuestions,
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow
          idea={idea}
          ideaId="test-idea-123"
          onComplete={mockOnComplete}
        />
      );

      // Wait for questions to load
      await waitFor(() => {
        expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
      });

      // Answer questions
      const questions = Object.keys(mockAnswers);
      for (let i = 0; i < questions.length; i++) {
        const questionId = questions[i];
        const answer = mockAnswers[questionId as keyof typeof mockAnswers];

        if (i > 0) {
          // Navigate to next question (except for first)
          await waitFor(() => {
            expect(screen.getByText(mockQuestions[i])).toBeInTheDocument();
          });
        }

        const textarea = screen.getByPlaceholderText(/enter your answer here/i);
        fireEvent.change(textarea, { target: { value: answer } });

        const button = screen.getByText(
          i === questions.length - 1 ? 'Complete' : 'Next →'
        );
        fireEvent.click(button);
      }

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(mockAnswers);
      });

      // Step 3: Blueprint generation and display
      render(<BlueprintDisplay idea={idea} answers={mockAnswers} />);

      // Should show loading initially
      expect(
        screen.getByText(/generating your blueprint/i)
      ).toBeInTheDocument();

      // Should show blueprint after loading
      await waitFor(
        () => {
          expect(
            screen.getByText(/your project blueprint/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify blueprint content
      expect(screen.getByText(new RegExp(idea, 'i'))).toBeInTheDocument();

      Object.values(mockAnswers).forEach((answer) => {
        expect(screen.getByText(new RegExp(answer, 'i'))).toBeInTheDocument();
      });

      // Should have download functionality
      await waitFor(() => {
        expect(screen.getByText(/download markdown/i)).toBeInTheDocument();
      });
    });

    it('should handle errors gracefully throughout the flow', async () => {
      // Test idea input with API error
      global.mockFetch({ error: 'Service unavailable' }, false, 500);

      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      fireEvent.change(textarea, { target: { value: 'Test idea' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'Test idea',
          expect.any(String)
        );
      });

      // Test clarification flow with API error
      global.mockFetch({ error: 'AI service error' }, false, 500);

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      // Should show error state but continue with fallback questions
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(
          screen.getByText(/we're using fallback questions/i)
        ).toBeInTheDocument();
      });

      // Should still be able to complete the flow
      await waitFor(() => {
        expect(
          screen.getByText(/who is your target audience/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle complex project with multiple deliverables', async () => {
      const complexIdea = 'Build an enterprise project management platform';
      const complexAnswers = {
        target_audience: 'Enterprise organizations',
        main_goal: 'Streamline project workflows',
        timeline: '6 months',
        budget: '$50k+',
        team_size: '10-50 people',
        features: 'Advanced reporting, integrations, workflow automation',
      };

      // Mock blueprint generation for complex project
      global.mockFetch({
        blueprint: {
          title: `Project Blueprint: ${complexIdea}`,
          deliverables: [
            { title: 'Core Platform', estimate: '12 weeks' },
            { title: 'Reporting Module', estimate: '8 weeks' },
            { title: 'Integration Layer', estimate: '6 weeks' },
          ],
        },
      });

      render(<BlueprintDisplay idea={complexIdea} answers={complexAnswers} />);

      await waitFor(
        () => {
          expect(
            screen.getByText(/your project blueprint/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify complex content is displayed
      expect(
        screen.getByText(new RegExp(complexIdea, 'i'))
      ).toBeInTheDocument();
      expect(screen.getByText(/enterprise organizations/i)).toBeInTheDocument();
      expect(screen.getByText(/6 months/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should be keyboard navigable', async () => {
      const mockOnSubmit = jest.fn();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      // Test keyboard navigation
      textarea.focus();
      expect(textarea).toHaveFocus();

      fireEvent.change(textarea, { target: { value: 'Test idea' } });

      // Tab to submit button
      fireEvent.keyDown(textarea, { key: 'Tab' });
      expect(submitButton).toHaveFocus();

      // Submit with Enter key
      fireEvent.keyDown(submitButton, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'Test idea',
          expect.any(String)
        );
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      global.mockFetch({
        questions: ['Test question?'],
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(screen.getByText(/test question/i)).toBeInTheDocument();
      });

      // Check for proper form elements
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder');
      expect(textarea).toHaveAttribute('autofocus');

      // Check navigation buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should announce progress to screen readers', async () => {
      global.mockFetch({
        questions: ['Question 1', 'Question 2'],
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
      });

      // Progress should be properly announced
      const progressText = screen.getByText(/question 1 of 2/i);
      expect(progressText).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large ideas efficiently', async () => {
      const largeIdea = 'A'.repeat(5000); // Very long idea
      const mockOnSubmit = jest.fn();

      const startTime = performance.now();
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      fireEvent.change(textarea, { target: { value: largeIdea } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          largeIdea,
          expect.any(String)
        );
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle many questions without performance degradation', async () => {
      const manyQuestions = Array.from(
        { length: 20 },
        (_, i) => `Question ${i + 1}`
      );

      global.mockFetch({
        questions: manyQuestions,
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Complex idea" onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(screen.getByText(manyQuestions[0])).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Navigate through first few questions
      for (let i = 0; i < 3; i++) {
        const textarea = screen.getByPlaceholderText(/enter your answer here/i);
        fireEvent.change(textarea, { target: { value: `Answer ${i + 1}` } });

        const button = screen.getByText('Next →');
        fireEvent.click(button);

        if (i < 2) {
          await waitFor(() => {
            expect(screen.getByText(manyQuestions[i + 1])).toBeInTheDocument();
          });
        }
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover from network errors', async () => {
      // Simulate network failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      // Should show error state and fallback questions
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(
          screen.getByText(/we're using fallback questions/i)
        ).toBeInTheDocument();
      });

      // Should still be able to complete the flow
      await waitFor(() => {
        expect(
          screen.getByText(/who is your target audience/i)
        ).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/enter your answer here/i);
      fireEvent.change(textarea, { target: { value: 'Test audience' } });

      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/what is the main goal/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed API responses', async () => {
      // Simulate malformed response
      global.mockFetch('invalid json', true, 200);

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should validate user inputs properly', async () => {
      global.mockFetch({
        questions: ['Test question?'],
      });

      const mockOnComplete = jest.fn();
      render(
        <ClarificationFlow idea="Test idea" onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(screen.getByText(/test question/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Complete');
      expect(nextButton).toBeDisabled();

      // Try to submit empty answer
      fireEvent.click(nextButton);
      expect(mockOnComplete).not.toHaveBeenCalled();

      // Submit with only whitespace
      const textarea = screen.getByPlaceholderText(/enter your answer here/i);
      fireEvent.change(textarea, { target: { value: '   ' } });
      expect(nextButton).toBeDisabled();

      // Submit with valid answer
      fireEvent.change(textarea, { target: { value: 'Valid answer' } });
      expect(nextButton).not.toBeDisabled();

      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          question_0: 'Valid answer',
        });
      });
    });
  });
});
