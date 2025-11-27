import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaInput from '@/components/IdeaInput';

describe('IdeaInput', () => {
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

    fireEvent.change(textarea, { target: { value: 'Test idea' } });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith('Test idea');
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

    fireEvent.change(textarea, { target: { value: 'Test idea' } });
    expect(submitButton).not.toBeDisabled();
  });
});
