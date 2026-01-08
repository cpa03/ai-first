/**
 * Frontend Component Tests - Enhanced Coverage
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IdeaInput from '@/components/IdeaInput';
import ClarificationFlow from '@/components/ClarificationFlow';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import {
  mockUserJourney,
  mockOpenAIResponses,
  createMockFetch,
  waitForAsync,
} from './utils/_testHelpers';

// Mock external dependencies
jest.mock('@/lib/db');
jest.mock('next/navigation');

describe('Frontend Component Tests', () => {
  let user: any;
  const originalConsole = { ...console };
  const mockConsoleConfig = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    Object.assign(console, mockConsoleConfig);
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  describe('IdeaInput Component', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
      mockOnSubmit.mockClear();
    });

    it('renders input form correctly', () => {
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();
      expect(
        screen.getByText(/be as specific or as general/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /start clarifying/i })
      ).toBeInTheDocument();
    });

    it('validates empty input submission', async () => {
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });
      await user.click(submitButton);

      // Should show validation error
      expect(screen.getByText(/idea is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('submits valid idea successfully', async () => {
      global.fetch = createMockFetch({
        data: { id: 'test-id', content: 'Test idea' },
        error: null,
      });

      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await user.type(textarea, 'Test idea');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test idea', 'test-id');
      });
    });

    it('handles submission errors gracefully', async () => {
      global.fetch = createMockFetch(
        { error: 'Database error' },
        { ok: false, status: 500 }
      );

      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await user.type(textarea, 'Test idea');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to save your idea/i)
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows loading state during submission', async () => {
      global.fetch = createMockFetch(
        { data: { id: 'test-id' } },
        { delay: 1000 }
      );

      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const submitButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });

      await user.type(textarea, 'Test idea');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/submitting.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('respects character limits', async () => {
      render(<IdeaInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText(/what's your idea/i);
      const longText = 'a'.repeat(1001); // Assuming 1000 char limit

      await user.type(textarea, longText);

      expect(screen.getByText(/idea must be less than/i)).toBeInTheDocument();
    });
  });

  describe('ClarificationFlow Component', () => {
    const defaultProps = {
      sessionId: 'test-session',
      idea: 'Test idea',
      onComplete: jest.fn(),
      onError: jest.fn(),
    };

    beforeEach(() => {
      defaultProps.onComplete.mockClear();
      defaultProps.onError.mockClear();
    });

    it('renders loading state initially', () => {
      render(<ClarificationFlow {...defaultProps} />);

      expect(screen.getByText(/loading questions/i)).toBeInTheDocument();
    });

    it('displays questions when loaded', async () => {
      global.fetch = createMockFetch({
        data: mockOpenAIResponses.clarificationQuestions,
      });

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/what is the primary goal/i)
        ).toBeInTheDocument();
      });
    });

    it('handles question answering flow', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockOpenAIResponses.clarificationQuestions,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'refined-id', content: 'Refined idea' },
          }),
        });

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/what is the primary goal/i)
        ).toBeInTheDocument();
      });

      // Answer first question
      const firstInput = screen.getAllByRole('textbox')[0];
      await user.type(firstInput, 'Test answer');

      // Move to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Answer second question
      await waitFor(() => {
        expect(
          screen.getByText(/who is the target audience/i)
        ).toBeInTheDocument();
      });

      const secondInput = screen.getAllByRole('textbox')[0];
      await user.type(secondInput, 'Target audience');

      // Submit answers
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onComplete).toHaveBeenCalledWith('refined-id');
      });
    });

    it('handles navigation between questions', async () => {
      global.fetch = createMockFetch({
        data: mockOpenAIResponses.clarificationQuestions,
      });

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/what is the primary goal/i)
        ).toBeInTheDocument();
      });

      // Answer first question
      const firstInput = screen.getAllByRole('textbox')[0];
      await user.type(firstInput, 'Test answer');

      // Move forward
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Move backward
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should return to first question
      expect(screen.getByText(/what is the primary goal/i)).toBeInTheDocument();
    });

    it('displays error state on API failure', async () => {
      global.fetch = createMockFetch(
        { error: 'API Error' },
        { ok: false, status: 500 }
      );

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });

    it('validates required questions', async () => {
      global.fetch = createMockFetch({
        data: mockOpenAIResponses.clarificationQuestions,
      });

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/what is the primary goal/i)
        ).toBeInTheDocument();
      });

      // Try to submit without answering
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(
        screen.getByText(/please answer all required questions/i)
      ).toBeInTheDocument();
    });

    it('handles optional questions', async () => {
      const questionsWithOptional = [
        ...mockOpenAIResponses.clarificationQuestions,
        {
          id: '3',
          question: 'Optional question',
          type: 'text',
          required: false,
        },
      ];

      global.fetch = createMockFetch({ data: questionsWithOptional });

      render(<ClarificationFlow {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/optional question/i)).toBeInTheDocument();
      });

      // Should be able to submit without answering optional questions
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should proceed without validation error for optional question
    });
  });

  describe('BlueprintDisplay Component', () => {
    const mockBlueprint = mockUserJourney.blueprint;

    it('renders blueprint content correctly', () => {
      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      expect(screen.getByText(mockBlueprint.title)).toBeInTheDocument();
      expect(screen.getByText(mockBlueprint.description)).toBeInTheDocument();
    });

    it('displays phases and tasks', () => {
      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('renders export options', () => {
      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      expect(screen.getByText(/export options/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /markdown/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /notion/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /trello/i })
      ).toBeInTheDocument();
    });

    it('handles markdown export', async () => {
      global.fetch = createMockFetch({
        success: true,
        url: 'https://example.com/export.md',
        content: '# Test Project',
      });

      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      const markdownButton = screen.getByRole('button', { name: /markdown/i });
      await user.click(markdownButton);

      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument();
        expect(screen.getByText(/download markdown/i)).toBeInTheDocument();
      });
    });

    it('handles Notion export', async () => {
      global.fetch = createMockFetch({
        success: true,
        url: 'https://notion.so/test-page',
      });

      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      const notionButton = screen.getByRole('button', { name: /notion/i });
      await user.click(notionButton);

      await waitFor(() => {
        expect(screen.getByText(/view in notion/i)).toBeInTheDocument();
      });
    });

    it('shows error state on export failure', async () => {
      global.fetch = createMockFetch(
        { error: 'Export failed' },
        { ok: false, status: 500 }
      );

      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      const trelloButton = screen.getByRole('button', { name: /trello/i });
      await user.click(trelloButton);

      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });

    it('displays loading state during export', async () => {
      global.fetch = createMockFetch({ success: true }, { delay: 1000 });

      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      const githubButton = screen.getByRole('button', { name: /github/i });
      await user.click(githubButton);

      expect(screen.getByText(/exporting.../i)).toBeInTheDocument();
      expect(githubButton).toBeDisabled();
    });

    it('provides copy to clipboard functionality', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <BlueprintDisplay
          idea={mockUserJourney.ideaInput}
          answers={mockUserJourney.answers}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
    });
  });
});
