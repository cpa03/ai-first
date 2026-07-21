import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PasswordRequirementsChecklist } from '@/components/PasswordRequirementsChecklist';

describe('PasswordRequirementsChecklist', () => {
  it('returns null when password is empty and showWhenEmpty is false', () => {
    const { container } = render(
      <PasswordRequirementsChecklist password="" showWhenEmpty={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when password is empty and showWhenEmpty is true', () => {
    render(<PasswordRequirementsChecklist password="" showWhenEmpty={true} />);

    // group with group role should be in the document
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Password requirements: 0 of 5 met');

    // Should render the progress bar
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');

    // All requirement items should be rendered as not met
    const lengthItem = screen.getByLabelText(/At least 8 characters: not met/i);
    expect(lengthItem).toBeInTheDocument();

    const uppercaseItem = screen.getByLabelText(/Contains uppercase letter: not met/i);
    expect(uppercaseItem).toBeInTheDocument();

    const lowercaseItem = screen.getByLabelText(/Contains lowercase letter: not met/i);
    expect(lowercaseItem).toBeInTheDocument();

    const numberItem = screen.getByLabelText(/Contains a number: not met/i);
    expect(numberItem).toBeInTheDocument();

    const specialItem = screen.getByLabelText(/Contains special character \(!@#\$%\^&\*\): not met/i);
    expect(specialItem).toBeInTheDocument();
  });

  it('correctly updates met status when partial password is provided', () => {
    // "Ab" has uppercase, lowercase, length = 2
    render(<PasswordRequirementsChecklist password="Ab" showWhenEmpty={true} />);

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Password requirements: 2 of 5 met');

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '2');

    // Met requirements: uppercase, lowercase
    expect(screen.getByLabelText(/Contains uppercase letter: met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains lowercase letter: met/i)).toBeInTheDocument();

    // Unmet requirements: length, number, special
    expect(screen.getByLabelText(/At least 8 characters: not met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains a number: not met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains special character \(!@#\$%\^&\*\): not met/i)).toBeInTheDocument();
  });

  it('shows success and celebration when all requirements are met', () => {
    // "Ab1!cdef" has length=8, uppercase, lowercase, number, special
    render(<PasswordRequirementsChecklist password="Ab1!cdef" showWhenEmpty={true} />);

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Password requirements: 5 of 5 met');

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '5');

    // All should be met
    expect(screen.getByLabelText(/At least 8 characters: met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains uppercase letter: met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains lowercase letter: met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains a number: met/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contains special character \(!@#\$%\^&\*\): met/i)).toBeInTheDocument();

    // Success status text should be rendered
    const statusText = screen.getByRole('status');
    expect(statusText).toHaveTextContent(/All requirements met/i);
  });
});
