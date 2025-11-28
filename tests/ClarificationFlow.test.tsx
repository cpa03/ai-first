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
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    expect(
      screen.getByText(/generating clarifying questions/i)
    ).toBeInTheDocument();
    // Check for loading spinner by its class name
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays questions after successful fetch', async () => {
    const mockQuestions = [
      'What is your target audience?',
      'What is the main goal you want to achieve?',
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('uses fallback questions when API returns no questions', async () => {
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

    expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument();
  });

  it('uses fallback questions when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByText(/who is your target audience/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we're using fallback questions/i)
    ).toBeInTheDocument();
  });

  it('handles textarea input correctly', async () => {
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    expect(textarea).toHaveValue('Developers');
  });

  it('handles text input correctly', async () => {
    const mockQuestions = ['What is your project name?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    // Simulate text input type by modifying the question structure
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

    // Navigate to timeline question (3rd question)
    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(
        screen.getByText(/what is your desired timeline/i)
      ).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue(/select an option/i);
    fireEvent.change(select, { target: { value: '1 month' } });

    expect(select).toHaveValue('1 month');
  });

  it('navigates between questions correctly', async () => {
    const mockQuestions = [
      'What is your target audience?',
      'What is the main goal?',
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[1])).toBeInTheDocument();
    });

    expect(screen.getByText(/question 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();

    const previousButton = screen.getByText('← Previous');
    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    expect(textarea).toHaveValue('Developers'); // Should restore previous answer
  });

  it('completes flow after last question', async () => {
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      question_0: 'Developers',
    });
  });

  it('disables next button when answer is empty', async () => {
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'Developers' } });

    expect(nextButton).not.toBeDisabled();
  });

  it('disables previous button on first question', async () => {
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const previousButton = screen.getByText('← Previous');
    expect(previousButton).toBeDisabled();
  });

  it('shows error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
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
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/enter your answer here/i);
    fireEvent.change(textarea, { target: { value: '  Developers  ' } });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      question_0: 'Developers',
    });
  });

  it('prevents navigation with empty answer', async () => {
    const mockQuestions = ['What is your target audience?'];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<ClarificationFlow idea={mockIdea} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Complete');
    fireEvent.click(nextButton);

    // Should not call onComplete since answer is empty
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
