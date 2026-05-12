import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaInput from '@/components/IdeaInput';

global.fetch = jest.fn();

describe('IdeaInput', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders textarea and submit button', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start clarifying/i })
    ).toBeInTheDocument();
  });

  it('submits idea when form is submitted', async () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/what's your idea/i);
    const submitButton = screen.getByRole('button', {
      name: /start clarifying/i,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    fireEvent.change(textarea, {
      target: { value: 'Test idea with more details' },
    });
    fireEvent.click(submitButton);

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

  it('disables submit button when idea is empty', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', {
      name: /start clarifying/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when idea is entered', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/what's your idea/i);
    const submitButton = screen.getByRole('button', {
      name: /start clarifying/i,
    });

    fireEvent.change(textarea, {
      target: { value: 'Test idea with more details' },
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows encouragement message after typing a few characters', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/what's your idea/i);

    fireEvent.change(textarea, {
      target: { value: 'A' },
    });

    const encouragementMessage = document.querySelector(
      '.text-primary-600.animate-fade-in'
    );
    expect(encouragementMessage).toBeInTheDocument();
    expect(encouragementMessage?.textContent).toContain('Great start');
  });

  it('renders the component with input area', () => {
    const mockOnSubmit = jest.fn();
    const { container } = render(<IdeaInput onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('displays keyboard shortcut hint', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    const helpText = document.getElementById('idea-input-help');
    expect(helpText).toBeInTheDocument();
    expect(helpText?.textContent).toContain('to submit');
  });

  it('renders submit button', () => {
    const mockOnSubmit = jest.fn();
    render(<IdeaInput onSubmit={mockOnSubmit} />);

    expect(
      screen.getByRole('button', { name: /start clarifying/i })
    ).toBeInTheDocument();
  });
});
