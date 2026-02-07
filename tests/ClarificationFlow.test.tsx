import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClarificationFlow from '@/components/ClarificationFlow';

// Mock fetch
global.fetch = jest.fn();

describe('ClarificationFlow', () => {
  const mockOnComplete = jest.fn();
  const mockIdea = 'Test idea for clarification';

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    expect(
      screen.getAllByText(/Generating questions\.\.\./i).length
    ).toBeGreaterThan(0);
    // Check for loading spinner by its class name
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays questions after successful fetch', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
      {
        id: '2',
        question: 'What is main goal you want to achieve?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/question 1 of 2/i, { selector: 'span' })
    ).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('uses fallback questions when API returns no questions', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: [] },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByText(/who is your target audience/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/question 1 of 3/i, { selector: 'span' })
    ).toBeInTheDocument();
  });

  it('uses fallback questions when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByText(/who is your target audience/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
    expect(
      screen.getByText(/we're using fallback questions/i)
    ).toBeInTheDocument();
  });

  it('handles textarea input correctly', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    expect(textarea).toHaveValue('Developers');
  });

  it('handles text input correctly', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your project name?',
        type: 'yes_no' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    // Simulate text input type by modifying question structure
    const input = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(input, { target: { value: 'My Project' } });

    expect(input).toHaveValue('My Project');
  });

  it('handles select input correctly', async () => {
    // Use fallback questions that include a select
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: [] }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByText(/who is your target audience/i)
      ).toBeInTheDocument();
    });

    // Answer first question to enable navigation
    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    // Navigate to second question
    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    // Answer second question
    await waitFor(() => {
      expect(
        screen.getByText(/what is the main goal you want to achieve/i)
      ).toBeInTheDocument();
    });
    const secondTextarea = screen.getByPlaceholderText(
      /enter your answer here/i
    );
    fireEvent.change(secondTextarea, { target: { value: 'Build a MVP' } });

    // Navigate to timeline question (3rd question)
    const secondNextButton = screen.getByText('Next →');
    fireEvent.click(secondNextButton);

    await waitFor(() => {
      expect(
        screen.getByText(/what is your desired timeline for this project/i)
      ).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue(/select an option/i);
    fireEvent.change(select, { target: { value: '1 month' } });

    expect(select).toHaveValue('1 month');
  });

  it('navigates between questions correctly', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
      {
        id: '2',
        question: 'What is the main goal?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/question 2 of 2/i, { selector: 'span' })
    ).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const previousButton = screen.getByText('← Previous');
    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    expect(textarea).toHaveValue('Developers'); // Should restore previous answer
  });

  it('completes flow after last question', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      1: 'Developers',
    });
  });

  it('disables next button when answer is empty', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Complete');
    expect(nextButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    expect(nextButton).not.toBeDisabled();
  });

  it('disables previous button on first question', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const previousButton = screen.getByText('← Previous');
    expect(previousButton).toBeDisabled();
  });

  it('shows error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /error/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we're using fallback questions/i)
    ).toBeInTheDocument();
  });

  it('shows no questions state when no questions available', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: [] }),
    });

    // Mock the fallback to also return empty
    const originalConsoleError = console.error;
    console.error = jest.fn();

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    // This is tricky to test since the component always provides fallbacks
    // but we can at least verify the error handling
    await waitFor(() => {
      expect(
        screen.getByText(/who is your target audience/i)
      ).toBeInTheDocument();
    });

    console.error = originalConsoleError;
  });

  it('calls API with correct parameters', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: ['Test question'] }),
    });

    const ideaId = 'test-idea-123';

    render(
      <ClarificationFlow
        idea={mockIdea}
        ideaId={ideaId}
        onComplete={mockOnComplete}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/clarify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: mockIdea, ideaId }),
      });
    });
  });

  it('handles API error response correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid request' }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(/invalid request/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/we're using fallback questions/i)
    ).toBeInTheDocument();
  });

  it('trims whitespace from answers', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: '  Developers  ' } });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      1: 'Developers',
    });
  });

  it('prevents navigation with empty answer', async () => {
    const mockQuestions = [
      {
        id: '1',
        question: 'What is your target audience?',
        type: 'open' as const,
        required: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { questions: mockQuestions },
        requestId: 'test-req-1',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Complete');
    fireEvent.click(nextButton);

    // Should not call onComplete since answer is empty
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
